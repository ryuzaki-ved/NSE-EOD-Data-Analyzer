import React, { useState, useEffect } from 'react'
import AdvancedMathematicalAnalysis from '../components/AdvancedMathematicalAnalysis'
import { Brain, Database, TrendingUp, Shield, AlertTriangle, Cpu, BarChart3 } from 'lucide-react'

const AdvancedMathPage = () => {
  const [participantData, setParticipantData] = useState([])
  const [fiiData, setFiiData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load participant data
      const participantResponse = await fetch('/data/participant_oi.json')
      if (!participantResponse.ok) {
        throw new Error('Failed to load participant data')
      }
      const participantJson = await participantResponse.json()
      setParticipantData(participantJson)

      // Load FII data
      const fiiResponse = await fetch('/data/fii_derivatives.json')
      if (!fiiResponse.ok) {
        throw new Error('Failed to load FII data')
      }
      const fiiJson = await fiiResponse.json()
      setFiiData(fiiJson)

    } catch (err) {
      console.error('Error loading data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <div className="text-purple-400 text-lg">Loading Advanced Mathematical Analysis...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-lg mb-4">Error: {error}</div>
          <button 
            onClick={loadData}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold gradient-text">Advanced Mathematical Analysis</h1>
              <p className="text-gray-400 mt-2">Quantum-level insights through complex statistical modeling</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4">
            <div className="px-3 py-1 bg-purple-500/20 rounded-full text-xs text-purple-400 border border-purple-500/30">
              QUANTUM ANALYTICS
            </div>
            <div className="px-3 py-1 bg-blue-500/20 rounded-full text-xs text-blue-400 border border-blue-500/30">
              TIME SERIES
            </div>
            <div className="px-3 py-1 bg-green-500/20 rounded-full text-xs text-green-400 border border-green-500/30">
              RISK METRICS
            </div>
            <div className="px-3 py-1 bg-red-500/20 rounded-full text-xs text-red-400 border border-red-500/30">
              STRUCTURAL BREAKS
            </div>
            <div className="px-3 py-1 bg-cyan-500/20 rounded-full text-xs text-cyan-400 border border-cyan-500/30">
              MONTE CARLO
            </div>
          </div>
        </div>

        {/* Feature Overview */}
        <div className="glass-card p-6 border border-purple-500/20 mb-8">
          <h2 className="text-2xl font-semibold mb-6 flex items-center">
            <Database className="h-6 w-6 mr-2 text-purple-400" />
            Advanced Mathematical Features
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <div className="p-4 bg-dark-700 rounded-lg border border-blue-500/20">
              <div className="flex items-center mb-3">
                <TrendingUp className="h-5 w-5 text-blue-400 mr-2" />
                <h3 className="text-lg font-semibold text-white">Time Series Analysis</h3>
              </div>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Hurst Exponent for trend persistence</li>
                <li>• Fast Fourier Transform (FFT)</li>
                <li>• Cyclical pattern detection</li>
                <li>• Frequency domain analysis</li>
              </ul>
            </div>

            <div className="p-4 bg-dark-700 rounded-lg border border-green-500/20">
              <div className="flex items-center mb-3">
                <Shield className="h-5 w-5 text-green-400 mr-2" />
                <h3 className="text-lg font-semibold text-white">Advanced Risk Metrics</h3>
              </div>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Conditional Value at Risk (CVaR)</li>
                <li>• Omega Ratio</li>
                <li>• Calmar Ratio</li>
                <li>• Sortino Ratio</li>
              </ul>
            </div>

            <div className="p-4 bg-dark-700 rounded-lg border border-red-500/20">
              <div className="flex items-center mb-3">
                <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
                <h3 className="text-lg font-semibold text-white">Structural Break Detection</h3>
              </div>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Chow Test</li>
                <li>• CUSUM Test</li>
                <li>• Regime change detection</li>
                <li>• Break point identification</li>
              </ul>
            </div>

            <div className="p-4 bg-dark-700 rounded-lg border border-purple-500/20">
              <div className="flex items-center mb-3">
                <Cpu className="h-5 w-5 text-purple-400 mr-2" />
                <h3 className="text-lg font-semibold text-white">Monte Carlo Simulation</h3>
              </div>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Scenario analysis</li>
                <li>• Probability distributions</li>
                <li>• Risk assessment</li>
                <li>• Confidence intervals</li>
              </ul>
            </div>

            <div className="p-4 bg-dark-700 rounded-lg border border-cyan-500/20">
              <div className="flex items-center mb-3">
                <BarChart3 className="h-5 w-5 text-cyan-400 mr-2" />
                <h3 className="text-lg font-semibold text-white">Rolling Statistics</h3>
              </div>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Rolling skewness</li>
                <li>• Rolling kurtosis</li>
                <li>• Dynamic volatility</li>
                <li>• Distribution analysis</li>
              </ul>
            </div>

            <div className="p-4 bg-dark-700 rounded-lg border border-orange-500/20">
              <div className="flex items-center mb-3">
                <Brain className="h-5 w-5 text-orange-400 mr-2" />
                <h3 className="text-lg font-semibold text-white">Machine Learning</h3>
              </div>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• K-means clustering</li>
                <li>• Principal Component Analysis</li>
                <li>• Pattern recognition</li>
                <li>• Behavioral grouping</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Data Summary */}
        <div className="glass-card p-6 border border-gray-500/20 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Database className="h-5 w-5 mr-2 text-gray-400" />
            Data Summary
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-dark-700 rounded-lg">
              <div className="text-2xl font-bold text-blue-400 mb-2">
                {participantData.length}
              </div>
              <div className="text-sm text-gray-400">Total Records</div>
            </div>
            
            <div className="text-center p-4 bg-dark-700 rounded-lg">
              <div className="text-2xl font-bold text-green-400 mb-2">
                {fiiData.length}
              </div>
              <div className="text-sm text-gray-400">FII Records</div>
            </div>
            
            <div className="text-center p-4 bg-dark-700 rounded-lg">
              <div className="text-2xl font-bold text-purple-400 mb-2">
                {participantData.length > 0 ? 
                  [...new Set(participantData.map(item => item.date))].length : 0}
              </div>
              <div className="text-sm text-gray-400">Trading Days</div>
            </div>
            
            <div className="text-center p-4 bg-dark-700 rounded-lg">
              <div className="text-2xl font-bold text-orange-400 mb-2">
                {participantData.length > 0 ? 
                  [...new Set(participantData.map(item => item.client_type))].length : 0}
              </div>
              <div className="text-sm text-gray-400">Participant Types</div>
            </div>
          </div>
        </div>

        {/* Main Analysis Component */}
        <AdvancedMathematicalAnalysis 
          participantData={participantData} 
          fiiData={fiiData} 
        />

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>Advanced Mathematical Analysis powered by quantum-level statistical modeling</p>
          <p className="mt-2">
            Features: Time Series Analysis • Risk Metrics • Structural Breaks • Monte Carlo • Machine Learning
          </p>
        </div>
      </div>
    </div>
  )
}

export default AdvancedMathPage