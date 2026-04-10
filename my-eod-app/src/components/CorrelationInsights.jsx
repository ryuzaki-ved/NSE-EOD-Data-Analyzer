import React, { useState, useEffect } from 'react'
import { 
  calculateParticipantCorrelations, 
  getCorrelationStrength, 
  getCorrelationDirection, 
  formatCorrelation, 
  getCorrelationColorClass,
  getAvailableDates,
  getLatestDate
} from '../utils/correlationHelpers'
import { TrendingUp, CalendarDays, Filter } from 'lucide-react'

const CorrelationInsights = ({ participantData }) => {
  const [participantCorrelations, setParticipantCorrelations] = useState({})
  const [selectedDate, setSelectedDate] = useState('')
  const [availableDates, setAvailableDates] = useState([])
  const [selectedInstrument, setSelectedInstrument] = useState('current')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (participantData && participantData.length > 0) {
      const dates = getAvailableDates(participantData)
      setAvailableDates(dates)
      const latestDate = getLatestDate(participantData)
      setSelectedDate(latestDate)
      setLoading(false)
    }
  }, [participantData])

  useEffect(() => {
    if (participantData && participantData.length > 0 && selectedDate) {
      const correlations = calculateParticipantCorrelations(participantData, selectedDate, selectedInstrument)
      setParticipantCorrelations(correlations)
    }
  }, [participantData, selectedDate, selectedInstrument])

  if (loading) {
    return (
      <div className="glass-card p-6 border border-white/[0.07]">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-white/[0.05] rounded w-3/4"></div>
          <div className="h-3 bg-white/[0.03] rounded w-1/2"></div>
          <div className="h-3 bg-white/[0.03] rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  const getTopSimilarities = () => {
    const similarities = []
    const participants = ['Client', 'DII', 'FII', 'Pro']
    
    participants.forEach(participant1 => {
      participants.forEach(participant2 => {
        if (participant1 !== participant2) {
          const similarity = participantCorrelations[participant1]?.[participant2]?.overall
          const changeSimilarity = participantCorrelations[participant1]?.[participant2]?.changeOverall
          if (similarity !== null && similarity !== undefined) {
            similarities.push({
              pair: `${participant1} ↔ ${participant2}`,
              similarity: similarity,
              changeSimilarity: changeSimilarity,
              strength: getCorrelationStrength(similarity),
              changeStrength: changeSimilarity ? getCorrelationStrength(changeSimilarity) : null,
              direction: getCorrelationDirection(similarity),
              changeDirection: changeSimilarity ? getCorrelationDirection(changeSimilarity) : null
            })
          }
        }
      })
    })
    
    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3)
  }

  const topSimilarities = getTopSimilarities()

  return (
    <div className="glass-card p-6 border border-white/[0.07]">
      <div className="flex items-center space-x-3 mb-5">
        <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <TrendingUp className="h-5 w-5 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">Quick Correlation Summary</h3>
          <p className="text-xs text-slate-400">Key desk alignments for the selected session</p>
        </div>
      </div>

      {/* Date and Instrument Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center">
            <CalendarDays className="h-3.5 w-3.5 mr-1 text-slate-400" />
            Trading Date
          </label>
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-1.5 bg-[#0B0F19] border border-white/[0.08] rounded-lg text-xs font-medium text-slate-300 focus:ring-1 focus:ring-emerald-500/40 focus:border-emerald-500/40 outline-none transition-colors"
          >
            {availableDates.map(date => (
              <option key={date} value={date}>
                {date} {date === getLatestDate(participantData) ? '(Latest)' : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center">
            <Filter className="h-3.5 w-3.5 mr-1 text-slate-400" />
            Instrument Scope
          </label>
          <select
            value={selectedInstrument}
            onChange={(e) => setSelectedInstrument(e.target.value)}
            className="w-full px-3 py-1.5 bg-[#0B0F19] border border-white/[0.08] rounded-lg text-xs font-medium text-slate-300 focus:ring-1 focus:ring-emerald-500/40 focus:border-emerald-500/40 outline-none transition-colors"
          >
            <option value="current">All Instruments (Overall)</option>
            <option value="options">Options Only</option>
            <option value="futures">Futures Only</option>
          </select>
        </div>
      </div>

      {/* Top Similarities */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Top Pair Alignments:</h4>
        {topSimilarities.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-3.5 bg-[#0B0F19]/60 border border-white/[0.06] rounded-xl">
            <div className="flex-1">
              <div className="text-xs font-bold text-white">{item.pair}</div>
              <div className="text-[10px] text-slate-400 mt-0.5 font-medium">{item.strength} • {item.direction}</div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <div className="text-[10px] text-slate-500 mb-0.5">Overall</div>
                <div className={`text-xs font-mono font-bold ${getCorrelationColorClass(item.similarity)}`}>
                  {formatCorrelation(item.similarity)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-500 mb-0.5">Day Change</div>
                <div className={`text-xs font-mono font-bold ${item.changeSimilarity ? getCorrelationColorClass(item.changeSimilarity) : 'text-slate-500'}`}>
                  {item.changeSimilarity ? formatCorrelation(item.changeSimilarity) : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Insights */}
      <div className="mt-4 p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/15">
        <h4 className="text-xs font-bold text-emerald-400 mb-1.5">Interpretation Key:</h4>
        <ul className="text-[11px] text-slate-400 space-y-1">
          <li>• <strong className="text-slate-300">High positive (&gt;0.7):</strong> Closely aligned trading bias</li>
          <li>• <strong className="text-slate-300">Negative (&lt;0):</strong> Contrarian opposing positioning</li>
          <li>• <strong className="text-slate-300">Near 0:</strong> Independent structural strategies</li>
        </ul>
      </div>
    </div>
  )
}

export default CorrelationInsights