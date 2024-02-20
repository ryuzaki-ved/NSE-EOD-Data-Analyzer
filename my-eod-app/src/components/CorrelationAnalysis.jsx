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
      
      // Calculate advanced data
      const advanced = calculateAdvancedCorrelations(participantData, selectedDate)
      setAdvancedData(advanced)
      
      // Calculate momentum indicators
      const momentum = calculateMomentumIndicators(participantData, selectedDate)
      setMomentumData(momentum)
    }
  }, [participantData, selectedDate])

  useEffect(() => {
    if (participantData && fiiData && participantData.length > 0 && fiiData.length > 0) {
      const correlations = calculateMarketCorrelations(participantData, fiiData)
      setMarketCorrelations(correlations)
    }
  }, [participantData, fiiData])

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

  // Prepare rolling correlation data (for historical analysis)
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

  // Prepare lagged correlation data (for historical analysis)
  const prepareLaggedCorrelationData = () => {
    if (!participantData || participantData.length === 0) return []

    const participant1Data = participantData.filter(item => item.client_type === selectedParticipant)
    const participant2Data = participantData.filter(item => item.client_type === 'FII')

    if (participant1Data.length === 0 || participant2Data.length === 0) return []

    const values1 = participant1Data.map(item => item[selectedMetric] || 0)
    const values2 = participant2Data.map(item => item[selectedMetric] || 0)

    return calculateLaggedCorrelations(values1, values2, 5)
  }

  const rollingCorrData = prepareRollingCorrelationData()
  const laggedCorrData = prepareLaggedCorrelationData()

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500">
          <BarChart3 className="h-6 w-6 text-white" />
        </div>
        <h2 className="text-3xl font-bold gradient-text">Advanced Correlation Analysis</h2>
        <div className="px-3 py-1 bg-blue-500/20 rounded-full text-xs text-blue-400 border border-blue-500/30">
          ADVANCED ANALYTICS
        </div>
      </div>

      {/* Date Selection */}
      <div className="glass-card p-6 border border-blue-500/20">
        <div className="flex items-center space-x-3 mb-4">
          <CalendarDays className="h-5 w-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-blue-400">Select Trading Date</h3>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Trading Date:
            </label>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 bg-dark-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
            >
              {availableDates.map(date => (
                <option key={date} value={date}>
                  {date} {date === getLatestDate(participantData) ? '(Latest)' : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="text-sm text-gray-400">
            <div>Available Dates: {availableDates.length}</div>
            <div>Latest: {getLatestDate(participantData)}</div>
            {advancedData.previousDate && (
              <div>Previous: {advancedData.previousDate}</div>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-dark-700 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('participant')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'participant'
              ? 'bg-primary-500 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <TrendingUp className="h-4 w-4 inline mr-2" />
          Position Similarities
        </button>
        <button
          onClick={() => setActiveTab('changes')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'changes'
              ? 'bg-primary-500 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <ArrowUpDown className="h-4 w-4 inline mr-2" />
          Position Changes
        </button>
        <button
          onClick={() => setActiveTab('momentum')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'momentum'
              ? 'bg-primary-500 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <TrendingDown className="h-4 w-4 inline mr-2" />
          Momentum Analysis
        </button>
        <button
          onClick={() => setActiveTab('change-correlations')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'change-correlations'
              ? 'bg-primary-500 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Activity className="h-4 w-4 inline mr-2" />
          Change Correlations
        </button>
        <button
          onClick={() => setActiveTab('market')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'market'
              ? 'bg-primary-500 text-white'
              : 'text-white'
          }`}
        >
          <BarChart3 className="h-4 w-4 inline mr-2" />
          Market Correlations
        </button>
        <button
          onClick={() => setActiveTab('rolling')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'rolling'
              ? 'bg-primary-500 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Calendar className="h-4 w-4 inline mr-2" />
          Historical Rolling
        </button>
      </div>

      {/* Position Similarities Tab */}
      {activeTab === 'participant' && (
        <div className="space-y-6">
          {/* Similarity Matrix */}
          <div className="glass-card p-6 border border-primary-500/20">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Target className="h-5 w-5 mr-2 text-primary-400" />
              Current Position Similarity Matrix - {selectedDate}
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-300">Participant</th>
                    {participants.map(participant => (
                      <th key={participant} className="text-center py-3 px-4 font-medium text-gray-300">
                        {participant}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {participants.map(participant1 => (
                    <tr key={participant1} className="border-b border-gray-800 hover:bg-white/5">
                      <td className="py-3 px-4 font-semibold text-primary-400">{participant1}</td>
                      {participants.map(participant2 => {
                        const similarity = participantCorrelations[participant1]?.[participant2]?.overall
                        return (
                          <td key={participant2} className="py-3 px-4 text-center">
                            <div className={`${getCorrelationColorClass(similarity)}`}>
                              {formatCorrelation(similarity)}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {similarity ? (similarity * 100).toFixed(1) + '% Similar' : 'N/A'}
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
          <div className="glass-card p-6 border border-green-500/20">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <ArrowUpDown className="h-5 w-5 mr-2 text-green-400" />
              Position Changes Analysis - {advancedData.previousDate} → {selectedDate}
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {participants.map(participant => {
                const summary = getPositionChangeSummary(advancedData.positionChanges, participant)
                if (!summary) return null
                
                return (
                  <div key={participant} className="p-4 bg-dark-700 rounded-lg border border-gray-600">
                    <h4 className="text-lg font-semibold text-white mb-3">{participant}</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Net Position Change:</span>
                        <span className={`font-semibold ${getPositionChangeColorClass(summary.netChange)}`}>
                          {formatPositionChange(summary.netChange)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Long Change:</span>
                        <span className={`font-semibold ${getPositionChangeColorClass(summary.longChange)}`}>
                          {formatPositionChange(summary.longChange)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Short Change:</span>
                        <span className={`font-semibold ${getPositionChangeColorClass(summary.shortChange)}`}>
                          {formatPositionChange(summary.shortChange)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Direction:</span>
                        <span className={`font-semibold ${
                          summary.direction === 'bullish' ? 'text-green-400' : 
                          summary.direction === 'bearish' ? 'text-red-400' : 'text-gray-400'
                        }`}>
                          {summary.direction.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Detailed Changes Table */}
          <div className="glass-card p-6 border border-cyan-500/20">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-cyan-400" />
              Detailed Position Changes
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-300">Participant</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-300">Metric</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-300">Previous</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-300">Current</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-300">Change</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-300">% Change</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map(participant => 
                    metrics.map(metric => {
                      const changeData = advancedData.positionChanges[participant]?.[metric.key]
                      if (!changeData) return null
                      
                      return (
                        <tr key={`${participant}-${metric.key}`} className="border-b border-gray-800 hover:bg-white/5">
                          <td className="py-3 px-4 font-semibold text-cyan-400">{participant}</td>
                          <td className="py-3 px-4 text-gray-300">{metric.label}</td>
                          <td className="py-3 px-4 text-center text-gray-400">
                            {changeData.previous.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-center text-white">
                            {changeData.current.toLocaleString()}
                          </td>
                          <td className={`py-3 px-4 text-center font-semibold ${getPositionChangeColorClass(changeData.change)}`}>
                            {formatPositionChange(changeData.change)}
                          </td>
                          <td className={`py-3 px-4 text-center font-semibold ${getPositionChangeColorClass(changeData.changePercent)}`}>
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
          <div className="glass-card p-6 border border-purple-500/20">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <TrendingDown className="h-5 w-5 mr-2 text-purple-400" />
              Momentum Indicators - {selectedDate}
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {participants.map(participant => {
                const momentum = momentumData[participant]
                if (!momentum) return null
                
                return (
                  <div key={participant} className="p-4 bg-dark-700 rounded-lg border border-gray-600">
                    <h4 className="text-lg font-semibold text-white mb-3">{participant}</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Momentum Score:</span>
                        <span className={`text-lg font-bold ${
                          momentum.momentumScore > 0 ? 'text-green-400' : 
                          momentum.momentumScore < 0 ? 'text-red-400' : 'text-gray-400'
                        }`}>
                          {momentum.momentumScore > 0 ? '+' : ''}{momentum.momentumScore.toFixed(1)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Direction:</span>
                        <span className={`font-semibold ${
                          momentum.overallDirection === 'bullish' ? 'text-green-400' : 
                          momentum.overallDirection === 'bearish' ? 'text-red-400' : 'text-gray-400'
                        }`}>
                          {momentum.overallDirection.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Strength:</span>
                        <span className={`font-semibold ${
                          momentum.strength === 'strong' ? 'text-yellow-400' : 
                          momentum.strength === 'moderate' ? 'text-blue-400' : 'text-gray-400'
                        }`}>
                          {momentum.strength.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Net Change:</span>
                        <span className={`font-semibold ${getPositionChangeColorClass(momentum.netPositionChange)}`}>
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
          <div className="glass-card p-6 border border-orange-500/20">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-orange-400" />
              Position Change Similarity Matrix - {advancedData.previousDate} → {selectedDate}
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-300">Participant</th>
                    {participants.map(participant => (
                      <th key={participant} className="text-center py-3 px-4 font-medium text-gray-300">
                        {participant}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {participants.map(participant1 => (
                    <tr key={participant1} className="border-b border-gray-800 hover:bg-white/5">
                      <td className="py-3 px-4 font-semibold text-orange-400">{participant1}</td>
                      {participants.map(participant2 => {
                        const similarity = advancedData.changeSimilarities[participant1]?.[participant2]?.overall
                        return (
                          <td key={participant2} className="py-3 px-4 text-center">
                            <div className={`${getCorrelationColorClass(similarity)}`}>
                              {formatCorrelation(similarity)}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {similarity ? (similarity * 100).toFixed(1) + '% Similar Changes' : 'N/A'}
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
        <div className="glass-card p-6 border border-green-500/20">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-400" />
            Market Behavior Correlations
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
                               <thead>
                   <tr className="border-b border-gray-700">
                     <th className="text-left py-3 px-4 font-medium text-gray-300">Participant</th>
                     <th className="text-center py-3 px-4 font-medium text-gray-300">Market Sentiment</th>
                     <th className="text-center py-3 px-4 font-medium text-gray-300">Market Consensus</th>
                     <th className="text-center py-3 px-4 font-medium text-gray-300">Market Volatility</th>
                     <th className="text-center py-3 px-4 font-medium text-gray-300">Market Liquidity</th>
                   </tr>
                 </thead>
                 <tbody>
                   {participants.map(participant => (
                     <tr key={participant} className="border-b border-gray-800 hover:bg-white/5">
                       <td className="py-3 px-4 font-semibold text-green-400">{participant}</td>
                       {['Market_Sentiment', 'Market_Consensus', 'Market_Volatility', 'Market_Liquidity'].map(indicator => {
                         const correlation = marketCorrelations[participant]?.[indicator]
                         
                         return (
                           <td key={indicator} className="py-3 px-4 text-center">
                             <div className={`${getCorrelationColorClass(correlation?.correlation)}`}>
                               {formatCorrelation(correlation?.correlation)}
                             </div>
                             <div className="text-xs text-gray-500 mt-1">
                               {correlation?.interpretation || 'N/A'}
                             </div>
                             {indicator === 'Market_Sentiment' && correlation?.avgMarketSentiment !== undefined && (
                               <div className="text-xs text-blue-400 mt-1">
                                 Avg: {correlation.avgMarketSentiment.toFixed(2)}
                               </div>
                             )}
                             {indicator === 'Market_Consensus' && correlation?.avgConsensus !== undefined && (
                               <div className="text-xs text-purple-400 mt-1">
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
          
                     <div className="mt-6 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
             <h4 className="text-sm font-medium text-green-400 mb-2">💡 Multi-Participant Market Correlation Insights:</h4>
             <ul className="text-xs text-gray-400 space-y-1">
               <li>• <strong>Market Sentiment:</strong> How participant positions align with overall market sentiment (average of other participants)</li>
               <li>• <strong>Market Consensus:</strong> How well participant agrees with the collective market view</li>
               <li>• <strong>Market Volatility:</strong> How participant positions change with FII activity levels</li>
               <li>• <strong>Market Liquidity:</strong> How participant positions respond to market liquidity changes</li>
               <li>• <strong>Positive Correlation:</strong> Participant follows market behavior</li>
               <li>• <strong>Negative Correlation:</strong> Participant acts contrarian to market behavior</li>
               <li>• <strong>Avg Sentiment:</strong> Average market sentiment score (-1 to +1)</li>
               <li>• <strong>Avg Consensus:</strong> Average consensus level with market (-1 to +1)</li>
             </ul>
           </div>
        </div>
      )}

      {/* Rolling Correlations Tab */}
      {activeTab === 'rolling' && (
        <div className="space-y-6">
          <div className="glass-card p-6 border border-purple-500/20">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-purple-400" />
              Historical Rolling Correlation Analysis
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Participant:
                </label>
                <select
                  value={selectedParticipant}
                  onChange={(e) => setSelectedParticipant(e.target.value)}
                  className="w-full px-3 py-2 bg-dark-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  {participants.map(participant => (
                    <option key={participant} value={participant}>{participant}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Metric:
                </label>
                <select
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value)}
                  className="w-full px-3 py-2 bg-dark-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  {metrics.map(metric => (
                    <option key={metric.key} value={metric.key}>{metric.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Rolling Window:
                </label>
                <select
                  value={rollingWindow}
                  onChange={(e) => setRollingWindow(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-dark-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value={3}>3 Days</option>
                  <option value={5}>5 Days</option>
                  <option value={10}>10 Days</option>
                  <option value={15}>15 Days</option>
                </select>
              </div>
            </div>

            {rollingCorrData.length > 0 && (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={rollingCorrData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="day" 
                      stroke="#9CA3AF"
                      label={{ value: 'Trading Day', position: 'insideBottom', offset: -10 }}
                    />
                    <YAxis 
                      stroke="#9CA3AF"
                      domain={[-1, 1]}
                      label={{ value: 'Correlation', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="correlation" 
                      stroke="#8B5CF6" 
                      strokeWidth={2}
                      dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#8B5CF6', strokeWidth: 2 }}
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