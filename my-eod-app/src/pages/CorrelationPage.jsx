import React, { useState, useEffect } from 'react'
import CorrelationAnalysis from '../components/CorrelationAnalysis'
import { BarChart3, TrendingUp, Activity } from 'lucide-react'

const CorrelationPage = () => {
  const [participantData, setParticipantData] = useState([])
  const [fiiData, setFiiData] = useState([])
  const [loading, setLoading] = useState(true)

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
      } catch (error) {
        console.error('Error fetching correlation data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Correlation Analysis</h1>
          <p className="text-gray-400">
            Advanced statistical analysis of relationships between market participants and indicators
          </p>
        </div>
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <div className="px-3 py-1 bg-blue-500/20 rounded-full text-xs text-blue-400 border border-blue-500/30">
            ADVANCED ANALYTICS
          </div>
        </div>
      </div>

      {/* Data Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 border border-primary-500/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-primary-500/20">
              <BarChart3 className="h-5 w-5 text-primary-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {participantData.filter(item => item.client_type !== 'TOTAL').length}
              </div>
              <div className="text-sm text-gray-400">Participant Records</div>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 border border-green-500/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-green-500/20">
              <TrendingUp className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {fiiData.length}
              </div>
              <div className="text-sm text-gray-400">FII Records</div>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 border border-purple-500/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <Activity className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {new Set(participantData.map(item => item.date)).size}
              </div>
              <div className="text-sm text-gray-400">Trading Days</div>
            </div>
          </div>
        </div>
      </div>

      {/* Correlation Analysis Component */}
      <CorrelationAnalysis 
        participantData={participantData} 
        fiiData={fiiData} 
      />
    </div>
  )
}

export default CorrelationPage 