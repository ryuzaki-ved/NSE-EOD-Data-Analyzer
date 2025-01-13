import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <div className="text-purple-400 text-lg animate-pulse-slow">Loading Advanced Mathematical Analysis...</div>
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
    <motion.div 
      className="min-h-screen bg-dark-900"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div className="mb-8" variants={itemVariants}>
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold gradient-text">Advanced Mathematical Analysis</h1>
              <p className="text-gray-400 mt-2">Quantum-level insights through complex statistical modeling</p>
            </div>
          </div>
          
          <motion.div className="flex flex-wrap gap-2 mt-4" variants={containerVariants}>
            <motion.div className="px-3 py-1 bg-purple-500/20 rounded-full text-xs text-purple-400 border border-purple-500/30 hover-lift" variants={itemVariants}>
              QUANTUM ANALYTICS
            </motion.div>
            <motion.div className="px-3 py-1 bg-blue-500/20 rounded-full text-xs text-blue-400 border border-blue-500/30 hover-lift" variants={itemVariants}>
              TIME SERIES
            </motion.div>
            <motion.div className="px-3 py-1 bg-green-500/20 rounded-full text-xs text-green-400 border border-green-500/30 hover-lift" variants={itemVariants}>
              RISK METRICS
            </motion.div>
            <motion.div className="px-3 py-1 bg-red-500/20 rounded-full text-xs text-red-400 border border-red-500/30 hover-lift" variants={itemVariants}>
              STRUCTURAL BREAKS
            </motion.div>
            <motion.div className="px-3 py-1 bg-cyan-500/20 rounded-full text-xs text-cyan-400 border border-cyan-500/30 hover-lift" variants={itemVariants}>
              MONTE CARLO
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Feature Overview */}
        <motion.div className="glass-card p-6 border border-purple-500/20 mb-8" variants={itemVariants}>
          <h2 className="text-2xl font-semibold mb-6 flex items-center">
            <Database className="h-6 w-6 mr-2 text-purple-400" />
            Advanced Mathematical Features
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <motion.div className="p-4 bg-dark-700/50 rounded-lg border border-blue-500/20 hover-lift" variants={itemVariants}>
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
            </motion.div>

            <motion.div className="p-4 bg-dark-700/50 rounded-lg border border-green-500/20 hover-lift" variants={itemVariants}>
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
            </motion.div>

            <motion.div className="p-4 bg-dark-700/50 rounded-lg border border-red-500/20 hover-lift" variants={itemVariants}>
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
            </motion.div>

            <motion.div className="p-4 bg-dark-700/50 rounded-lg border border-purple-500/20 hover-lift" variants={itemVariants}>
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
            </motion.div>

            <motion.div className="p-4 bg-dark-700/50 rounded-lg border border-cyan-500/20 hover-lift" variants={itemVariants}>
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
            </motion.div>

            <motion.div className="p-4 bg-dark-700/50 rounded-lg border border-orange-500/20 hover-lift" variants={itemVariants}>
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
            </motion.div>
          </div>
        </motion.div>

        {/* Data Summary */}
        <motion.div className="glass-card p-6 border border-gray-500/20 mb-8" variants={itemVariants}>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Database className="h-5 w-5 mr-2 text-gray-400" />
            Data Summary
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <motion.div className="text-center p-4 bg-dark-700/50 rounded-lg hover-lift" variants={itemVariants}>
              <div className="text-2xl font-bold text-blue-400 mb-2">
                {participantData.length}
              </div>
              <div className="text-sm text-gray-400">Total Records</div>
            </motion.div>
            
            <motion.div className="text-center p-4 bg-dark-700/50 rounded-lg hover-lift" variants={itemVariants}>
              <div className="text-2xl font-bold text-green-400 mb-2">
                {fiiData.length}
              </div>
              <div className="text-sm text-gray-400">FII Records</div>
            </motion.div>
            
            <motion.div className="text-center p-4 bg-dark-700/50 rounded-lg hover-lift" variants={itemVariants}>
              <div className="text-2xl font-bold text-purple-400 mb-2">
                {participantData.length > 0 ? 
                  [...new Set(participantData.map(item => item.date))].length : 0}
              </div>
              <div className="text-sm text-gray-400">Trading Days</div>
            </motion.div>
            
            <motion.div className="text-center p-4 bg-dark-700/50 rounded-lg hover-lift" variants={itemVariants}>
              <div className="text-2xl font-bold text-orange-400 mb-2">
                {participantData.length > 0 ? 
                  [...new Set(participantData.map(item => item.client_type))].length : 0}
              </div>
              <div className="text-sm text-gray-400">Participant Types</div>
            </motion.div>
          </div>
        </motion.div>

        {/* Main Analysis Component */}
        <motion.div variants={itemVariants}>
          <AdvancedMathematicalAnalysis 
            participantData={participantData} 
            fiiData={fiiData} 
          />
        </motion.div>

        {/* Footer */}
        <motion.div className="mt-12 text-center text-gray-500 text-sm" variants={itemVariants}>
          <p>Advanced Mathematical Analysis powered by quantum-level statistical modeling</p>
          <p className="mt-2">
            Features: Time Series Analysis • Risk Metrics • Structural Breaks • Monte Carlo • Machine Learning
          </p>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default AdvancedMathPage