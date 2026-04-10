import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AdvancedMathematicalAnalysis from '../components/AdvancedMathematicalAnalysis'
import { Brain, Database, TrendingUp, Shield, AlertTriangle, Cpu, BarChart3 } from 'lucide-react'
import AnimatedLoader from '../components/AnimatedLoader'

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
      
      const participantResponse = await fetch('/data/participant_oi.json')
      if (!participantResponse.ok) {
        throw new Error('Failed to load participant data')
      }
      const participantJson = await participantResponse.json()
      setParticipantData(participantJson)

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
        staggerChildren: 0.08
      }
    }
  }

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 15
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <AnimatedLoader text="Initializing Statistical Models..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <div className="text-rose-400 text-sm mb-4">Error: {error}</div>
          <button 
            onClick={loadData}
            className="px-4 py-2 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 rounded-lg transition-colors text-xs font-semibold"
          >
            Retry Data Load
          </button>
        </div>
      </div>
    )
  }

  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div className="text-center" variants={itemVariants}>
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Quantitative Mathematical Models</h1>
        <p className="text-slate-400 text-sm">Regime detection, cyclical frequencies, risk metrics & Monte Carlo simulations</p>
      </motion.div>

      {/* Main Analysis Component */}
      <motion.div variants={itemVariants}>
        <AdvancedMathematicalAnalysis 
          participantData={participantData} 
          fiiData={fiiData} 
        />
      </motion.div>
    </motion.div>
  )
}

export default AdvancedMathPage