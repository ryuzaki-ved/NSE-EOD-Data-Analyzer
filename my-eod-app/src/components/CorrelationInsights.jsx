import React, { useState, useEffect } from 'react'
import { 
  calculateParticipantCorrelations,
  getCorrelationStrength,
  getCorrelationDirection,
  formatCorrelation,
  getCorrelationColorClass
} from '../utils/correlationHelpers'
import { TrendingUp, Activity, Target } from 'lucide-react'

const CorrelationInsights = ({ participantData, fiiData }) => {
  const [correlations, setCorrelations] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (participantData && participantData.length > 0) {
      const corrData = calculateParticipantCorrelations(participantData)
      setCorrelations(corrData)
      setLoading(false)
    }
  }, [participantData])

  if (loading) {
    return (
      <div className="glass-card p-6 border border-blue-500/20">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-700 rounded"></div>
            <div className="h-3 bg-gray-700 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  // Get top correlations
  const getTopCorrelations = () => {
    const allCorrelations = []
    const participants = ['Client', 'DII', 'FII', 'Pro']
    
    participants.forEach(p1 => {
      participants.forEach(p2 => {
        if (p1 !== p2) {
          const corr = correlations[p1]?.[p2]?.overall
          if (corr !== null && corr !== undefined) {
            allCorrelations.push({
              pair: `${p1} ↔ ${p2}`,
              correlation: corr,
              strength: getCorrelationStrength(corr),
              direction: getCorrelationDirection(corr)
            })
          }
        }
      })
    })
    
    return allCorrelations
      .sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation))
      .slice(0, 3)
  }

  const topCorrelations = getTopCorrelations()

  return (
    <div className="glass-card p-6 border border-blue-500/20 bg-gradient-to-br from-blue-900/10 to-purple-900/10">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500">
          <TrendingUp className="h-5 w-5 text-white" />
        </div>
        <h3 className="text-xl font-semibold">Correlation Insights</h3>
        <div className="px-2 py-1 bg-blue-500/20 rounded-full text-xs text-blue-400 border border-blue-500/30">
          QUICK VIEW
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
            <Target className="h-4 w-4 mr-2 text-blue-400" />
            Top Participant Correlations
          </h4>
          <div className="space-y-2">
            {topCorrelations.map((corr, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-dark-700/50 rounded-lg">
                <span className="text-sm text-gray-300">{corr.pair}</span>
                <div className="text-right">
                  <div className={`text-sm font-semibold ${getCorrelationColorClass(corr.correlation)}`}>
                    {formatCorrelation(corr.correlation)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {corr.strength} {corr.direction}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-700">
          <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
            <Activity className="h-4 w-4 mr-2 text-purple-400" />
            Key Insights
          </h4>
          <div className="text-xs text-gray-400 space-y-1">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              <span>Strong correlations indicate synchronized trading patterns</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
              <span>Negative correlations suggest opposing strategies</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
              <span>Use for portfolio diversification and risk management</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CorrelationInsights 