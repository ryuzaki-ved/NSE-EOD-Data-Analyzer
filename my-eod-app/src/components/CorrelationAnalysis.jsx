import React, { useState, useEffect } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { 
  calculateParticipantCorrelations, 
  calculateMarketCorrelations,
  calculateRollingCorrelation,
  calculateLaggedCorrelations,
  getCorrelationStrength,
  getCorrelationDirection,
  formatCorrelation,
  getCorrelationColorClass,
  getAvailableDates,
  getLatestDate,
  getParticipantDataForDate,
  calculateAdvancedCorrelations,
  calculateMomentumIndicators,
  getPositionChangeSummary,
  formatPositionChange,
  getPositionChangeColorClass
} from '../utils/correlationHelpers'
import { TrendingUp, BarChart3, Activity, Target, Calendar, Zap, CalendarDays, TrendingDown, ArrowUpDown } from 'lucide-react'

const CorrelationAnalysis = ({ participantData, fiiData }) => {
  const [participantCorrelations, setParticipantCorrelations] = useState({})
  const [marketCorrelations, setMarketCorrelations] = useState({})
  const [advancedData, setAdvancedData] = useState({})
  const [momentumData, setMomentumData] = useState({})
  const [selectedParticipant, setSelectedParticipant] = useState('Client')
  const [selectedMetric, setSelectedMetric] = useState('total_long_contracts')
  const [rollingWindow, setRollingWindow] = useState(5)
  const [activeTab, setActiveTab] = useState('participant')
  const [selectedDate, setSelectedDate] = useState('')
  const [availableDates, setAvailableDates] = useState([])
  const [metricGroup, setMetricGroup] = useState('futures')

  useEffect(() => {
    if (participantData && participantData.length > 0) {
      const dates = getAvailableDates(participantData)
      setAvailableDates(dates)
      const latestDate = getLatestDate(participantData)
      setSelectedDate(latestDate)
    }
  }, [participantData])

  useEffect(() => {
    if (participantData && participantData.length > 0 && selectedDate) {
      const correlations = calculateParticipantCorrelations(participantData, selectedDate)
      setParticipantCorrelations(correlations)
      
      const advanced = calculateAdvancedCorrelations(participantData, selectedDate)
      setAdvancedData(advanced)
      
      const momentum = calculateMomentumIndicators(participantData, selectedDate)
      setMomentumData(momentum)
    }
  }, [participantData, selectedDate])

  useEffect(() => {
    if (participantData && fiiData && participantData.length > 0 && fiiData.length > 0) {
      const correlations = calculateMarketCorrelations(participantData, fiiData, metricGroup)
      setMarketCorrelations(correlations)
    }
  }, [participantData, fiiData, metricGroup])

  const participants = ['Client', 'DII', 'FII', 'Pro']
  const metrics = [
    { key: 'total_long_contracts', label: 'Total Long Contracts' },
    { key: 'total_short_contracts', label: 'Total Short Contracts' },
    { key: 'future_index_long', label: 'Future Index Long' },
    { key: 'future_index_short', label: 'Future Index Short' },
    { key: 'option_index_call_long', label: 'Option Call Long' },
    { key: 'option_index_put_long', label: 'Option Put Long' },
    { key: 'option_index_call_short', label: 'Option Call Short' },
    { key: 'option_index_put_short', label: 'Option Put Short' }
  ]

  const prepareRollingCorrelationData = () => {
    if (!participantData || participantData.length === 0) return []

    const participant1Data = participantData.filter(item => item.client_type === selectedParticipant)
    const participant2Data = participantData.filter(item => item.client_type === 'FII')

    if (participant1Data.length === 0 || participant2Data.length === 0) return []

    const values1 = participant1Data.map(item => item[selectedMetric] || 0)
    const values2 = participant2Data.map(item => item[selectedMetric] || 0)

    const rollingCorr = calculateRollingCorrelation(values1, values2, rollingWindow)
    
    return rollingCorr.map((corr, index) => ({
      day: index + rollingWindow,
      correlation: corr
    }))
  }

  const rollingCorrData = prepareRollingCorrelationData()

  const tabs = [
    { id: 'participant', label: 'Position Similarities', icon: TrendingUp },
    { id: 'changes', label: 'Position Changes', icon: ArrowUpDown },
    { id: 'momentum', label: 'Momentum Analysis', icon: TrendingDown },
    { id: 'change-correlations', label: 'Change Correlations', icon: Activity },
    { id: 'market', label: 'Market Correlations', icon: BarChart3 },
    { id: 'rolling', label: 'Historical Rolling', icon: Calendar }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <BarChart3 className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Correlation & Market Dynamics</h2>
            <p className="text-xs text-slate-400 mt-0.5">Cross-participant alignment and behavioral correlation</p>
          </div>
        </div>
        <div className="badge-emerald">
          CORRELATION ENGINE
        </div>
      </div>

      {/* Control Bar */}
      <div className="glass-card p-4 border border-white/[0.07] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <CalendarDays className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-semibold text-slate-300">Trading Date:</span>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 bg-[#0B0F19] border border-white/[0.08] rounded-lg text-xs font-medium text-slate-300 focus:ring-1 focus:ring-emerald-500/40 focus:border-emerald-500/40 outline-none transition-colors"
            >
              {availableDates.map(date => (
                <option key={date} value={date}>
                  {date} {date === getLatestDate(participantData) ? '(Latest)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-400">Metric Group:</span>
            <select
              value={metricGroup}
              onChange={e => setMetricGroup(e.target.value)}
              className="px-3 py-1.5 bg-[#0B0F19] border border-white/[0.08] rounded-lg text-xs font-medium text-slate-300 focus:ring-1 focus:ring-emerald-500/40 focus:border-emerald-500/40 outline-none transition-colors"
            >
              <option value="futures">Futures Only</option>
              <option value="options">Options Only</option>
              <option value="futures_options">Futures + Options</option>
              <option value="all">All (Total Long/Short)</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          Available: <span className="text-slate-300">{availableDates.length}</span> sessions
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex overflow-x-auto gap-1.5 p-1 bg-[#0B0F19]/60 border border-white/[0.06] rounded-xl">
        {tabs.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Position Similarities Tab */}
      {activeTab === 'participant' && (
        <div className="space-y-6">
          <div className="glass-card p-6 border border-white/[0.07]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center">
                <Target className="h-4 w-4 mr-2 text-emerald-400" />
                Current Position Similarity Matrix — {selectedDate}
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/[0.08]">
                    <th className="text-left py-3 px-4 font-semibold text-slate-400 uppercase tracking-wider">Participant</th>
                    {participants.map(participant => (
                      <th key={participant} className="text-center py-3 px-4 font-semibold text-slate-400 uppercase tracking-wider">
                        {participant}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {participants.map(participant1 => (
                    <tr key={participant1} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 font-bold text-cyan-400">{participant1}</td>
                      {participants.map(participant2 => {
                        const similarity = participantCorrelations[participant1]?.[participant2]?.overall
                        return (
                          <td key={participant2} className="py-3 px-4 text-center">
                            <div className={`font-mono font-bold ${getCorrelationColorClass(similarity)}`}>
                              {formatCorrelation(similarity)}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              {similarity ? (similarity * 100).toFixed(1) + '% match' : 'N/A'}
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Position Changes Tab */}
      {activeTab === 'changes' && (
        <div className="space-y-6">
          <div className="glass-card p-6 border border-white/[0.07]">
            <h3 className="text-base font-bold text-white tracking-tight mb-4 flex items-center">
              <ArrowUpDown className="h-4 w-4 mr-2 text-emerald-400" />
              Position Changes Analysis — {advancedData.previousDate} → {selectedDate}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {participants.map(participant => {
                const summary = getPositionChangeSummary(advancedData.positionChanges, participant)
                if (!summary) return null
                
                return (
                  <div key={participant} className="p-4 bg-[#0B0F19]/60 rounded-xl border border-white/[0.06]">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-bold text-white">{participant}</h4>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        summary.direction === 'bullish' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                        summary.direction === 'bearish' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 
                        'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                      }`}>
                        {summary.direction.toUpperCase()}
                      </span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Net Change:</span>
                        <span className={`font-mono font-semibold ${getPositionChangeColorClass(summary.netChange)}`}>
                          {formatPositionChange(summary.netChange)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Long Change:</span>
                        <span className={`font-mono font-semibold ${getPositionChangeColorClass(summary.longChange)}`}>
                          {formatPositionChange(summary.longChange)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Short Change:</span>
                        <span className={`font-mono font-semibold ${getPositionChangeColorClass(summary.shortChange)}`}>
                          {formatPositionChange(summary.shortChange)}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Detailed Changes Table */}
          <div className="glass-card p-6 border border-white/[0.07]">
            <h3 className="text-base font-bold text-white tracking-tight mb-4 flex items-center">
              <Activity className="h-4 w-4 mr-2 text-cyan-400" />
              Detailed Position Changes
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/[0.08]">
                    <th className="text-left py-3 px-4 font-semibold text-slate-400 uppercase tracking-wider">Participant</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-400 uppercase tracking-wider">Metric</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-400 uppercase tracking-wider">Previous</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-400 uppercase tracking-wider">Current</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-400 uppercase tracking-wider">Change</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-400 uppercase tracking-wider">% Change</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {participants.map(participant => 
                    metrics.map(metric => {
                      const changeData = advancedData.positionChanges[participant]?.[metric.key]
                      if (!changeData) return null
                      
                      return (
                        <tr key={`${participant}-${metric.key}`} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 px-4 font-bold text-cyan-400">{participant}</td>
                          <td className="py-3 px-4 text-slate-300">{metric.label}</td>
                          <td className="py-3 px-4 text-right font-mono text-slate-400 tabular-nums">
                            {changeData.previous.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-white tabular-nums">
                            {changeData.current.toLocaleString('en-IN')}
                          </td>
                          <td className={`py-3 px-4 text-right font-mono font-semibold tabular-nums ${getPositionChangeColorClass(changeData.change)}`}>
                            {formatPositionChange(changeData.change)}
                          </td>
                          <td className={`py-3 px-4 text-right font-mono font-semibold tabular-nums ${getPositionChangeColorClass(changeData.changePercent)}`}>
                            {changeData.changePercent > 0 ? '+' : ''}{changeData.changePercent.toFixed(1)}%
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Momentum Analysis Tab */}
      {activeTab === 'momentum' && (
        <div className="space-y-6">
          <div className="glass-card p-6 border border-white/[0.07]">
            <h3 className="text-base font-bold text-white tracking-tight mb-4 flex items-center">
              <TrendingDown className="h-4 w-4 mr-2 text-emerald-400" />
              Momentum Indicators — {selectedDate}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {participants.map(participant => {
                const momentum = momentumData[participant]
                if (!momentum) return null
                
                return (
                  <div key={participant} className="p-4 bg-[#0B0F19]/60 rounded-xl border border-white/[0.06]">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-bold text-white">{participant}</h4>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        momentum.overallDirection === 'bullish' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                        momentum.overallDirection === 'bearish' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 
                        'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                      }`}>
                        {momentum.overallDirection.toUpperCase()}
                      </span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Score:</span>
                        <span className={`font-mono font-bold ${
                          momentum.momentumScore > 0 ? 'text-emerald-400' : 
                          momentum.momentumScore < 0 ? 'text-rose-400' : 'text-slate-400'
                        }`}>
                          {momentum.momentumScore > 0 ? '+' : ''}{momentum.momentumScore.toFixed(1)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Strength:</span>
                        <span className={`font-semibold ${
                          momentum.strength === 'strong' ? 'text-amber-400' : 
                          momentum.strength === 'moderate' ? 'text-cyan-400' : 'text-slate-400'
                        }`}>
                          {momentum.strength.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Net Change:</span>
                        <span className={`font-mono font-semibold ${getPositionChangeColorClass(momentum.netPositionChange)}`}>
                          {formatPositionChange(momentum.netPositionChange)}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Change Correlations Tab */}
      {activeTab === 'change-correlations' && (
        <div className="space-y-6">
          <div className="glass-card p-6 border border-white/[0.07]">
            <h3 className="text-base font-bold text-white tracking-tight mb-4 flex items-center">
              <Activity className="h-4 w-4 mr-2 text-amber-400" />
              Position Change Similarity Matrix — {advancedData.previousDate} → {selectedDate}
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/[0.08]">
                    <th className="text-left py-3 px-4 font-semibold text-slate-400 uppercase tracking-wider">Participant</th>
                    {participants.map(participant => (
                      <th key={participant} className="text-center py-3 px-4 font-semibold text-slate-400 uppercase tracking-wider">
                        {participant}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {participants.map(participant1 => (
                    <tr key={participant1} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 font-bold text-amber-400">{participant1}</td>
                      {participants.map(participant2 => {
                        const similarity = advancedData.changeSimilarities[participant1]?.[participant2]?.overall
                        return (
                          <td key={participant2} className="py-3 px-4 text-center">
                            <div className={`font-mono font-bold ${getCorrelationColorClass(similarity)}`}>
                              {formatCorrelation(similarity)}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              {similarity ? (similarity * 100).toFixed(1) + '% Match' : 'N/A'}
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Market Correlations Tab */}
      {activeTab === 'market' && (
        <div className="glass-card p-6 border border-white/[0.07]">
          <h3 className="text-base font-bold text-white tracking-tight mb-4 flex items-center">
            <TrendingUp className="h-4 w-4 mr-2 text-emerald-400" />
            Market Behavior Correlations
          </h3>
          
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/[0.08]">
                  <th className="text-left py-3 px-4 font-semibold text-slate-400 uppercase tracking-wider">Participant</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-400 uppercase tracking-wider">Market Sentiment</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-400 uppercase tracking-wider">Market Consensus</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-400 uppercase tracking-wider">Market Volatility</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-400 uppercase tracking-wider">Market Liquidity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {participants.map(participant => (
                  <tr key={participant} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 font-bold text-emerald-400">{participant}</td>
                    {['Market_Sentiment', 'Market_Consensus', 'Market_Volatility', 'Market_Liquidity'].map(indicator => {
                      const correlation = marketCorrelations[participant]?.[indicator]
                      
                      return (
                        <td key={indicator} className="py-3 px-4 text-center">
                          <div className={`font-mono font-bold ${getCorrelationColorClass(correlation?.correlation)}`}>
                            {formatCorrelation(correlation?.correlation)}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {correlation?.interpretation || 'N/A'}
                          </div>
                          {indicator === 'Market_Sentiment' && correlation?.avgMarketSentiment !== undefined && (
                            <div className="text-[10px] text-cyan-400 mt-0.5 font-mono">
                              Avg: {correlation.avgMarketSentiment.toFixed(2)}
                            </div>
                          )}
                          {indicator === 'Market_Consensus' && correlation?.avgConsensus !== undefined && (
                            <div className="text-[10px] text-amber-400 mt-0.5 font-mono">
                              Avg: {correlation.avgConsensus.toFixed(2)}
                            </div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/15">
            <h4 className="text-xs font-bold text-emerald-400 mb-2">Cross-Participant Correlation Guide:</h4>
            <ul className="text-xs text-slate-400 space-y-1">
              <li>• <strong className="text-slate-300">Market Sentiment:</strong> How participant positions align with overall market sentiment.</li>
              <li>• <strong className="text-slate-300">Market Consensus:</strong> How well participant agrees with the collective market view.</li>
              <li>• <strong className="text-slate-300">Market Volatility:</strong> How participant positions change with FII activity levels.</li>
              <li>• <strong className="text-slate-300">Market Liquidity:</strong> How participant positions respond to liquidity shifts.</li>
            </ul>
          </div>
        </div>
      )}

      {/* Rolling Correlations Tab */}
      {activeTab === 'rolling' && (
        <div className="space-y-6">
          <div className="glass-card p-6 border border-white/[0.07]">
            <h3 className="text-base font-bold text-white tracking-tight mb-4 flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-cyan-400" />
              Historical Rolling Correlation Analysis
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Participant:
                </label>
                <select
                  value={selectedParticipant}
                  onChange={(e) => setSelectedParticipant(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#0B0F19] border border-white/[0.08] rounded-lg text-xs font-medium text-slate-300 focus:ring-1 focus:ring-emerald-500/40 focus:border-emerald-500/40 outline-none transition-colors"
                >
                  {participants.map(participant => (
                    <option key={participant} value={participant}>{participant}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Metric:
                </label>
                <select
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#0B0F19] border border-white/[0.08] rounded-lg text-xs font-medium text-slate-300 focus:ring-1 focus:ring-emerald-500/40 focus:border-emerald-500/40 outline-none transition-colors"
                >
                  {metrics.map(metric => (
                    <option key={metric.key} value={metric.key}>{metric.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Rolling Window:
                </label>
                <select
                  value={rollingWindow}
                  onChange={(e) => setRollingWindow(parseInt(e.target.value))}
                  className="w-full px-3 py-1.5 bg-[#0B0F19] border border-white/[0.08] rounded-lg text-xs font-medium text-slate-300 focus:ring-1 focus:ring-emerald-500/40 focus:border-emerald-500/40 outline-none transition-colors"
                >
                  <option value={3}>3 Days</option>
                  <option value={5}>5 Days</option>
                  <option value={10}>10 Days</option>
                  <option value={15}>15 Days</option>
                </select>
              </div>
            </div>

            {rollingCorrData.length > 0 && (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={rollingCorrData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                    <XAxis 
                      dataKey="day" 
                      stroke="#64748B"
                      fontSize={11}
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="#64748B"
                      domain={[-1, 1]}
                      fontSize={11}
                      tickLine={false}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(11, 15, 25, 0.95)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        color: '#e2e8f0',
                        backdropFilter: 'blur(12px)',
                      }}
                      itemStyle={{ color: '#e2e8f0', fontSize: 12 }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '12px' }}
                      formatter={(value) => <span className="text-xs text-slate-300 font-medium">{value}</span>}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="correlation" 
                      stroke="#38BDF8" 
                      strokeWidth={2.5}
                      dot={{ fill: '#38BDF8', strokeWidth: 0, r: 3 }}
                      activeDot={{ r: 5, stroke: '#38BDF8', strokeWidth: 2, fill: '#0B0F19' }}
                      name="Correlation"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default CorrelationAnalysis