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
  getCorrelationColorClass
} from '../utils/correlationHelpers'
import { TrendingUp, BarChart3, Activity, Target, Calendar, Zap } from 'lucide-react'

const CorrelationAnalysis = ({ participantData, fiiData }) => {
  const [participantCorrelations, setParticipantCorrelations] = useState({})
  const [marketCorrelations, setMarketCorrelations] = useState({})
  const [selectedParticipant, setSelectedParticipant] = useState('Client')
  const [selectedMetric, setSelectedMetric] = useState('total_long_contracts')
  const [rollingWindow, setRollingWindow] = useState(5)
  const [activeTab, setActiveTab] = useState('participant')

  useEffect(() => {
    if (participantData && participantData.length > 0) {
      const correlations = calculateParticipantCorrelations(participantData)
      setParticipantCorrelations(correlations)
    }
  }, [participantData])

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



  // Prepare rolling correlation data
  const prepareRollingCorrelationData = () => {
    if (!participantData || participantData.length === 0) return []

    const participant1Data = participantData.filter(item => item.client_type === selectedParticipant)
    const participant2Data = participantData.filter(item => item.client_type === 'FII') // Compare with FII

    if (participant1Data.length === 0 || participant2Data.length === 0) return []

    const values1 = participant1Data.map(item => item[selectedMetric] || 0)
    const values2 = participant2Data.map(item => item[selectedMetric] || 0)

    const rollingCorr = calculateRollingCorrelation(values1, values2, rollingWindow)
    
    return rollingCorr.map((corr, index) => ({
      day: index + rollingWindow,
      correlation: corr
    }))
  }

  // Prepare lagged correlation data
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
        <h2 className="text-3xl font-bold gradient-text">Correlation Analysis</h2>
        <div className="px-3 py-1 bg-blue-500/20 rounded-full text-xs text-blue-400 border border-blue-500/30">
          ADVANCED ANALYTICS
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
          Participant Correlations
        </button>
        <button
          onClick={() => setActiveTab('market')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'market'
              ? 'bg-primary-500 text-white'
              : 'text-white'
          }`}
        >
          <Activity className="h-4 w-4 inline mr-2" />
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
          Rolling Correlations
        </button>
        <button
          onClick={() => setActiveTab('lagged')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'lagged'
              ? 'bg-primary-500 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Zap className="h-4 w-4 inline mr-2" />
          Lagged Correlations
        </button>
      </div>

      {/* Participant Correlations Tab */}
      {activeTab === 'participant' && (
        <div className="space-y-6">
          {/* Correlation Matrix */}
          <div className="glass-card p-6 border border-primary-500/20">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Target className="h-5 w-5 mr-2 text-primary-400" />
              Participant Correlation Matrix
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
                        const correlation = participantCorrelations[participant1]?.[participant2]?.overall
                        return (
                          <td key={participant2} className="py-3 px-4 text-center">
                            <div className={`${getCorrelationColorClass(correlation)}`}>
                              {formatCorrelation(correlation)}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {getCorrelationStrength(correlation)}
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

          {/* Detailed Metric Correlations */}
          <div className="glass-card p-6 border border-cyan-500/20">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-cyan-400" />
              Detailed Metric Correlations
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select Participant:
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
                  Select Metric:
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
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-300">Metric</th>
                    {participants.filter(p => p !== selectedParticipant).map(participant => (
                      <th key={participant} className="text-center py-3 px-4 font-medium text-gray-300">
                        vs {participant}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {metrics.map(metric => (
                    <tr key={metric.key} className="border-b border-gray-800 hover:bg-white/5">
                      <td className="py-3 px-4 font-semibold text-cyan-400">{metric.label}</td>
                      {participants.filter(p => p !== selectedParticipant).map(participant => {
                        const correlation = participantCorrelations[selectedParticipant]?.[participant]?.metrics?.[metric.key]
                        return (
                          <td key={participant} className="py-3 px-4 text-center">
                            <div className={`${getCorrelationColorClass(correlation)}`}>
                              {formatCorrelation(correlation)}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {getCorrelationDirection(correlation)}
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
            Market Indicator Correlations
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-300">Participant</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-300">FII Net Flow</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-300">FII Buy Amount</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-300">FII Sell Amount</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-300">FII OI Amount</th>
                </tr>
              </thead>
              <tbody>
                {participants.map(participant => (
                  <tr key={participant} className="border-b border-gray-800 hover:bg-white/5">
                    <td className="py-3 px-4 font-semibold text-green-400">{participant}</td>
                    {['FII_Net_Flow', 'FII_Buy_Amount', 'FII_Sell_Amount', 'FII_OI_Amount'].map(indicator => {
                      const longCorr = marketCorrelations[participant]?.[indicator]?.total_long_contracts
                      const shortCorr = marketCorrelations[participant]?.[indicator]?.total_short_contracts
                      const avgCorr = longCorr && shortCorr ? (longCorr + shortCorr) / 2 : null
                      
                      return (
                        <td key={indicator} className="py-3 px-4 text-center">
                          <div className={`${getCorrelationColorClass(avgCorr)}`}>
                            {formatCorrelation(avgCorr)}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {getCorrelationStrength(avgCorr)}
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
      )}

      {/* Rolling Correlations Tab */}
      {activeTab === 'rolling' && (
        <div className="space-y-6">
          <div className="glass-card p-6 border border-purple-500/20">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-purple-400" />
              Rolling Correlation Analysis
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

      {/* Lagged Correlations Tab */}
      {activeTab === 'lagged' && (
        <div className="glass-card p-6 border border-orange-500/20">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <Zap className="h-5 w-5 mr-2 text-orange-400" />
            Time-Lagged Correlation Analysis
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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
          </div>

          {laggedCorrData.length > 0 && (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={laggedCorrData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="lag" 
                    stroke="#9CA3AF"
                    label={{ value: 'Lag (Days)', position: 'insideBottom', offset: -10 }}
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
                  <Bar 
                    dataKey="correlation" 
                    fill="#F97316"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CorrelationAnalysis 