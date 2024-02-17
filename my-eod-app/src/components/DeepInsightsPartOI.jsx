import React from 'react'
import { Eye, Target, Calendar } from 'lucide-react'

const DeepInsights = ({
  latestDate,
  previousDate,
  ratioData,
  dailyChangeData,
  getRatioClass,
  formatRatio,
  formatDifference,
  generateInsights,
  generateDailyChangeInsights
}) => {
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

      {/* Overall Positions Analysis */}
      <div className="glass-card p-6 border border-primary-500/20 mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <Target className="h-5 w-5 text-primary-400" />
          <h4 className="text-xl font-semibold">Index Options Ratio Analysis (Overall Positions)</h4>
          <div className="text-sm text-gray-400">({latestDate})</div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-300">Client Type</th>
                <th className="text-center py-3 px-4 font-medium text-gray-300">Call Buy / Put Buy</th>
                <th className="text-center py-3 px-4 font-medium text-gray-300">Call Buy / Call Sell</th>
                <th className="text-center py-3 px-4 font-medium text-gray-300">Put Sell / Put Buy</th>
                <th className="text-center py-3 px-4 font-medium text-gray-300">Put Sell / Call Sell</th>
              </tr>
            </thead>
            <tbody>
              {ratioData.map((row, index) => (
                <tr key={index} className="border-b border-gray-800 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 font-semibold text-primary-400">{row.clientType}</td>
                  <td className={`py-3 px-4 text-center ${getRatioClass(row.callBuyPutBuy)}`}>
                    {formatRatio(row.callBuyPutBuy)}
                  </td>
                  <td className={`py-3 px-4 text-center ${getRatioClass(row.callBuyCallSell)}`}>
                    {formatRatio(row.callBuyCallSell)}
                  </td>
                  <td className={`py-3 px-4 text-center ${getRatioClass(row.putSellPutBuy)}`}>
                    {formatRatio(row.putSellPutBuy)}
                  </td>
                  <td className={`py-3 px-4 text-center ${getRatioClass(row.putSellCallSell)}`}>
                    {formatRatio(row.putSellCallSell)}
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
              <span>{'Ratio > 1 (Green)'}</span>
            </span>
            <span className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-red-400 rounded-full"></span>
              <span>Ratio {'<'} 1 (Red)</span>
            </span>
            <span className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
              <span>{'Strong Signal > 1.5 or < 0.7 (Flaming)'}</span>
            </span>
          </div>
        </div>
        
        {/* Market Positioning Insights */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <h5 className="text-lg font-semibold text-purple-400 mb-4">Market Positioning Insights</h5>
          <div className="space-y-3">
            {generateInsights()}
          </div>
        </div>
      </div>

      {/* Daily Changes Analysis */}
      <div className="glass-card p-6 border border-cyan-500/20">
        <div className="flex items-center space-x-2 mb-4">
          <Calendar className="h-5 w-5 text-cyan-400" />
          <h4 className="text-xl font-semibold">Positions made today (Daily Changes)</h4>
          <div className="text-sm text-gray-400">({previousDate} → {latestDate})</div>
        </div>
        
        {/* Daily Changes Table */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-300">Client Type</th>
                <th className="text-center py-3 px-4 font-medium text-gray-300">Call Long Diff</th>
                <th className="text-center py-3 px-4 font-medium text-gray-300">Put Long Diff</th>
                <th className="text-center py-3 px-4 font-medium text-gray-300">Call Short Diff</th>
                <th className="text-center py-3 px-4 font-medium text-gray-300">Put Short Diff</th>
              </tr>
            </thead>
            <tbody>
              {dailyChangeData.map((row, index) => (
                <tr key={index} className="border-b border-gray-800 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 font-semibold text-cyan-400">{row.clientType}</td>
                  <td className={`py-3 px-4 text-center font-semibold ${row.callLongDiff >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatDifference(row.callLongDiff)}</td>
                  <td className={`py-3 px-4 text-center font-semibold ${row.putLongDiff >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatDifference(row.putLongDiff)}</td>
                  <td className={`py-3 px-4 text-center font-semibold ${row.callShortDiff >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatDifference(row.callShortDiff)}</td>
                  <td className={`py-3 px-4 text-center font-semibold ${row.putShortDiff >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatDifference(row.putShortDiff)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Daily Ratio Analysis Table */}
        <div className="overflow-x-auto mb-6">
          <h5 className="text-lg font-semibold mb-3">Daily Change Ratios</h5>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-300">Client Type</th>
                <th className="text-center py-3 px-4 font-medium text-gray-300">Call Buy / Put Buy</th>
                <th className="text-center py-3 px-4 font-medium text-gray-300">Call Buy / Call Sell</th>
                <th className="text-center py-3 px-4 font-medium text-gray-300">Put Sell / Put Buy</th>
                <th className="text-center py-3 px-4 font-medium text-gray-300">Put Sell / Call Sell</th>
              </tr>
            </thead>
            <tbody>
              {dailyChangeData.map((row, index) => (
                <tr key={index} className="border-b border-gray-800 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 font-semibold text-cyan-400">{row.clientType}</td>
                  <td className={`py-3 px-4 text-center ${getRatioClass(row.callBuyPutBuy)}`}>{formatRatio(row.callBuyPutBuy)}</td>
                  <td className={`py-3 px-4 text-center ${getRatioClass(row.callBuyCallSell)}`}>{formatRatio(row.callBuyCallSell)}</td>
                  <td className={`py-3 px-4 text-center ${getRatioClass(row.putSellPutBuy)}`}>{formatRatio(row.putSellPutBuy)}</td>
                  <td className={`py-3 px-4 text-center ${getRatioClass(row.putSellCallSell)}`}>{formatRatio(row.putSellCallSell)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Daily Change Insights */}
        <div className="pt-4 border-t border-gray-700">
          <h5 className="text-lg font-semibold text-cyan-400 mb-4">Daily Position Change Insights</h5>
          <div className="space-y-3">
            {generateDailyChangeInsights()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeepInsights 