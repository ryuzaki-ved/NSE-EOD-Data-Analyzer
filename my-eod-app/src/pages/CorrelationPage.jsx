import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CorrelationAnalysis from '../components/CorrelationAnalysis'
import { 
  calculateAdvancedCorrelations, 
  calculateMomentumIndicators,
  getPositionChangeSummary,
  formatPositionChange,
  getPositionChangeColorClass,
  calculateParticipantBehaviorPatterns
} from '../utils/correlationHelpers'
import { TrendingUp, TrendingDown, ArrowUpDown, Users, Activity } from 'lucide-react'
import AnimatedLoader from '../components/AnimatedLoader'

const CorrelationPage = () => {
  const [participantData, setParticipantData] = useState([])
  const [fiiData, setFiiData] = useState([])
  const [loading, setLoading] = useState(true)
  const [advancedData, setAdvancedData] = useState({})
  const [momentumData, setMomentumData] = useState({})
  const [behaviorPatterns, setBehaviorPatterns] = useState({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [participantResponse, fiiResponse] = await Promise.all([
          fetch('/data/participant_oi.json'),
          fetch('/data/fii_derivatives.json')
        ])
        
        const participantJson = await participantResponse.json()
        const fiiJson = await fiiResponse.json()
        
        setParticipantData(participantJson)
        setFiiData(fiiJson)
        
        if (participantJson.length > 0) {
          const advanced = calculateAdvancedCorrelations(participantJson)
          setAdvancedData(advanced)
          
          const momentum = calculateMomentumIndicators(participantJson)
          setMomentumData(momentum)
          
          const patterns = calculateParticipantBehaviorPatterns(participantJson)
          setBehaviorPatterns(patterns)
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Error fetching data:', error)
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <AnimatedLoader text="Computing Correlation Analysis..." />
      </div>
    )
  }

  const participantRecords = participantData.length
  const fiiRecords = fiiData.length
  const tradingDays = new Set(participantData.map(item => item.date)).size

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

  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div className="text-center" variants={itemVariants}>
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Cross-Participant Correlation Analysis</h1>
        <p className="text-slate-400 text-sm">Comprehensive analysis of market participant relationships and position dynamics</p>
      </motion.div>

      {/* Data Summary Cards */}
      <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-4" variants={containerVariants}>
        <motion.div className="glass-card p-5 border border-white/[0.07]" variants={itemVariants}>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
              <TrendingUp className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-mono text-white tabular-nums">{participantRecords.toLocaleString('en-IN')}</h3>
              <p className="text-xs text-slate-400">Participant Records</p>
            </div>
          </div>
        </motion.div>
        
        <motion.div className="glass-card p-5 border border-white/[0.07]" variants={itemVariants}>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <TrendingDown className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-mono text-white tabular-nums">{fiiRecords.toLocaleString('en-IN')}</h3>
              <p className="text-xs text-slate-400">FII Records</p>
            </div>
          </div>
        </motion.div>
        
        <motion.div className="glass-card p-5 border border-white/[0.07]" variants={itemVariants}>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <ArrowUpDown className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-mono text-white tabular-nums">{tradingDays}</h3>
              <p className="text-xs text-slate-400">Trading Days Analyzed</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Participant Behavior Patterns */}
      <AnimatePresence>
        {behaviorPatterns && Object.keys(behaviorPatterns).length > 0 && (
          <motion.div 
            className="glass-card p-6 border border-white/[0.07]"
            variants={itemVariants}
          >
            <h3 className="text-base font-bold text-white mb-4 flex items-center">
              <Users className="h-4 w-4 mr-2 text-cyan-400" />
              Participant Behavior Patterns
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {['Client', 'DII', 'FII', 'Pro'].map((participant, index) => {
                const pattern = behaviorPatterns[participant]
                if (!pattern) return null
                
                return (
                  <motion.div 
                    key={participant} 
                    className="p-4 bg-[#0B0F19]/60 rounded-xl border border-white/[0.06]"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-bold text-white">{participant}</h4>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        pattern.tradingStyle === 'Bullish' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                        pattern.tradingStyle === 'Bearish' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 
                        'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                      }`}>
                        {pattern.tradingStyle}
                      </span>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Risk Profile:</span>
                        <span className={`font-semibold ${
                          pattern.riskProfile === 'High' ? 'text-rose-400' : 
                          pattern.riskProfile === 'Medium' ? 'text-amber-400' : 'text-emerald-400'
                        }`}>
                          {pattern.riskProfile}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Consistency:</span>
                        <span className={`font-semibold ${
                          pattern.consistency === 'Consistent' ? 'text-emerald-400' : 'text-amber-400'
                        }`}>
                          {pattern.consistency}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Net Bias:</span>
                        <span className={`font-mono font-semibold ${getPositionChangeColorClass(pattern.netBias)}`}>
                          {formatPositionChange(pattern.netBias)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Volatility:</span>
                        <span className="font-mono font-semibold text-slate-200">
                          {pattern.volatility.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Correlation Analysis Component */}
      <motion.div variants={itemVariants}>
        <CorrelationAnalysis participantData={participantData} fiiData={fiiData} />
      </motion.div>
    </motion.div>
  )
}

export default CorrelationPage