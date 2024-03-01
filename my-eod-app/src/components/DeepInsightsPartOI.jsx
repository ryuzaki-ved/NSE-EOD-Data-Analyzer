import React from 'react'
import { Eye, Target, Calendar, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { getRatioClass, formatRatio, formatDifference } from '../utils/partOIHelpers'

// Color mapping for participants
const PARTICIPANT_COLORS = {
  'Client': '#0ea5e9',
  'Pro': '#f59e0b',
  'DII': '#10b981',
  'FII': '#ef4444',
}

const DeepInsights = ({
  latestDate,
  previousDate,
  ratioData,
  dailyChangeData,
  generateInsights,
  generateDailyChangeInsights,
  groupedInsights = {},
  groupedDailyChangeInsights = {},
  data,
}) => {
  // Helper to get color for participant
  const getColor = (name) => PARTICIPANT_COLORS[name] || '#64748b' // fallback: slate-400

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
        
        {/* Market Positioning Insights - Grouped by participant with vertical lines */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <h5 className="text-lg font-semibold text-purple-400 mb-4">Market Positioning Insights</h5>
          <div className="flex flex-col gap-6">
            {Object.entries(groupedInsights).length > 0
              ? Object.entries(groupedInsights).map(([clientType, insights]) => (
                  <div key={clientType} className="flex">
                    <div
                      className="mr-4"
                      style={{
                        borderLeft: `5px solid ${getColor(clientType)}`,
                        paddingLeft: 16,
                        minWidth: 0,
                      }}
                    >
                      <div className="font-bold mb-2" style={{ color: getColor(clientType) }}>{clientType}</div>
                      <div className="flex flex-col gap-2">{insights}</div>
                    </div>
                  </div>
                ))
              : <div className="space-y-3">{generateInsights()}</div>
            }
          </div>
        </div>
      </div>

             {/* Daily Changes Analysis */}
       <div className="glass-card p-6 border border-cyan-500/20 mb-8">
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
         
         {/* Daily Change Insights - Grouped by participant with vertical lines */}
         <div className="pt-4 border-t border-gray-700">
           <h5 className="text-lg font-semibold text-cyan-400 mb-4">Daily Position Change Insights</h5>
           <div className="flex flex-col gap-6">
             {Object.entries(groupedDailyChangeInsights).length > 0
               ? Object.entries(groupedDailyChangeInsights).map(([clientType, insights]) => (
                   <div key={clientType} className="flex">
                     <div
                       className="mr-4"
                       style={{
                         borderLeft: `5px solid ${getColor(clientType)}`,
                         paddingLeft: 16,
                         minWidth: 0,
                       }}
                     >
                       {/* Use a neutral color for the participant name in the 2nd section */}
                       <div className="font-bold mb-2" style={{ color: '#a589b4' }}>{clientType}</div>
                       <div className="flex flex-col gap-2">{insights}</div>
                     </div>
                   </div>
                 ))
               : <div className="space-y-3">{generateDailyChangeInsights()}</div>
             }
           </div>
         </div>
       </div>

       {/* Score Sentiment Analysis */}
       <div className="glass-card p-6 border border-purple-500/20">
         <div className="flex items-center space-x-2 mb-4">
           <TrendingUp className="h-5 w-5 text-purple-400" />
           <h4 className="text-xl font-semibold">Score Sentiment Analysis</h4>
           <div className="text-sm text-gray-400">({latestDate})</div>
         </div>
         
         {(() => {
           // Calculate sentiment data
           if (!data || !latestDate) return <div className="text-gray-400">No data available</div>

           const latestData = data.filter(item => item.date === latestDate)
           if (latestData.length === 0) return <div className="text-gray-400">No data available</div>

           // Calculate totals for all index options positions
           let totalCallLong = 0
           let totalPutLong = 0
           let totalCallShort = 0
           let totalPutShort = 0

           // Participant-wise totals
           const participantTotals = {
             Client: { callLong: 0, putLong: 0, callShort: 0, putShort: 0 },
             FII: { callLong: 0, putLong: 0, callShort: 0, putShort: 0 },
             DII: { callLong: 0, putLong: 0, callShort: 0, putShort: 0 },
             Pro: { callLong: 0, putLong: 0, callShort: 0, putShort: 0 }
           }

           latestData.forEach(item => {
             const callLong = item.option_index_call_long || 0
             const putLong = item.option_index_put_long || 0
             const callShort = item.option_index_call_short || 0
             const putShort = item.option_index_put_short || 0

             totalCallLong += callLong
             totalPutLong += putLong
             totalCallShort += callShort
             totalPutShort += putShort

             if (participantTotals[item.client_type]) {
               participantTotals[item.client_type].callLong += callLong
               participantTotals[item.client_type].putLong += putLong
               participantTotals[item.client_type].callShort += callShort
               participantTotals[item.client_type].putShort += putShort
             }
           })

           const grandTotal = totalCallLong + totalPutLong + totalCallShort + totalPutShort

           // Calculate participant percentages
           const participantPercentages = {}
           Object.keys(participantTotals).forEach(participant => {
             const totals = participantTotals[participant]
             participantPercentages[participant] = {
               callLong: grandTotal > 0 ? (totals.callLong / grandTotal) * 100 : 0,
               putLong: grandTotal > 0 ? (totals.putLong / grandTotal) * 100 : 0,
               callShort: grandTotal > 0 ? (totals.callShort / grandTotal) * 100 : 0,
               putShort: grandTotal > 0 ? (totals.putShort / grandTotal) * 100 : 0
             }
           })

           // Calculate sentiment score
           let sentimentScore = 0
           Object.keys(participantPercentages).forEach(participant => {
             const percentages = participantPercentages[participant]
             sentimentScore += percentages.callLong
             sentimentScore += percentages.putShort
             sentimentScore -= percentages.callShort
             sentimentScore -= percentages.putLong
           })

           // Determine sentiment category
           let sentimentCategory = ''
           let sentimentColor = ''
           let sentimentIcon = null

           if (sentimentScore <= -30) {
             sentimentCategory = 'Highly Bearish'
             sentimentColor = 'text-red-500'
             sentimentIcon = <TrendingDown className="h-5 w-5 text-red-500" />
           } else if (sentimentScore <= -10) {
             sentimentCategory = 'Bearish'
             sentimentColor = 'text-orange-500'
             sentimentIcon = <TrendingDown className="h-5 w-5 text-orange-500" />
           } else if (sentimentScore <= -5) {
             sentimentCategory = 'Slightly Bearish'
             sentimentColor = 'text-yellow-500'
             sentimentIcon = <TrendingDown className="h-5 w-5 text-yellow-500" />
           } else if (sentimentScore >= -5 && sentimentScore <= 5) {
             sentimentCategory = 'Neutral'
             sentimentColor = 'text-gray-400'
             sentimentIcon = <Minus className="h-5 w-5 text-gray-400" />
           } else if (sentimentScore <= 10) {
             sentimentCategory = 'Slightly Bullish'
             sentimentColor = 'text-blue-500'
             sentimentIcon = <TrendingUp className="h-5 w-5 text-blue-500" />
           } else if (sentimentScore <= 30) {
             sentimentCategory = 'Bullish'
             sentimentColor = 'text-green-500'
             sentimentIcon = <TrendingUp className="h-5 w-5 text-green-500" />
           } else {
             sentimentCategory = 'Highly Bullish'
             sentimentColor = 'text-emerald-500'
             sentimentIcon = <TrendingUp className="h-5 w-5 text-emerald-500" />
           }

           return (
             <div>
               {/* Overall Sentiment Score */}
               <div className="mb-6">
                 <div className="flex items-center justify-between mb-4">
                   <h5 className="text-lg font-semibold text-white">Overall Market Sentiment</h5>
                   <div className="flex items-center space-x-2">
                     {sentimentIcon}
                     <span className={`text-lg font-bold ${sentimentColor}`}>
                       {sentimentCategory}
                     </span>
                   </div>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                   <div className="glass-card p-4">
                     <div className="text-center">
                       <div className="text-2xl font-bold text-primary-400">
                         {sentimentScore.toFixed(2)}
                       </div>
                       <div className="text-sm text-gray-400">Sentiment Score</div>
                     </div>
                   </div>
                   <div className="glass-card p-4">
                     <div className="text-center">
                       <div className="text-2xl font-bold text-green-400">
                         {grandTotal.toLocaleString('en-IN')}
                       </div>
                       <div className="text-sm text-gray-400">Total Positions</div>
                     </div>
                   </div>
                 </div>
               </div>

               {/* Participant Breakdown */}
               <div className="space-y-4">
                 <h5 className="text-lg font-semibold text-white">Participant Sentiment Breakdown</h5>
                 
                 {Object.keys(participantPercentages).map(participant => {
                   const percentages = participantPercentages[participant]
                   const totals = participantTotals[participant]
                   
                   const participantScore = (
                     percentages.callLong + 
                     percentages.putShort - 
                     percentages.callShort - 
                     percentages.putLong
                   ).toFixed(2)

                   let participantSentiment = ''
                   let participantColor = ''

                   if (participantScore <= -10) {
                     participantSentiment = 'Bearish'
                     participantColor = 'text-red-400'
                   } else if (participantScore <= -5) {
                     participantSentiment = 'Slightly Bearish'
                     participantColor = 'text-orange-400'
                   } else if (participantScore >= -5 && participantScore <= 5) {
                     participantSentiment = 'Neutral'
                     participantColor = 'text-gray-400'
                   } else if (participantScore <= 10) {
                     participantSentiment = 'Slightly Bullish'
                     participantColor = 'text-blue-400'
                   } else {
                     participantSentiment = 'Bullish'
                     participantColor = 'text-green-400'
                   }

                   return (
                     <div key={participant} className="glass-card p-4">
                       <div className="flex items-center justify-between mb-3">
                         <h6 className="text-lg font-semibold text-white">{participant}</h6>
                         <div className="flex items-center space-x-2">
                           <span className={`text-sm font-medium ${participantColor}`}>
                             {participantSentiment}
                           </span>
                           <span className="text-sm text-gray-400">
                             ({participantScore})
                           </span>
                         </div>
                       </div>
                       
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                         <div className="text-center">
                           <div className="text-green-400 font-semibold">
                             {percentages.callLong.toFixed(1)}%
                           </div>
                           <div className="text-gray-400">Call Long</div>
                           <div className="text-xs text-gray-500">
                             {totals.callLong.toLocaleString('en-IN')}
                           </div>
                         </div>
                         <div className="text-center">
                           <div className="text-purple-400 font-semibold">
                             {percentages.putLong.toFixed(1)}%
                           </div>
                           <div className="text-gray-400">Put Long</div>
                           <div className="text-xs text-gray-500">
                             {totals.putLong.toLocaleString('en-IN')}
                           </div>
                         </div>
                         <div className="text-center">
                           <div className="text-red-400 font-semibold">
                             {percentages.callShort.toFixed(1)}%
                           </div>
                           <div className="text-gray-400">Call Short</div>
                           <div className="text-xs text-gray-500">
                             {totals.callShort.toLocaleString('en-IN')}
                           </div>
                         </div>
                         <div className="text-center">
                           <div className="text-blue-400 font-semibold">
                             {percentages.putShort.toFixed(1)}%
                           </div>
                           <div className="text-gray-400">Put Short</div>
                           <div className="text-xs text-gray-500">
                             {totals.putShort.toLocaleString('en-IN')}
                           </div>
                         </div>
                       </div>
                     </div>
                   )
                 })}
               </div>

               {/* Sentiment Explanation */}
               <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-500/20">
                 <h6 className="text-sm font-semibold text-purple-400 mb-2">How to Read Sentiment:</h6>
                 <ul className="text-xs text-gray-300 space-y-1">
                   <li>• <span className="text-green-400">Call Long + Put Short</span> = Bullish positions (positive score)</li>
                   <li>• <span className="text-red-400">Call Short + Put Long</span> = Bearish positions (negative score)</li>
                   <li>• Higher positive score = More bullish sentiment</li>
                   <li>• Lower negative score = More bearish sentiment</li>
                 </ul>
               </div>
             </div>
           )
         })()}
       </div>
    </div>
  )
}

export default DeepInsights 