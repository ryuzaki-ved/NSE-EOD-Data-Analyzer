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

      const hurstExponent = calculateHurstExponent(values)
      const fftResults = performFFT(values)
      const cycles = detectCycles(values)
      
      const returns = calculateReturns(values)
      const cvar = calculateCVaR(returns)
      const omegaRatio = calculateOmegaRatio(returns)
      const maxDrawdown = calculateMaxDrawdown(values)
      const maxDrawdownDuration = calculateMaxDrawdownDuration(values)
      const calmarRatio = calculateCalmarRatio(returns, maxDrawdown)
      const sortinoRatio = calculateSortinoRatio(returns)
      
      const chowTest = performChowTest(values)
      const cusumTest = performCUSUMTest(values)
      
      const monteCarlo = performMonteCarloSimulation(values, 100, 30)
      
      const rollingSkewness = calculateRollingStatistics(values, 10, 'skewness')
      const rollingKurtosis = calculateRollingStatistics(values, 10, 'kurtosis')
      
      const confidenceInterval = calculateConfidenceInterval(values, 0.95)

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
    if (hurst > 0.6) return 'Strong trend persistence (momentum)'
    if (hurst > 0.55) return 'Moderate trend persistence'
    if (hurst > 0.45) return 'Random walk behavior'
    if (hurst > 0.4) return 'Moderate mean-reversion'
    return 'Strong mean-reversion tendencies'
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

  const tabs = [
    { id: 'time-series', label: 'Time Series & Cycles', icon: TrendingUp },
    { id: 'risk-metrics', label: 'Risk Metrics', icon: Shield },
    { id: 'structural-breaks', label: 'Structural Breaks', icon: AlertTriangle },
    { id: 'monte-carlo', label: 'Monte Carlo', icon: Cpu },
    { id: 'rolling-stats', label: 'Rolling Stats', icon: BarChart3 }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <Brain className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Quantitative Mathematical Analysis</h2>
            <p className="text-xs text-slate-400 mt-0.5">Statistical regime detection, cycles, risk parameters & simulations</p>
          </div>
        </div>
        <div className="badge-emerald">
          QUANTITATIVE MODELS
        </div>
      </div>

      {/* Controls */}
      <div className="glass-card p-4 border border-white/[0.07]">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Participant Scope:
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
              Target Metric:
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
            <button
              onClick={performAdvancedAnalysis}
              disabled={loading}
              className="w-full px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-semibold tracking-wide transition-all disabled:opacity-50"
            >
              {loading ? 'Re-running Models...' : 'Run Quantitative Models'}
            </button>
          </div>
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

      {/* Time Series Analysis Tab */}
      {activeTab === 'time-series' && (
        <div className="space-y-6">
          {/* Hurst Exponent */}
          <div className="glass-card p-6 border border-white/[0.07]">
            <h3 className="text-base font-bold text-white tracking-tight mb-4 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-emerald-400" />
              Hurst Exponent Analysis (Memory & Long-Range Dependence)
            </h3>
            
            {loading ? (
              <div className="text-center text-slate-400 py-8 text-xs">
                Computing mathematical models...
              </div>
            ) : analysisResults.hurstExponent !== null ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="p-4 bg-[#0B0F19]/60 rounded-xl border border-white/[0.06]">
                  <div className="text-2xl font-bold font-mono text-emerald-400 mb-1">
                    {analysisResults.hurstExponent.toFixed(4)}
                  </div>
                  <div className="text-xs text-slate-400 mb-4">
                    {getHurstInterpretation(analysisResults.hurstExponent)}
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Trend Persistence:</span>
                      <span className="font-semibold text-white">
                        {analysisResults.hurstExponent > 0.55 ? 'High' : 
                         analysisResults.hurstExponent > 0.45 ? 'Moderate' : 'Low'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Randomness Index:</span>
                      <span className="font-semibold text-white">
                        {Math.abs(analysisResults.hurstExponent - 0.5) < 0.05 ? 'Random Walk' : 'Regime-Driven'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-[#0B0F19]/60 rounded-xl border border-white/[0.06]">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Theoretical Thresholds</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">H &gt; 0.60:</span>
                      <span className="text-emerald-400 font-medium">Strong trend persistence (autocorrelated)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">H ≈ 0.50:</span>
                      <span className="text-amber-400 font-medium">Geometric Brownian motion (pure random)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">H &lt; 0.40:</span>
                      <span className="text-rose-400 font-medium">Anti-persistence (mean-reverting oscillations)</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-400 py-8 text-xs">
                Insufficient data for Hurst exponent calculation (minimum 50 data points required)
              </div>
            )}
          </div>

          {/* FFT Analysis */}
          <div className="glass-card p-6 border border-white/[0.07]">
            <h3 className="text-base font-bold text-white tracking-tight mb-4 flex items-center">
              <Zap className="h-4 w-4 mr-2 text-cyan-400" />
              Fast Fourier Transform (FFT) Frequency Domain Spectrum
            </h3>
            
            {analysisResults.fftResults && analysisResults.fftResults.frequencies.length > 0 && (
              <div className="space-y-6">
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analysisResults.fftResults.frequencies.map((freq, i) => ({
                      frequency: freq,
                      amplitude: analysisResults.fftResults.amplitudes[i]
                    })).slice(0, 50)} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                      <XAxis 
                        dataKey="frequency" 
                        stroke="#64748B"
                        fontSize={11}
                        tickLine={false}
                      />
                      <YAxis 
                        stroke="#64748B"
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
                      <Line 
                        type="monotone" 
                        dataKey="amplitude" 
                        stroke="#10B981" 
                        strokeWidth={2}
                        dot={false}
                        name="Spectral Amplitude"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                {analysisResults.cycles && analysisResults.cycles.length > 0 && (
                  <div className="p-4 bg-[#0B0F19]/60 rounded-xl border border-white/[0.06]">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Dominant Spectral Cycles</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                      {analysisResults.cycles.slice(0, 5).map((cycle, index) => (
                        <div key={index} className="flex justify-between items-center p-2.5 bg-white/[0.02] border border-white/[0.04] rounded-lg">
                          <span className="text-slate-400">Harmonic {index + 1}:</span>
                          <span className="font-mono text-white font-semibold">{cycle.period.toFixed(1)} days</span>
                          <span className="text-emerald-400 font-mono">{(cycle.amplitude / Math.max(...analysisResults.fftResults.amplitudes) * 100).toFixed(0)}%</span>
                        </div>
                      ))}
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
            <div className="text-center text-slate-400 py-8 text-xs">
              Calculating statistical risk distribution...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* CVaR */}
              <div className="glass-card p-5 border border-white/[0.07]">
                <div className="flex items-center space-x-2 text-rose-400 mb-2">
                  <Shield className="h-4 w-4" />
                  <span className="text-xs font-semibold">CVaR (95%)</span>
                </div>
                <div className="text-2xl font-bold font-mono text-rose-400 mb-1">
                  {(analysisResults.cvar * 100).toFixed(2)}%
                </div>
                <div className="text-[11px] text-slate-400 mb-3">Expected tail loss</div>
                <div className="text-xs text-slate-300">
                  Risk Level: <span className={`font-semibold ${
                    getRiskLevel(analysisResults.cvar, 'cvar') === 'High' ? 'text-rose-400' :
                    getRiskLevel(analysisResults.cvar, 'cvar') === 'Medium' ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {getRiskLevel(analysisResults.cvar, 'cvar')}
                  </span>
                </div>
              </div>

              {/* Omega Ratio */}
              <div className="glass-card p-5 border border-white/[0.07]">
                <div className="flex items-center space-x-2 text-emerald-400 mb-2">
                  <Target className="h-4 w-4" />
                  <span className="text-xs font-semibold">Omega Ratio</span>
                </div>
                <div className="text-2xl font-bold font-mono text-emerald-400 mb-1">
                  {analysisResults.omegaRatio.toFixed(3)}
                </div>
                <div className="text-[11px] text-slate-400 mb-3">Probability weighted gains/losses</div>
                <div className="text-xs text-slate-300">
                  Quality: <span className={`font-semibold ${
                    getRiskLevel(analysisResults.omegaRatio, 'omega') === 'Excellent' ? 'text-emerald-400' :
                    getRiskLevel(analysisResults.omegaRatio, 'omega') === 'Good' ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {getRiskLevel(analysisResults.omegaRatio, 'omega')}
                  </span>
                </div>
              </div>

              {/* Calmar Ratio */}
              <div className="glass-card p-5 border border-white/[0.07]">
                <div className="flex items-center space-x-2 text-cyan-400 mb-2">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-xs font-semibold">Calmar Ratio</span>
                </div>
                <div className="text-2xl font-bold font-mono text-cyan-400 mb-1">
                  {analysisResults.calmarRatio.toFixed(3)}
                </div>
                <div className="text-[11px] text-slate-400 mb-3">Return to max drawdown</div>
                <div className="text-xs text-slate-300">
                  Performance: <span className={`font-semibold ${
                    getRiskLevel(analysisResults.calmarRatio, 'calmar') === 'Excellent' ? 'text-emerald-400' :
                    getRiskLevel(analysisResults.calmarRatio, 'calmar') === 'Good' ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {getRiskLevel(analysisResults.calmarRatio, 'calmar')}
                  </span>
                </div>
              </div>

              {/* Sortino Ratio */}
              <div className="glass-card p-5 border border-white/[0.07]">
                <div className="flex items-center space-x-2 text-amber-400 mb-2">
                  <Activity className="h-4 w-4" />
                  <span className="text-xs font-semibold">Sortino Ratio</span>
                </div>
                <div className="text-2xl font-bold font-mono text-amber-400 mb-1">
                  {analysisResults.sortinoRatio.toFixed(3)}
                </div>
                <div className="text-[11px] text-slate-400 mb-3">Downside deviation adjusted</div>
                <div className="text-xs text-slate-300">
                  Efficiency: <span className={`font-semibold ${
                    analysisResults.sortinoRatio > 1.0 ? 'text-emerald-400' :
                    analysisResults.sortinoRatio > 0.5 ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {analysisResults.sortinoRatio > 1.0 ? 'Excellent' :
                     analysisResults.sortinoRatio > 0.5 ? 'Good' : 'Poor'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Additional Risk Metrics */}
          <div className="glass-card p-6 border border-white/[0.07]">
            <h3 className="text-base font-bold text-white tracking-tight mb-4 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2 text-amber-400" />
              Drawdown & Statistical Confidence Bounds
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-[#0B0F19]/60 rounded-xl border border-white/[0.06] text-center">
                <div className="text-2xl font-bold font-mono text-rose-400 mb-1">
                  {analysisResults.maxDrawdown.toFixed(2)}%
                </div>
                <div className="text-xs text-slate-400">Maximum Historical Drawdown</div>
              </div>
              <div className="p-4 bg-[#0B0F19]/60 rounded-xl border border-white/[0.06] text-center">
                <div className="text-2xl font-bold font-mono text-amber-400 mb-1">
                  {analysisResults.maxDrawdownDuration}
                </div>
                <div className="text-xs text-slate-400">Drawdown Duration (Days)</div>
              </div>
              <div className="p-4 bg-[#0B0F19]/60 rounded-xl border border-white/[0.06] text-center">
                <div className="text-2xl font-bold font-mono text-emerald-400 mb-1">
                  {analysisResults.confidenceInterval ? 
                    `±${((analysisResults.confidenceInterval.upperBound - analysisResults.confidenceInterval.lowerBound) / 2).toFixed(2)}` : 'N/A'}
                </div>
                <div className="text-xs text-slate-400">95% Parametric Confidence Spread</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Structural Breaks Tab */}
      {activeTab === 'structural-breaks' && (
        <div className="space-y-6">
          {loading ? (
            <div className="text-center text-slate-400 py-8 text-xs">
              Running econometric hypothesis testing...
            </div>
          ) : (
            <>
              {/* Chow Test */}
              <div className="glass-card p-6 border border-white/[0.07]">
                <h3 className="text-base font-bold text-white tracking-tight mb-4 flex items-center">
                  <GitBranch className="h-4 w-4 mr-2 text-cyan-400" />
                  Chow Test for Econometric Structural Breaks
                </h3>
                
                {analysisResults.chowTest ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="p-4 bg-[#0B0F19]/60 rounded-xl border border-white/[0.06]">
                      <div className="text-2xl font-bold font-mono text-cyan-400 mb-1">
                        {analysisResults.chowTest.chowStatistic.toFixed(4)}
                      </div>
                      <div className="text-xs text-slate-400 mb-3">F-Distributed Chow Statistic</div>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400">p-value:</span>
                          <span className="font-mono text-white">{analysisResults.chowTest.pValue.toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Regime Shift:</span>
                          <span className={`font-semibold ${
                            analysisResults.chowTest.hasBreak ? 'text-rose-400' : 'text-emerald-400'
                          }`}>
                            {analysisResults.chowTest.hasBreak ? 'Break Detected (p < 0.05)' : 'Stationary Process'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-[#0B0F19]/60 rounded-xl border border-white/[0.06]">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Econometric Interpretation</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {analysisResults.chowTest.hasBreak ? 
                          'A statistically significant structural break is present. Market behavior shifted its underlying parameters at or near the mid-point.' :
                          'No structural break detected. The participant position dynamics exhibit parameter stability across sample horizons.'
                        }
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-slate-400 py-8 text-xs">
                    Insufficient data for Chow test
                  </div>
                )}
              </div>

              {/* CUSUM Test */}
              <div className="glass-card p-6 border border-white/[0.07]">
                <h3 className="text-base font-bold text-white tracking-tight mb-4 flex items-center">
                  <Layers className="h-4 w-4 mr-2 text-amber-400" />
                  CUSUM (Cumulative Sum) Stability Test
                </h3>
                
                {analysisResults.cusumTest ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="p-4 bg-[#0B0F19]/60 rounded-xl border border-white/[0.06]">
                        <div className="text-2xl font-bold font-mono text-amber-400 mb-1">
                          {analysisResults.cusumTest.maxDeviation.toFixed(4)}
                        </div>
                        <div className="text-xs text-slate-400 mb-3">Peak Recursive Residual Deviation</div>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Critical Boundary (95%):</span>
                            <span className="font-mono text-white">±{analysisResults.cusumTest.criticalValue.toFixed(4)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Boundary Breach:</span>
                            <span className={`font-semibold ${
                              analysisResults.cusumTest.hasBreak ? 'text-rose-400' : 'text-emerald-400'
                            }`}>
                              {analysisResults.cusumTest.hasBreak ? 'Yes — Instability' : 'No — Parameter Stable'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-[#0B0F19]/60 rounded-xl border border-white/[0.06]">
                        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Change Point</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {analysisResults.cusumTest.hasBreak ? 
                            `Break triggered at observation #${analysisResults.cusumTest.breakPoint + 1} with cumulative deviation exceeding critical confidence envelopes.` :
                            'CUSUM curve remains strictly bounded within the 95% critical lines, proving parameter constancy.'
                          }
                        </p>
                      </div>
                    </div>

                    <div className="h-[280px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={analysisResults.cusumTest.cusumValues.map((val, i) => ({
                          observation: i + 1,
                          cusum: val,
                          criticalUpper: analysisResults.cusumTest.criticalValue,
                          criticalLower: -analysisResults.cusumTest.criticalValue
                        }))} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                          <XAxis 
                            dataKey="observation" 
                            stroke="#64748B"
                            fontSize={11}
                            tickLine={false}
                          />
                          <YAxis 
                            stroke="#64748B"
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
                          <Line 
                            type="monotone" 
                            dataKey="cusum" 
                            stroke="#38BDF8" 
                            strokeWidth={2}
                            dot={false}
                            name="CUSUM Path"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="criticalUpper" 
                            stroke="#F43F5E" 
                            strokeWidth={1}
                            strokeDasharray="4 4"
                            dot={false}
                            name="+95% Boundary"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="criticalLower" 
                            stroke="#F43F5E" 
                            strokeWidth={1}
                            strokeDasharray="4 4"
                            dot={false}
                            name="-95% Boundary"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-slate-400 py-8 text-xs">
                    Insufficient observations for recursive residuals
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
            <div className="text-center text-slate-400 py-8 text-xs">
              Simulating 1,000 synthetic paths...
            </div>
          ) : (
            <div className="glass-card p-6 border border-white/[0.07]">
              <h3 className="text-base font-bold text-white tracking-tight mb-4 flex items-center">
                <Cpu className="h-4 w-4 mr-2 text-emerald-400" />
                Monte Carlo Stochastic Path Projections
              </h3>
              
              {analysisResults.monteCarlo ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div className="text-center p-3 bg-[#0B0F19]/60 border border-white/[0.06] rounded-xl">
                      <div className="text-lg font-bold font-mono text-rose-400">
                        {analysisResults.monteCarlo.percentiles.p5.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-400">5th Percentile</div>
                    </div>
                    <div className="text-center p-3 bg-[#0B0F19]/60 border border-white/[0.06] rounded-xl">
                      <div className="text-lg font-bold font-mono text-amber-400">
                        {analysisResults.monteCarlo.percentiles.p25.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-400">25th Percentile</div>
                    </div>
                    <div className="text-center p-3 bg-[#0B0F19]/60 border border-white/[0.06] rounded-xl col-span-2 sm:col-span-1">
                      <div className="text-lg font-bold font-mono text-emerald-400">
                        {analysisResults.monteCarlo.percentiles.p50.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-400">Median (50th)</div>
                    </div>
                    <div className="text-center p-3 bg-[#0B0F19]/60 border border-white/[0.06] rounded-xl">
                      <div className="text-lg font-bold font-mono text-cyan-400">
                        {analysisResults.monteCarlo.percentiles.p75.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-400">75th Percentile</div>
                    </div>
                    <div className="text-center p-3 bg-[#0B0F19]/60 border border-white/[0.06] rounded-xl">
                      <div className="text-lg font-bold font-mono text-emerald-400">
                        {analysisResults.monteCarlo.percentiles.p95.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-400">95th Percentile</div>
                    </div>
                  </div>

                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analysisResults.monteCarlo.simulations[0].map((val, i) => ({
                        time: i,
                        value: val
                      }))} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                        <XAxis 
                          dataKey="time" 
                          stroke="#64748B"
                          fontSize={11}
                          tickLine={false}
                        />
                        <YAxis 
                          stroke="#64748B"
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
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#10B981" 
                          fill="#10B981"
                          fillOpacity={0.15}
                          strokeWidth={2}
                          name="Sample Path"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="text-center text-slate-400 text-xs">
                    Expected Terminal Drift: <span className="font-mono text-emerald-400 font-semibold">{analysisResults.monteCarlo.meanFinalValue.toFixed(2)}</span> ({analysisResults.monteCarlo.simulations.length} stochastic iterations)
                  </div>
                </div>
              ) : (
                <div className="text-center text-slate-400 py-8 text-xs">
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
            <div className="text-center text-slate-400 py-8 text-xs">
              Calculating rolling higher moments...
            </div>
          ) : (
            <div className="glass-card p-6 border border-white/[0.07]">
              <h3 className="text-base font-bold text-white tracking-tight mb-4 flex items-center">
                <BarChart3 className="h-4 w-4 mr-2 text-cyan-400" />
                Rolling Higher Statistical Moments (Skewness & Kurtosis)
              </h3>
              
              {analysisResults.rollingSkewness && analysisResults.rollingSkewness.length > 0 && (
                <div className="space-y-6">
                  {/* Rolling Skewness */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Rolling Skewness (Asymmetry)</h4>
                    <div className="h-[240px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={analysisResults.rollingSkewness.map((val, i) => ({
                          period: i + 10,
                          skewness: val,
                          zero: 0
                        }))} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                          <XAxis 
                            dataKey="period" 
                            stroke="#64748B"
                            fontSize={11}
                            tickLine={false}
                          />
                          <YAxis 
                            stroke="#64748B"
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
                          <Line 
                            type="monotone" 
                            dataKey="skewness" 
                            stroke="#38BDF8" 
                            strokeWidth={2}
                            dot={false}
                            name="Skewness"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="zero" 
                            stroke="#475569" 
                            strokeWidth={1}
                            strokeDasharray="4 4"
                            dot={false}
                            name="Normal (0)"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Rolling Kurtosis */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Rolling Kurtosis (Fat-Tail Risk)</h4>
                    <div className="h-[240px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={analysisResults.rollingKurtosis.map((val, i) => ({
                          period: i + 10,
                          kurtosis: val,
                          normal: 3
                        }))} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                          <XAxis 
                            dataKey="period" 
                            stroke="#64748B"
                            fontSize={11}
                            tickLine={false}
                          />
                          <YAxis 
                            stroke="#64748B"
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
                          <Line 
                            type="monotone" 
                            dataKey="kurtosis" 
                            stroke="#10B981" 
                            strokeWidth={2}
                            dot={false}
                            name="Kurtosis"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="normal" 
                            stroke="#475569" 
                            strokeWidth={1}
                            strokeDasharray="4 4"
                            dot={false}
                            name="Mesokurtic (3)"
                          />
                        </LineChart>
                      </ResponsiveContainer>
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