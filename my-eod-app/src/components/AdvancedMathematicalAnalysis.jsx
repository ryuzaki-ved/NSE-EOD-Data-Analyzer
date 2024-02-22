import React, { useState, useEffect } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, AreaChart, Area } from 'recharts'
import { 
  calculateHurstExponent,
  performFFT,
  detectCycles,
  performKMeansClustering,
  performPCA,
  calculateCVaR,
  calculateOmegaRatio,
  calculateCalmarRatio,
  calculateSortinoRatio,
  calculateMaxDrawdownDuration,
  calculateGrangerCausality,
  calculateCopulaDependence,
  calculateOrderFlowImbalance,
  calculateAmihudIlliquidity,
  performChowTest,
  performCUSUMTest,
  performMonteCarloSimulation,
  calculateRollingStatistics,
  calculateConfidenceInterval
} from '../utils/advancedMathHelpers'
import { 
  Brain, 
  TrendingUp, 
  BarChart3, 
  Activity, 
  Target, 
  Zap, 
  Shield, 
  AlertTriangle,
  Clock,
  PieChart,
  ScatterChart as ScatterIcon,
  Cpu,
  Database,
  GitBranch,
  Layers
} from 'lucide-react'

const AdvancedMathematicalAnalysis = ({ participantData, fiiData }) => {
  const [activeTab, setActiveTab] = useState('time-series')
  const [selectedParticipant, setSelectedParticipant] = useState('Client')
  const [selectedMetric, setSelectedMetric] = useState('total_long_contracts')
  const [analysisResults, setAnalysisResults] = useState({
    hurstExponent: null,
    fftResults: null,
    cycles: null,
    cvar: 0,
    omegaRatio: 0,
    calmarRatio: 0,
    sortinoRatio: 0,
    maxDrawdown: 0,
    maxDrawdownDuration: 0,
    chowTest: null,
    cusumTest: null,
    monteCarlo: null,
    rollingSkewness: [],
    rollingKurtosis: [],
    confidenceInterval: null
  })
  const [loading, setLoading] = useState(false)

  const participants = ['Client', 'DII', 'FII', 'Pro']
  const metrics = [
    { key: 'total_long_contracts', label: 'Total Long Contracts' },
    { key: 'total_short_contracts', label: 'Total Short Contracts' },
    { key: 'future_index_long', label: 'Future Index Long' },
    { key: 'future_index_short', label: 'Future Index Short' }
  ]

  useEffect(() => {
    if (participantData && participantData.length > 0) {
      performAdvancedAnalysis()
    }
  }, [participantData, selectedParticipant, selectedMetric])

  const performAdvancedAnalysis = async () => {
    setLoading(true)
    
    try {
      const participantDataFiltered = participantData.filter(item => item.client_type === selectedParticipant)
      const values = participantDataFiltered.map(item => item[selectedMetric] || 0)
      
      if (values.length < 10) {
        setLoading(false)
        return
      }

      // Time Series Analysis
      const hurstExponent = calculateHurstExponent(values)
      const fftResults = performFFT(values)
      const cycles = detectCycles(values)
      
      // Risk Metrics
      const returns = calculateReturns(values)
      const cvar = calculateCVaR(returns)
      const omegaRatio = calculateOmegaRatio(returns)
      const maxDrawdown = calculateMaxDrawdown(values)
      const calmarRatio = calculateCalmarRatio(returns, maxDrawdown)
      const sortinoRatio = calculateSortinoRatio(returns)
      const maxDrawdownDuration = calculateMaxDrawdownDuration(values)
      
      // Structural Break Detection
      const chowTest = performChowTest(values, Math.floor(values.length / 2))
      const cusumTest = performCUSUMTest(values)
      
      // Monte Carlo Simulation
      const monteCarlo = performMonteCarloSimulation(returns)
      
      // Rolling Statistics
      const rollingSkewness = calculateRollingStatistics(values, 10, 'skewness')
      const rollingKurtosis = calculateRollingStatistics(values, 10, 'kurtosis')
      
      // Confidence Intervals
      const confidenceInterval = calculateConfidenceInterval(values)
      
      setAnalysisResults({
        hurstExponent,
        fftResults,
        cycles,
        cvar,
        omegaRatio,
        calmarRatio,
        sortinoRatio,
        maxDrawdown,
        maxDrawdownDuration,
        chowTest,
        cusumTest,
        monteCarlo,
        rollingSkewness,
        rollingKurtosis,
        confidenceInterval,
        values
      })
    } catch (error) {
      console.error('Advanced analysis error:', error)
    }
    
    setLoading(false)
  }

  const calculateReturns = (values) => {
    const returns = []
    for (let i = 1; i < values.length; i++) {
      returns.push((values[i] - values[i - 1]) / values[i - 1])
    }
    return returns
  }

  const calculateMaxDrawdown = (data) => {
    if (data.length < 2) return 0
    
    let maxDrawdown = 0
    let peak = data[0]
    
    for (let i = 1; i < data.length; i++) {
      if (data[i] > peak) {
        peak = data[i]
      } else {
        const drawdown = (peak - data[i]) / peak
        if (drawdown > maxDrawdown) {
          maxDrawdown = drawdown
        }
      }
    }
    
    return maxDrawdown * 100
  }

  const getHurstInterpretation = (hurst) => {
    if (hurst === null) return 'Insufficient data'
    if (hurst > 0.6) return 'Strong trend persistence (mean-reverting)'
    if (hurst > 0.55) return 'Moderate trend persistence'
    if (hurst > 0.45) return 'Random walk'
    if (hurst > 0.4) return 'Moderate anti-persistence'
    return 'Strong anti-persistence (mean-reverting)'
  }

  const getRiskLevel = (value, metric) => {
    switch (metric) {
      case 'cvar':
        return value > 0.05 ? 'High' : value > 0.02 ? 'Medium' : 'Low'
      case 'omega':
        return value > 1.5 ? 'Excellent' : value > 1.0 ? 'Good' : 'Poor'
      case 'calmar':
        return value > 1.0 ? 'Excellent' : value > 0.5 ? 'Good' : 'Poor'
      default:
        return 'N/A'
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
          <Brain className="h-6 w-6 text-white" />
        </div>
        <h2 className="text-3xl font-bold gradient-text">Advanced Mathematical Analysis</h2>
        <div className="px-3 py-1 bg-purple-500/20 rounded-full text-xs text-purple-400 border border-purple-500/30">
          QUANTUM ANALYTICS
        </div>
      </div>

      {/* Controls */}
      <div className="glass-card p-6 border border-purple-500/20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Participant:
            </label>
            <select
              value={selectedParticipant}
              onChange={(e) => setSelectedParticipant(e.target.value)}
              className="w-full px-3 py-2 bg-dark-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 text-white"
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
              className="w-full px-3 py-2 bg-dark-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 text-white"
            >
              {metrics.map(metric => (
                <option key={metric.key} value={metric.key}>{metric.label}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={performAdvancedAnalysis}
              disabled={loading}
              className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
            >
              {loading ? 'Analyzing...' : 'Run Analysis'}
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 bg-dark-700 rounded-lg p-2">
        <button
          onClick={() => setActiveTab('time-series')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'time-series'
              ? 'bg-purple-500 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <TrendingUp className="h-4 w-4 inline mr-2" />
          Time Series
        </button>
        <button
          onClick={() => setActiveTab('risk-metrics')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'risk-metrics'
              ? 'bg-purple-500 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Shield className="h-4 w-4 inline mr-2" />
          Risk Metrics
        </button>
        <button
          onClick={() => setActiveTab('structural-breaks')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'structural-breaks'
              ? 'bg-purple-500 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <AlertTriangle className="h-4 w-4 inline mr-2" />
          Structural Breaks
        </button>
        <button
          onClick={() => setActiveTab('monte-carlo')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'monte-carlo'
              ? 'bg-purple-500 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Cpu className="h-4 w-4 inline mr-2" />
          Monte Carlo
        </button>
        <button
          onClick={() => setActiveTab('rolling-stats')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'rolling-stats'
              ? 'bg-purple-500 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <BarChart3 className="h-4 w-4 inline mr-2" />
          Rolling Stats
        </button>
      </div>

      {/* Time Series Analysis Tab */}
      {activeTab === 'time-series' && (
        <div className="space-y-6">
          {/* Hurst Exponent */}
          <div className="glass-card p-6 border border-blue-500/20">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-blue-400" />
              Hurst Exponent Analysis
            </h3>
            
            {loading ? (
              <div className="text-center text-gray-400 py-8">
                Loading analysis...
              </div>
            ) : analysisResults.hurstExponent !== null ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-4 bg-dark-700 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400 mb-2">
                    {analysisResults.hurstExponent.toFixed(4)}
                  </div>
                  <div className="text-sm text-gray-400 mb-3">
                    {getHurstInterpretation(analysisResults.hurstExponent)}
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Trend Persistence:</span>
                      <span className="text-white">
                        {analysisResults.hurstExponent > 0.55 ? 'High' : 
                         analysisResults.hurstExponent > 0.45 ? 'Medium' : 'Low'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Market Efficiency:</span>
                      <span className="text-white">
                        {Math.abs(analysisResults.hurstExponent - 0.5) < 0.05 ? 'Efficient' : 'Inefficient'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-dark-700 rounded-lg">
                  <h4 className="text-lg font-semibold text-white mb-3">Interpretation Guide</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">H &gt; 0.6:</span>
                      <span className="text-green-400">Strong trend persistence</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">H ≈ 0.5:</span>
                      <span className="text-yellow-400">Random walk</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">H &lt; 0.4:</span>
                      <span className="text-red-400">Anti-persistence</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">
                Insufficient data for Hurst exponent calculation (minimum 50 data points required)
              </div>
            )}
          </div>

          {/* FFT Analysis */}
          <div className="glass-card p-6 border border-green-500/20">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Zap className="h-5 w-5 mr-2 text-green-400" />
              Frequency Domain Analysis (FFT)
            </h3>
            
            {analysisResults.fftResults && analysisResults.fftResults.frequencies.length > 0 && (
              <div className="space-y-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analysisResults.fftResults.frequencies.map((freq, i) => ({
                      frequency: freq,
                      amplitude: analysisResults.fftResults.amplitudes[i]
                    })).slice(0, 50)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="frequency" 
                        stroke="#9CA3AF"
                        label={{ value: 'Frequency', position: 'insideBottom', offset: -10 }}
                      />
                      <YAxis 
                        stroke="#9CA3AF"
                        label={{ value: 'Amplitude', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="amplitude" 
                        stroke="#10B981" 
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                {analysisResults.cycles && analysisResults.cycles.length > 0 && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="p-4 bg-dark-700 rounded-lg">
                      <h4 className="text-lg font-semibold text-white mb-3">Dominant Cycles</h4>
                      <div className="space-y-2">
                        {analysisResults.cycles.slice(0, 5).map((cycle, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-gray-400">Period {index + 1}:</span>
                            <span className="text-white">{cycle.period.toFixed(1)} days</span>
                            <span className="text-green-400">({(cycle.amplitude / Math.max(...analysisResults.fftResults.amplitudes) * 100).toFixed(1)}%)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Risk Metrics Tab */}
      {activeTab === 'risk-metrics' && (
        <div className="space-y-6">
          {loading ? (
            <div className="text-center text-gray-400 py-8">
              Loading risk analysis...
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* CVaR */}
              <div className="glass-card p-6 border border-red-500/20">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-red-400" />
                  Conditional Value at Risk (CVaR)
                </h3>
                <div className="text-3xl font-bold text-red-400 mb-2">
                  {(analysisResults.cvar * 100).toFixed(2)}%
                </div>
                <div className="text-sm text-gray-400 mb-3">
                  Expected loss in worst 5% of scenarios
                </div>
                <div className="text-sm text-white">
                  Risk Level: <span className={`font-semibold ${
                    getRiskLevel(analysisResults.cvar, 'cvar') === 'High' ? 'text-red-400' :
                    getRiskLevel(analysisResults.cvar, 'cvar') === 'Medium' ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    {getRiskLevel(analysisResults.cvar, 'cvar')}
                  </span>
                </div>
              </div>

              {/* Omega Ratio */}
              <div className="glass-card p-6 border border-green-500/20">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Target className="h-5 w-5 mr-2 text-green-400" />
                  Omega Ratio
                </h3>
                <div className="text-3xl font-bold text-green-400 mb-2">
                  {analysisResults.omegaRatio.toFixed(3)}
                </div>
                <div className="text-sm text-gray-400 mb-3">
                  Risk-adjusted return measure
                </div>
                <div className="text-sm text-white">
                  Quality: <span className={`font-semibold ${
                    getRiskLevel(analysisResults.omegaRatio, 'omega') === 'Excellent' ? 'text-green-400' :
                    getRiskLevel(analysisResults.omegaRatio, 'omega') === 'Good' ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {getRiskLevel(analysisResults.omegaRatio, 'omega')}
                  </span>
                </div>
              </div>

              {/* Calmar Ratio */}
              <div className="glass-card p-6 border border-blue-500/20">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-blue-400" />
                  Calmar Ratio
                </h3>
                <div className="text-3xl font-bold text-blue-400 mb-2">
                  {analysisResults.calmarRatio.toFixed(3)}
                </div>
                <div className="text-sm text-gray-400 mb-3">
                  Return per unit of maximum drawdown
                </div>
                <div className="text-sm text-white">
                  Performance: <span className={`font-semibold ${
                    getRiskLevel(analysisResults.calmarRatio, 'calmar') === 'Excellent' ? 'text-green-400' :
                    getRiskLevel(analysisResults.calmarRatio, 'calmar') === 'Good' ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {getRiskLevel(analysisResults.calmarRatio, 'calmar')}
                  </span>
                </div>
              </div>

              {/* Sortino Ratio */}
              <div className="glass-card p-6 border border-purple-500/20">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-purple-400" />
                  Sortino Ratio
                </h3>
                <div className="text-3xl font-bold text-purple-400 mb-2">
                  {analysisResults.sortinoRatio.toFixed(3)}
                </div>
                <div className="text-sm text-gray-400 mb-3">
                  Downside deviation adjusted return
                </div>
                <div className="text-sm text-white">
                  Risk-Adjusted: <span className={`font-semibold ${
                    analysisResults.sortinoRatio > 1.0 ? 'text-green-400' :
                    analysisResults.sortinoRatio > 0.5 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {analysisResults.sortinoRatio > 1.0 ? 'Excellent' :
                     analysisResults.sortinoRatio > 0.5 ? 'Good' : 'Poor'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Additional Risk Metrics */}
          <div className="glass-card p-6 border border-orange-500/20">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-orange-400" />
              Additional Risk Metrics
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">
                  {analysisResults.maxDrawdown.toFixed(2)}%
                </div>
                <div className="text-sm text-gray-400">Maximum Drawdown</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">
                  {analysisResults.maxDrawdownDuration}
                </div>
                <div className="text-sm text-gray-400">Drawdown Duration (days)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">
                  {analysisResults.confidenceInterval ? 
                    `±${((analysisResults.confidenceInterval.upperBound - analysisResults.confidenceInterval.lowerBound) / 2).toFixed(2)}` : 'N/A'}
                </div>
                <div className="text-sm text-gray-400">95% Confidence Interval</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Structural Breaks Tab */}
      {activeTab === 'structural-breaks' && (
        <div className="space-y-6">
          {loading ? (
            <div className="text-center text-gray-400 py-8">
              Loading structural break analysis...
            </div>
          ) : (
            <>
              {/* Chow Test */}
              <div className="glass-card p-6 border border-red-500/20">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <GitBranch className="h-5 w-5 mr-2 text-red-400" />
                  Chow Test for Structural Breaks
                </h3>
                
                {analysisResults.chowTest ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="p-4 bg-dark-700 rounded-lg">
                      <div className="text-2xl font-bold text-red-400 mb-2">
                        {analysisResults.chowTest.chowStatistic.toFixed(4)}
                      </div>
                      <div className="text-sm text-gray-400 mb-3">Chow Test Statistic</div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">P-Value:</span>
                          <span className="text-white">{analysisResults.chowTest.pValue.toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Structural Break:</span>
                          <span className={`font-semibold ${
                            analysisResults.chowTest.hasBreak ? 'text-red-400' : 'text-green-400'
                          }`}>
                            {analysisResults.chowTest.hasBreak ? 'Detected' : 'Not Detected'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-dark-700 rounded-lg">
                      <h4 className="text-lg font-semibold text-white mb-3">Interpretation</h4>
                      <div className="text-sm text-gray-400">
                        {analysisResults.chowTest.hasBreak ? 
                          'A structural break has been detected, indicating a significant change in the underlying data generating process.' :
                          'No structural break detected. The data appears to follow a consistent pattern.'
                        }
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    Insufficient data for Chow test analysis
                  </div>
                )}
              </div>

              {/* CUSUM Test */}
              <div className="glass-card p-6 border border-blue-500/20">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Layers className="h-5 w-5 mr-2 text-blue-400" />
                  CUSUM Test for Structural Breaks
                </h3>
                
                {analysisResults.cusumTest ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="p-4 bg-dark-700 rounded-lg">
                        <div className="text-2xl font-bold text-blue-400 mb-2">
                          {analysisResults.cusumTest.maxDeviation.toFixed(4)}
                        </div>
                        <div className="text-sm text-gray-400 mb-3">Maximum Deviation</div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Critical Value:</span>
                            <span className="text-white">{analysisResults.cusumTest.criticalValue.toFixed(4)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Break Detected:</span>
                            <span className={`font-semibold ${
                              analysisResults.cusumTest.hasBreak ? 'text-red-400' : 'text-green-400'
                            }`}>
                              {analysisResults.cusumTest.hasBreak ? 'Yes' : 'No'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-dark-700 rounded-lg">
                        <h4 className="text-lg font-semibold text-white mb-3">Break Point</h4>
                        <div className="text-sm text-gray-400">
                          {analysisResults.cusumTest.hasBreak ? 
                            `Structural break detected at observation ${analysisResults.cusumTest.breakPoint + 1}` :
                            'No structural break detected in the time series.'
                          }
                        </div>
                      </div>
                    </div>

                    {/* CUSUM Chart */}
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={analysisResults.cusumTest.cusumValues.map((val, i) => ({
                          observation: i + 1,
                          cusum: val,
                          criticalUpper: analysisResults.cusumTest.criticalValue,
                          criticalLower: -analysisResults.cusumTest.criticalValue
                        }))}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis 
                            dataKey="observation" 
                            stroke="#9CA3AF"
                            label={{ value: 'Observation', position: 'insideBottom', offset: -10 }}
                          />
                          <YAxis 
                            stroke="#9CA3AF"
                            label={{ value: 'CUSUM', angle: -90, position: 'insideLeft' }}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1F2937', 
                              border: '1px solid #374151',
                              borderRadius: '8px'
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="cusum" 
                            stroke="#3B82F6" 
                            strokeWidth={2}
                            dot={false}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="criticalUpper" 
                            stroke="#EF4444" 
                            strokeWidth={1}
                            strokeDasharray="5 5"
                            dot={false}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="criticalLower" 
                            stroke="#EF4444" 
                            strokeWidth={1}
                            strokeDasharray="5 5"
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    Insufficient data for CUSUM test analysis
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Monte Carlo Simulation Tab */}
      {activeTab === 'monte-carlo' && (
        <div className="space-y-6">
          {loading ? (
            <div className="text-center text-gray-400 py-8">
              Loading Monte Carlo simulation...
            </div>
          ) : (
            <div className="glass-card p-6 border border-purple-500/20">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Cpu className="h-5 w-5 mr-2 text-purple-400" />
                Monte Carlo Simulation Results
              </h3>
              
              {analysisResults.monteCarlo ? (
                <div className="space-y-6">
                  {/* Percentiles */}
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                    <div className="text-center p-4 bg-dark-700 rounded-lg">
                      <div className="text-2xl font-bold text-red-400">
                        {analysisResults.monteCarlo.percentiles.p5.toFixed(3)}
                      </div>
                      <div className="text-sm text-gray-400">5th Percentile</div>
                    </div>
                    <div className="text-center p-4 bg-dark-700 rounded-lg">
                      <div className="text-2xl font-bold text-orange-400">
                        {analysisResults.monteCarlo.percentiles.p25.toFixed(3)}
                      </div>
                      <div className="text-sm text-gray-400">25th Percentile</div>
                    </div>
                    <div className="text-center p-4 bg-dark-700 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-400">
                        {analysisResults.monteCarlo.percentiles.p50.toFixed(3)}
                      </div>
                      <div className="text-sm text-gray-400">Median</div>
                    </div>
                    <div className="text-center p-4 bg-dark-700 rounded-lg">
                      <div className="text-2xl font-bold text-green-400">
                        {analysisResults.monteCarlo.percentiles.p75.toFixed(3)}
                      </div>
                      <div className="text-sm text-gray-400">75th Percentile</div>
                    </div>
                    <div className="text-center p-4 bg-dark-700 rounded-lg">
                      <div className="text-2xl font-bold text-blue-400">
                        {analysisResults.monteCarlo.percentiles.p95.toFixed(3)}
                      </div>
                      <div className="text-sm text-gray-400">95th Percentile</div>
                    </div>
                  </div>

                  {/* Simulation Paths Chart */}
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analysisResults.monteCarlo.simulations[0].map((val, i) => ({
                        time: i,
                        value: val
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis 
                          dataKey="time" 
                          stroke="#9CA3AF"
                          label={{ value: 'Time Period', position: 'insideBottom', offset: -10 }}
                        />
                        <YAxis 
                          stroke="#9CA3AF"
                          label={{ value: 'Value', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1F2937', 
                            border: '1px solid #374151',
                            borderRadius: '8px'
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#8B5CF6" 
                          fill="#8B5CF6"
                          fillOpacity={0.3}
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="text-center text-gray-400">
                    <div className="text-lg font-semibold text-white mb-2">
                      Expected Final Value: {analysisResults.monteCarlo.meanFinalValue.toFixed(3)}
                    </div>
                    <div className="text-sm">
                      Based on {analysisResults.monteCarlo.simulations.length} Monte Carlo simulations
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  No Monte Carlo simulation data available
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Rolling Statistics Tab */}
      {activeTab === 'rolling-stats' && (
        <div className="space-y-6">
          {loading ? (
            <div className="text-center text-gray-400 py-8">
              Loading rolling statistics...
            </div>
          ) : (
            <div className="glass-card p-6 border border-cyan-500/20">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-cyan-400" />
                Rolling Statistics Analysis
              </h3>
              
              {analysisResults.rollingSkewness && analysisResults.rollingSkewness.length > 0 && (
                <div className="space-y-6">
                  {/* Rolling Skewness */}
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analysisResults.rollingSkewness.map((val, i) => ({
                        period: i + 10,
                        skewness: val
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis 
                          dataKey="period" 
                          stroke="#9CA3AF"
                          label={{ value: 'Time Period', position: 'insideBottom', offset: -10 }}
                        />
                        <YAxis 
                          stroke="#9CA3AF"
                          label={{ value: 'Skewness', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1F2937', 
                            border: '1px solid #374151',
                            borderRadius: '8px'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="skewness" 
                          stroke="#06B6D4" 
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="zero" 
                          stroke="#6B7280" 
                          strokeWidth={1}
                          strokeDasharray="5 5"
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Rolling Kurtosis */}
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analysisResults.rollingKurtosis.map((val, i) => ({
                        period: i + 10,
                        kurtosis: val
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis 
                          dataKey="period" 
                          stroke="#9CA3AF"
                          label={{ value: 'Time Period', position: 'insideBottom', offset: -10 }}
                        />
                        <YAxis 
                          stroke="#9CA3AF"
                          label={{ value: 'Kurtosis', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1F2937', 
                            border: '1px solid #374151',
                            borderRadius: '8px'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="kurtosis" 
                          stroke="#10B981" 
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="zero" 
                          stroke="#6B7280" 
                          strokeWidth={1}
                          strokeDasharray="5 5"
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Statistics Summary */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="p-4 bg-dark-700 rounded-lg">
                      <h4 className="text-lg font-semibold text-white mb-3">Skewness Analysis</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Average Skewness:</span>
                          <span className="text-white">
                            {(analysisResults.rollingSkewness.reduce((a, b) => a + b, 0) / analysisResults.rollingSkewness.length).toFixed(3)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Distribution:</span>
                          <span className="text-white">
                            {Math.abs(analysisResults.rollingSkewness.reduce((a, b) => a + b, 0) / analysisResults.rollingSkewness.length) > 0.5 ? 'Skewed' : 'Symmetric'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-dark-700 rounded-lg">
                      <h4 className="text-lg font-semibold text-white mb-3">Kurtosis Analysis</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Average Kurtosis:</span>
                          <span className="text-white">
                            {(analysisResults.rollingKurtosis.reduce((a, b) => a + b, 0) / analysisResults.rollingKurtosis.length).toFixed(3)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Tail Behavior:</span>
                          <span className="text-white">
                            {analysisResults.rollingKurtosis.reduce((a, b) => a + b, 0) / analysisResults.rollingKurtosis.length > 3 ? 'Heavy Tails' : 'Normal Tails'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AdvancedMathematicalAnalysis