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
import { TrendingUp, CalendarDays } from 'lucide-react'

const CorrelationInsights = ({ participantData }) => {
  const [participantCorrelations, setParticipantCorrelations] = useState({})
  const [selectedDate, setSelectedDate] = useState('')
  const [availableDates, setAvailableDates] = useState([])
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
      const correlations = calculateParticipantCorrelations(participantData, selectedDate)
      setParticipantCorrelations(correlations)
    }
  }, [participantData, selectedDate])

  if (loading) {
    return (
      <div className="glass-card p-6 border border-blue-500/20">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-600 rounded w-3/4 mb-4"></div>
          <div className="h-3 bg-gray-600 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-600 rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  // Get top 3 participant similarities
  const getTopSimilarities = () => {
    const similarities = []
    const participants = ['Client', 'DII', 'FII', 'Pro']
    
    participants.forEach(participant1 => {
      participants.forEach(participant2 => {
        if (participant1 !== participant2) {
          const similarity = participantCorrelations[participant1]?.[participant2]?.overall
          if (similarity !== null && similarity !== undefined) {
            similarities.push({
              pair: `${participant1} ↔ ${participant2}`,
              similarity: similarity,
              strength: getCorrelationStrength(similarity),
              direction: getCorrelationDirection(similarity)
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
    <div className="glass-card p-6 border border-blue-500/20">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500">
          <TrendingUp className="h-5 w-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-blue-400">Quick Correlation Insights</h3>
      </div>

      {/* Date Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <CalendarDays className="h-4 w-4 inline mr-1" />
          Date: {selectedDate}
        </label>
        <select
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full px-3 py-2 bg-dark-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white text-sm"
        >
          {availableDates.map(date => (
            <option key={date} value={date}>
              {date} {date === getLatestDate(participantData) ? '(Latest)' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Top Similarities */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-300">Top Participant Similarities:</h4>
        {topSimilarities.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
            <div className="flex-1">
              <div className="text-sm font-medium text-white">{item.pair}</div>
              <div className="text-xs text-gray-400">{item.strength} • {item.direction}</div>
            </div>
            <div className={`text-sm font-bold ${getCorrelationColorClass(item.similarity)}`}>
              {formatCorrelation(item.similarity)}
            </div>
          </div>
        ))}
      </div>

      {/* Insights */}
      <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
        <h4 className="text-sm font-medium text-blue-400 mb-2">💡 Key Insights:</h4>
        <ul className="text-xs text-gray-400 space-y-1">
          <li>• Higher values = More similar trading patterns</li>
          <li>• Lower values = Different trading strategies</li>
          <li>• Perfect similarity (1.0) = Identical position ratios</li>
          <li>• Zero similarity (0.0) = Completely different approaches</li>
        </ul>
      </div>
    </div>
  )
}

export default CorrelationInsights 