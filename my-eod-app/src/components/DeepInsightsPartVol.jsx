import React from 'react'
import { Eye, Target, TrendingUp, TrendingDown } from 'lucide-react'
import { formatDifference } from '../utils/partOIHelpers'

const DeepInsightsPartVol = ({ data, latestDate, previousDate }) => {
  if (!data || data.length === 0) {
    return null
  }

  const getValueColor = (value) => {
    if (value > 0) return 'text-green-400 font-semibold'
    if (value < 0) return 'text-red-400 font-semibold'
    return 'text-gray-300'
  }

  const getBackgroundColor = (value) => {
    if (value > 0) return 'bg-green-500/10'
    if (value < 0) return 'bg-red-500/10'
    return 'bg-gray-500/10'
  }

  return (
    <div className="glass-card p-8 border-2 border-primary-500/30 bg-gradient-to-br from-primary-900/10 to-purple-900/10 glow-gold-border">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-r from-primary-500 to-purple-500">
          <Eye className="h-6 w-6 text-white" />
        </div>
        <h2 className="text-3xl font-bold gradient-text">Deep Insights</h2>
        <div className="px-3 py-1 bg-primary-500/20 rounded-full text-xs text-primary-400 border border-primary-500/30">
          PREMIUM INSIGHTS
        </div>
      </div>

      {/* Volume Analysis with OI Adjustments */}
      <div className="glass-card p-6 border border-primary-500/20 mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <Target className="h-5 w-5 text-primary-400" />
          <h4 className="text-xl font-semibold">Index Options Volume Analysis (OI Adjusted)</h4>
          <div className="text-sm text-gray-400">({previousDate} → {latestDate})</div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-300">Client Type</th>
                <th className="text-center py-3 px-4 font-medium text-gray-300">Call Long</th>
                <th className="text-center py-3 px-4 font-medium text-gray-300">Put Long</th>
                <th className="text-center py-3 px-4 font-medium text-gray-300">Call Short</th>
                <th className="text-center py-3 px-4 font-medium text-gray-300">Put Short</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index} className="border-b border-gray-800 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 font-semibold text-primary-400">{row.clientType}</td>
                  <td className={`py-3 px-4 text-center ${getValueColor(row.callLong)} ${getBackgroundColor(row.callLong)} rounded px-2 py-1`}>
                    {formatDifference(row.callLong)}
                  </td>
                  <td className={`py-3 px-4 text-center ${getValueColor(row.putLong)} ${getBackgroundColor(row.putLong)} rounded px-2 py-1`}>
                    {formatDifference(row.putLong)}
                  </td>
                  <td className={`py-3 px-4 text-center ${getValueColor(row.callShort)} ${getBackgroundColor(row.callShort)} rounded px-2 py-1`}>
                    {formatDifference(row.callShort)}
                  </td>
                  <td className={`py-3 px-4 text-center ${getValueColor(row.putShort)} ${getBackgroundColor(row.putShort)} rounded px-2 py-1`}>
                    {formatDifference(row.putShort)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 text-xs text-gray-400 space-y-1">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-green-400 rounded-full"></span>
              <span>Positive Values (Green)</span>
            </span>
            <span className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-red-400 rounded-full"></span>
              <span>Negative Values (Red)</span>
            </span>
          </div>
          <p className="text-gray-400 text-xs mt-2">
            * Values are adjusted based on OI changes: Positive OI changes add to same category, Negative OI changes add to opposite category
          </p>
        </div>
      </div>

      {/* Breakdown Analysis */}
      <div className="glass-card p-6 border border-cyan-500/20">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="h-5 w-5 text-cyan-400" />
          <h4 className="text-xl font-semibold">Original Volume vs Adjusted Volume</h4>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-300">Client Type</th>
                <th className="text-center py-3 px-4 font-medium text-gray-300">Original Call Long</th>
                <th className="text-center py-3 px-4 font-medium text-gray-300">Original Put Long</th>
                <th className="text-center py-3 px-4 font-medium text-gray-300">Original Call Short</th>
                <th className="text-center py-3 px-4 font-medium text-gray-300">Original Put Short</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index} className="border-b border-gray-800 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 font-semibold text-cyan-400">{row.clientType}</td>
                  <td className={`py-3 px-4 text-center ${getValueColor(row.originalCallLongVol)} ${getBackgroundColor(row.originalCallLongVol)} rounded px-2 py-1`}>
                    {formatDifference(row.originalCallLongVol)}
                  </td>
                  <td className={`py-3 px-4 text-center ${getValueColor(row.originalPutLongVol)} ${getBackgroundColor(row.originalPutLongVol)} rounded px-2 py-1`}>
                    {formatDifference(row.originalPutLongVol)}
                  </td>
                  <td className={`py-3 px-4 text-center ${getValueColor(row.originalCallShortVol)} ${getBackgroundColor(row.originalCallShortVol)} rounded px-2 py-1`}>
                    {formatDifference(row.originalCallShortVol)}
                  </td>
                  <td className={`py-3 px-4 text-center ${getValueColor(row.originalPutShortVol)} ${getBackgroundColor(row.originalPutShortVol)} rounded px-2 py-1`}>
                    {formatDifference(row.originalPutShortVol)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 text-xs text-gray-400 space-y-1">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-green-400 rounded-full"></span>
              <span>Positive Values (Green)</span>
            </span>
            <span className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-red-400 rounded-full"></span>
              <span>Negative Values (Red)</span>
            </span>
          </div>
          <p>
            * This table shows the original volume values from the latest trading day ({latestDate}) before OI adjustments
          </p>
        </div>
      </div>
    </div>
  )
}

export default DeepInsightsPartVol