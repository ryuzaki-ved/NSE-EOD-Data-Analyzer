import React, { useState, useEffect } from 'react'
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
        
        // Calculate advanced data for latest date
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  const participantRecords = participantData.length
  const fiiRecords = fiiData.length
  const tradingDays = new Set(participantData.map(item => item.date)).size

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold gradient-text mb-4">Advanced Correlation Analysis</h1>
        <p className="text-gray-400 text-lg">Comprehensive analysis of market participant relationships and position dynamics</p>
      </div>

      {/* Data Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 border border-blue-500/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <TrendingUp className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{participantRecords}</h3>
              <p className="text-gray-400">Participant Records</p>
            </div>
          </div>
        </div>
        
        <div className="glass-card p-6 border border-green-500/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-green-500/20">
              <TrendingDown className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{fiiRecords}</h3>
              <p className="text-gray-400">FII Records</p>
            </div>
          </div>
        </div>
        
        <div className="glass-card p-6 border border-purple-500/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <ArrowUpDown className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{tradingDays}</h3>
              <p className="text-gray-400">Trading Days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Participant Behavior Patterns */}
      {behaviorPatterns && Object.keys(behaviorPatterns).length > 0 && (
        <div className="glass-card p-6 border border-indigo-500/20">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2 text-indigo-400" />
            Participant Behavior Patterns
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {['Client', 'DII', 'FII', 'Pro'].map(participant => {
              const pattern = behaviorPatterns[participant]
              if (!pattern) return null
              
              return (
                <div key={participant} className="p-4 bg-dark-700 rounded-lg border border-gray-600">
                  <h4 className="text-lg font-semibold text-white mb-3">{participant}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Trading Style:</span>
                      <span className={`font-semibold ${
                        pattern.tradingStyle === 'Bullish' ? 'text-green-400' : 
                        pattern.tradingStyle === 'Bearish' ? 'text-red-400' : 'text-gray-400'
                      }`}>
                        {pattern.tradingStyle}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Risk Profile:</span>
                      <span className={`font-semibold ${
                        pattern.riskProfile === 'High' ? 'text-red-400' : 
                        pattern.riskProfile === 'Medium' ? 'text-yellow-400' : 'text-green-400'
                      }`}>
                        {pattern.riskProfile}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Consistency:</span>
                      <span className={`font-semibold ${
                        pattern.consistency === 'Consistent' ? 'text-green-400' : 'text-orange-400'
                      }`}>
                        {pattern.consistency}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Net Bias:</span>
                      <span className={`font-semibold ${getPositionChangeColorClass(pattern.netBias)}`}>
                        {formatPositionChange(pattern.netBias)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Volatility:</span>
                      <span className="font-semibold text-white">
                        {pattern.volatility.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Position Changes Summary */}
      {advancedData.positionChanges && Object.keys(advancedData.positionChanges).length > 0 && (
        <div className="glass-card p-6 border border-orange-500/20">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <ArrowUpDown className="h-5 w-5 mr-2 text-orange-400" />
            Latest Position Changes Summary - {advancedData.previousDate} → {advancedData.currentDate}
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {['Client', 'DII', 'FII', 'Pro'].map(participant => {
              const summary = getPositionChangeSummary(advancedData.positionChanges, participant)
              if (!summary) return null
              
              return (
                <div key={participant} className="p-4 bg-dark-700 rounded-lg border border-gray-600">
                  <h4 className="text-lg font-semibold text-white mb-3">{participant}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Net Change:</span>
                      <span className={`font-semibold ${getPositionChangeColorClass(summary.netChange)}`}>
                        {formatPositionChange(summary.netChange)}
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
                    <div className="flex justify-between">
                      <span className="text-gray-400">Magnitude:</span>
                      <span className="font-semibold text-white">
                        {summary.magnitude.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Momentum Summary */}
      {momentumData && Object.keys(momentumData).length > 0 && (
        <div className="glass-card p-6 border border-purple-500/20">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <TrendingDown className="h-5 w-5 mr-2 text-purple-400" />
            Momentum Indicators - {advancedData.currentDate}
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {['Client', 'DII', 'FII', 'Pro'].map(participant => {
              const momentum = momentumData[participant]
              if (!momentum) return null
              
              return (
                <div key={participant} className="p-4 bg-dark-700 rounded-lg border border-gray-600">
                  <h4 className="text-lg font-semibold text-white mb-3">{participant}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Momentum Score:</span>
                      <span className={`font-semibold ${
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
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Main Correlation Analysis Component */}
      <CorrelationAnalysis participantData={participantData} fiiData={fiiData} />
    </div>
  )
}

export default CorrelationPage 