import React from 'react'
import { Eye, Target, Calendar, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { getRatioClass, formatRatio, formatDifference, getPreviousExpiryDate } from '../utils/partOIHelpers'
import DateSelector from './DateSelector'

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
  availableDates = [],
  onDateChange,
  onPrevDateChange
}) => {
  console.log('DeepInsights Component Rendered', { latestDate, previousDate });
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

      {/* Date Selector for Deep Insights */}
      <div className="flex justify-end mb-6">
        <div className="bg-dark-900/50 p-2 rounded-xl border border-white/5 inline-block">
          <DateSelector
            selectedDate={latestDate}
            previousDate={previousDate}
            availableDates={availableDates}
            onDateChange={onDateChange}
            onPrevDateChange={onPrevDateChange}
          />
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
              {/* Individual Participant Analysis Section */}
              <div className="space-y-4">
                {/* Overall Market Sentiment Header/Summary */}
                <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/40 rounded-lg p-4 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="text-lg font-semibold text-white">Overall Market Sentiment</h5>
                    <div className="flex items-center space-x-2">
                      {sentimentIcon}
                      <span className={`text-lg font-bold ${sentimentColor}`}>
                        {sentimentCategory}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary-400">
                          {sentimentScore.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-400">Sentiment Score</div>
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">
                          {grandTotal.toLocaleString('en-IN')}
                        </div>
                        <div className="text-sm text-gray-400">Total Positions</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Individual Participant Breakdowns */}
                <div className="mt-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <h5 className="text-lg font-semibold text-purple-400">Individual Participant Analysis</h5>
                  </div>

                  <div className="space-y-4">
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
                        <div key={participant} className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-lg p-4 backdrop-blur-sm">
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

              {/* Day Change Score Section */}
              <div className="mt-8 pt-6 border-t border-purple-500/20">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <h5 className="text-lg font-semibold text-purple-400">Day Change Score</h5>
                </div>

                {(() => {
                  // Calculate day change sentiment data
                  if (!data || !latestDate || !previousDate) return <div className="text-gray-400">No data available</div>

                  const latestData = data.filter(item => item.date === latestDate)
                  const previousData = data.filter(item => item.date === previousDate)

                  if (latestData.length === 0 || previousData.length === 0) return <div className="text-gray-400">No data available</div>

                  // Calculate day changes for all index options positions
                  let totalCallLongChange = 0
                  let totalPutLongChange = 0
                  let totalCallShortChange = 0
                  let totalPutShortChange = 0

                  // Participant-wise day changes
                  const participantDayChanges = {
                    Client: { callLong: 0, putLong: 0, callShort: 0, putShort: 0 },
                    FII: { callLong: 0, putLong: 0, callShort: 0, putShort: 0 },
                    DII: { callLong: 0, putLong: 0, callShort: 0, putShort: 0 },
                    Pro: { callLong: 0, putLong: 0, callShort: 0, putShort: 0 }
                  }

                  // Calculate changes for each participant
                  Object.keys(participantDayChanges).forEach(participant => {
                    const latest = latestData.find(item => item.client_type === participant) || {}
                    const previous = previousData.find(item => item.client_type === participant) || {}

                    const callLongChange = (latest.option_index_call_long || 0) - (previous.option_index_call_long || 0)
                    const putLongChange = (latest.option_index_put_long || 0) - (previous.option_index_put_long || 0)
                    const callShortChange = (latest.option_index_call_short || 0) - (previous.option_index_call_short || 0)
                    const putShortChange = (latest.option_index_put_short || 0) - (previous.option_index_put_short || 0)

                    participantDayChanges[participant] = {
                      callLong: callLongChange,
                      putLong: putLongChange,
                      callShort: callShortChange,
                      putShort: putShortChange
                    }

                    totalCallLongChange += callLongChange
                    totalPutLongChange += putLongChange
                    totalCallShortChange += callShortChange
                    totalPutShortChange += putShortChange
                  })

                  const grandTotalChange = Math.abs(totalCallLongChange) + Math.abs(totalPutLongChange) + Math.abs(totalCallShortChange) + Math.abs(totalPutShortChange)

                  // Calculate participant percentages based on absolute changes
                  const participantChangePercentages = {}
                  Object.keys(participantDayChanges).forEach(participant => {
                    const changes = participantDayChanges[participant]
                    participantChangePercentages[participant] = {
                      callLong: grandTotalChange > 0 ? (Math.abs(changes.callLong) / grandTotalChange) * 100 : 0,
                      putLong: grandTotalChange > 0 ? (Math.abs(changes.putLong) / grandTotalChange) * 100 : 0,
                      callShort: grandTotalChange > 0 ? (Math.abs(changes.callShort) / grandTotalChange) * 100 : 0,
                      putShort: grandTotalChange > 0 ? (Math.abs(changes.putShort) / grandTotalChange) * 100 : 0
                    }
                  })

                  // Calculate day change sentiment score
                  let dayChangeScore = 0
                  Object.keys(participantChangePercentages).forEach(participant => {
                    const percentages = participantChangePercentages[participant]
                    const changes = participantDayChanges[participant]

                    // Add positive values (bullish changes)
                    if (changes.callLong > 0) dayChangeScore += percentages.callLong
                    if (changes.putShort > 0) dayChangeScore += percentages.putShort

                    // Subtract negative values (bearish changes)
                    if (changes.callShort > 0) dayChangeScore -= percentages.callShort
                    if (changes.putLong > 0) dayChangeScore -= percentages.putLong
                  })

                  // Determine day change sentiment category
                  let dayChangeCategory = ''
                  let dayChangeColor = ''
                  let dayChangeIcon = null

                  if (dayChangeScore <= -30) {
                    dayChangeCategory = 'Highly Bearish'
                    dayChangeColor = 'text-red-500'
                    dayChangeIcon = <TrendingDown className="h-5 w-5 text-red-500" />
                  } else if (dayChangeScore <= -10) {
                    dayChangeCategory = 'Bearish'
                    dayChangeColor = 'text-orange-500'
                    dayChangeIcon = <TrendingDown className="h-5 w-5 text-orange-500" />
                  } else if (dayChangeScore <= -5) {
                    dayChangeCategory = 'Slightly Bearish'
                    dayChangeColor = 'text-yellow-500'
                    dayChangeIcon = <TrendingDown className="h-5 w-5 text-yellow-500" />
                  } else if (dayChangeScore >= -5 && dayChangeScore <= 5) {
                    dayChangeCategory = 'Neutral'
                    dayChangeColor = 'text-gray-400'
                    dayChangeIcon = <Minus className="h-5 w-5 text-gray-400" />
                  } else if (dayChangeScore <= 10) {
                    dayChangeCategory = 'Slightly Bullish'
                    dayChangeColor = 'text-blue-500'
                    dayChangeIcon = <TrendingUp className="h-5 w-5 text-blue-500" />
                  } else if (dayChangeScore <= 30) {
                    dayChangeCategory = 'Bullish'
                    dayChangeColor = 'text-green-500'
                    dayChangeIcon = <TrendingUp className="h-5 w-5 text-green-500" />
                  } else {
                    dayChangeCategory = 'Highly Bullish'
                    dayChangeColor = 'text-emerald-500'
                    dayChangeIcon = <TrendingUp className="h-5 w-5 text-emerald-500" />
                  }

                  return (
                    <div className="space-y-4">
                      {/* Overall Day Change Sentiment Header/Summary */}
                      <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/40 rounded-lg p-4 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-4">
                          <h6 className="text-lg font-semibold text-white">Day Change Market Sentiment</h6>
                          <div className="flex items-center space-x-2">
                            {dayChangeIcon}
                            <span className={`text-lg font-bold ${dayChangeColor}`}>
                              {dayChangeCategory}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white/5 rounded-lg p-3">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-primary-400">
                                {dayChangeScore.toFixed(2)}
                              </div>
                              <div className="text-sm text-gray-400">Day Change Score</div>
                            </div>
                          </div>
                          <div className="bg-white/5 rounded-lg p-3">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-400">
                                {grandTotalChange.toLocaleString('en-IN')}
                              </div>
                              <div className="text-sm text-gray-400">Total Position Changes</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Individual Participant Day Changes */}
                      <div className="space-y-4">
                        {Object.keys(participantDayChanges).map(participant => {
                          const changes = participantDayChanges[participant]
                          const percentages = participantChangePercentages[participant]

                          const participantDayScore = (
                            (changes.callLong > 0 ? percentages.callLong : 0) +
                            (changes.putShort > 0 ? percentages.putShort : 0) -
                            (changes.callShort > 0 ? percentages.callShort : 0) -
                            (changes.putLong > 0 ? percentages.putLong : 0)
                          ).toFixed(2)

                          let participantDaySentiment = ''
                          let participantDayColor = ''

                          if (participantDayScore <= -10) {
                            participantDaySentiment = 'Bearish'
                            participantDayColor = 'text-red-400'
                          } else if (participantDayScore <= -5) {
                            participantDaySentiment = 'Slightly Bearish'
                            participantDayColor = 'text-orange-400'
                          } else if (participantDayScore >= -5 && participantDayScore <= 5) {
                            participantDaySentiment = 'Neutral'
                            participantDayColor = 'text-gray-400'
                          } else if (participantDayScore <= 10) {
                            participantDaySentiment = 'Slightly Bullish'
                            participantDayColor = 'text-blue-400'
                          } else {
                            participantDaySentiment = 'Bullish'
                            participantDayColor = 'text-green-400'
                          }

                          return (
                            <div key={participant} className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-lg p-4 backdrop-blur-sm">
                              <div className="flex items-center justify-between mb-3">
                                <h6 className="text-lg font-semibold text-white">{participant}</h6>
                                <div className="flex items-center space-x-2">
                                  <span className={`text-sm font-medium ${participantDayColor}`}>
                                    {participantDaySentiment}
                                  </span>
                                  <span className="text-sm text-gray-400">
                                    ({participantDayScore})
                                  </span>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                <div className="text-center">
                                  <div className={`font-semibold ${changes.callLong >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {changes.callLong >= 0 ? '+' : ''}{changes.callLong.toLocaleString('en-IN')}
                                  </div>
                                  <div className="text-gray-400">Call Long Change</div>
                                  <div className="text-xs text-gray-500">
                                    {percentages.callLong.toFixed(1)}%
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className={`font-semibold ${changes.putLong >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {changes.putLong >= 0 ? '+' : ''}{changes.putLong.toLocaleString('en-IN')}
                                  </div>
                                  <div className="text-gray-400">Put Long Change</div>
                                  <div className="text-xs text-gray-500">
                                    {percentages.putLong.toFixed(1)}%
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className={`font-semibold ${changes.callShort >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {changes.callShort >= 0 ? '+' : ''}{changes.callShort.toLocaleString('en-IN')}
                                  </div>
                                  <div className="text-gray-400">Call Short Change</div>
                                  <div className="text-xs text-gray-500">
                                    {percentages.callShort.toFixed(1)}%
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className={`font-semibold ${changes.putShort >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {changes.putShort >= 0 ? '+' : ''}{changes.putShort.toLocaleString('en-IN')}
                                  </div>
                                  <div className="text-gray-400">Put Short Change</div>
                                  <div className="text-xs text-gray-500">
                                    {percentages.putShort.toFixed(1)}%
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })()}
              </div>

              {/* Changed Contracts Mapping Section */}
              <div className="mt-8 pt-6 border-t border-purple-500/20">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <h5 className="text-lg font-semibold text-purple-400">Changed Contracts Mapping</h5>
                </div>

                {(() => {
                  // Calculate changed contracts mapping data
                  if (!data || !latestDate || !previousDate) return <div className="text-gray-400">No data available</div>

                  const latestData = data.filter(item => item.date === latestDate)
                  const previousData = data.filter(item => item.date === previousDate)

                  if (latestData.length === 0 || previousData.length === 0) return <div className="text-gray-400">No data available</div>

                  // Calculate day changes for each position type across all participants
                  const positionTypes = ['Call Long', 'Put Long', 'Call Short', 'Put Short']
                  const participants = ['Client', 'FII', 'DII', 'Pro']

                  const positionChanges = {
                    'Call Long': {},
                    'Put Long': {},
                    'Call Short': {},
                    'Put Short': {}
                  }

                  // Calculate changes for each position type
                  positionTypes.forEach(positionType => {
                    const fieldMap = {
                      'Call Long': 'option_index_call_long',
                      'Put Long': 'option_index_put_long',
                      'Call Short': 'option_index_call_short',
                      'Put Short': 'option_index_put_short'
                    }

                    const field = fieldMap[positionType]
                    let totalChange = 0

                    participants.forEach(participant => {
                      const latest = latestData.find(item => item.client_type === participant) || {}
                      const previous = previousData.find(item => item.client_type === participant) || {}

                      const change = (latest[field] || 0) - (previous[field] || 0)
                      positionChanges[positionType][participant] = change
                      totalChange += Math.abs(change)
                    })

                    positionChanges[positionType].total = totalChange
                  })

                  // Calculate participant percentages for each position type (preserving signs)
                  const participantPercentages = {}
                  positionTypes.forEach(positionType => {
                    participantPercentages[positionType] = {}
                    const total = positionChanges[positionType].total

                    participants.forEach(participant => {
                      const change = positionChanges[positionType][participant]
                      // Preserve the sign of the change when calculating percentage
                      participantPercentages[positionType][participant] = total > 0 ? (change / total) * 100 : 0
                    })
                  })

                  // Calculate participant-wise sentiment scores (with proper sign handling)
                  const participantScores = {}
                  participants.forEach(participant => {
                    let score = 0

                    // Call Long: positive contribution (keep sign as is)
                    score += participantPercentages['Call Long'][participant]

                    // Put Short: positive contribution (keep sign as is)
                    score += participantPercentages['Put Short'][participant]

                    // Call Short: negative contribution (multiply by -1)
                    score -= participantPercentages['Call Short'][participant]

                    // Put Long: negative contribution (multiply by -1)
                    score -= participantPercentages['Put Long'][participant]

                    participantScores[participant] = score
                  })

                  return (
                    <div className="space-y-6">
                      {/* Position-wise Changes Table */}
                      <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-lg p-4 backdrop-blur-sm">
                        <h6 className="text-lg font-semibold text-white mb-4">Position-wise Day Changes</h6>

                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-purple-500/30">
                                <th className="text-left py-2 px-3 text-purple-400 font-semibold">Position Type</th>
                                {participants.map(participant => (
                                  <th key={participant} className="text-center py-2 px-3 text-purple-400 font-semibold">
                                    {participant}
                                  </th>
                                ))}
                                <th className="text-center py-2 px-3 text-purple-400 font-semibold">Total Changes</th>
                              </tr>
                            </thead>
                            <tbody>
                              {positionTypes.map(positionType => (
                                <tr key={positionType} className="border-b border-purple-500/20">
                                  <td className="py-3 px-3 text-white font-medium">{positionType}</td>
                                  {participants.map(participant => {
                                    const change = positionChanges[positionType][participant]
                                    const percentage = participantPercentages[positionType][participant]
                                    return (
                                      <td key={participant} className="text-center py-3 px-3">
                                        <div className={`font-semibold ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                          {change >= 0 ? '+' : ''}{change.toLocaleString('en-IN')}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                          {percentage.toFixed(1)}%
                                        </div>
                                      </td>
                                    )
                                  })}
                                  <td className="text-center py-3 px-3">
                                    <div className="font-semibold text-cyan-400">
                                      {positionChanges[positionType].total.toLocaleString('en-IN')}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Participant-wise Sentiment Scores */}
                      <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-lg p-4 backdrop-blur-sm">
                        <h6 className="text-lg font-semibold text-white mb-4">Participant Sentiment Scores</h6>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {participants.map(participant => {
                            const score = participantScores[participant]
                            let sentiment = ''
                            let color = ''
                            let icon = null

                            if (score <= -10) {
                              sentiment = 'Bearish'
                              color = 'text-red-400'
                              icon = <TrendingDown className="h-4 w-4 text-red-400" />
                            } else if (score <= -5) {
                              sentiment = 'Slightly Bearish'
                              color = 'text-orange-400'
                              icon = <TrendingDown className="h-4 w-4 text-orange-400" />
                            } else if (score >= -5 && score <= 5) {
                              sentiment = 'Neutral'
                              color = 'text-gray-400'
                              icon = <Minus className="h-4 w-4 text-gray-400" />
                            } else if (score <= 10) {
                              sentiment = 'Slightly Bullish'
                              color = 'text-blue-400'
                              icon = <TrendingUp className="h-4 w-4 text-blue-400" />
                            } else {
                              sentiment = 'Bullish'
                              color = 'text-green-400'
                              icon = <TrendingUp className="h-4 w-4 text-green-400" />
                            }

                            return (
                              <div key={participant} className="bg-white/5 rounded-lg p-4 text-center">
                                <div className="flex items-center justify-center space-x-2 mb-2">
                                  {icon}
                                  <h6 className="text-lg font-semibold text-white">{participant}</h6>
                                </div>
                                <div className={`text-2xl font-bold ${color} mb-1`}>
                                  {score.toFixed(2)}
                                </div>
                                <div className={`text-sm font-medium ${color}`}>
                                  {sentiment}
                                </div>

                              </div>
                            )
                          })}
                        </div>
                      </div>


                    </div>
                  )
                })()}


              </div>
            </div>
          )
        })()}
      </div>

      {/* Weekly Position Changes (Since Last Expiry) */}
      <div className="mt-8 pt-6 border-t border-purple-500/20">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
          <h5 className="text-lg font-semibold text-purple-400">Weekly Position Changes</h5>
        </div>

        {(() => {
          // Calculate weekly changes data (Since Previous Expiry)
          const targetExpiryDate = getPreviousExpiryDate(latestDate)
          console.log('Weekly Calculation:', { latestDate, targetExpiryDate, dataLength: data ? data.length : 0 });

          if (!data || !latestDate || !targetExpiryDate) return <div className="text-gray-400">Waiting for weekly data...</div>

          const latestData = data.filter(item => item.date === latestDate)
          const expiryData = data.filter(item => item.date === targetExpiryDate)

          if (latestData.length === 0) return <div className="text-gray-400">No data available for current date</div>
          if (expiryData.length === 0) return (
            <div className="text-gray-400 text-sm">
              No data available for previous expiry ({targetExpiryDate}). <br />
              This might be due to a holiday or missing data.
            </div>
          )

          // Calculate weekly changes for each position type across all participants
          const positionTypes = ['Call Long', 'Put Long', 'Call Short', 'Put Short']
          const participants = ['Client', 'FII', 'DII', 'Pro']

          const positionChanges = {
            'Call Long': {},
            'Put Long': {},
            'Call Short': {},
            'Put Short': {}
          }

          // Calculate changes for each position type
          positionTypes.forEach(positionType => {
            const fieldMap = {
              'Call Long': 'option_index_call_long',
              'Put Long': 'option_index_put_long',
              'Call Short': 'option_index_call_short',
              'Put Short': 'option_index_put_short'
            }

            const field = fieldMap[positionType]
            let totalChange = 0

            participants.forEach(participant => {
              const latest = latestData.find(item => item.client_type === participant) || {}
              const previous = expiryData.find(item => item.client_type === participant) || {}

              const change = (latest[field] || 0) - (previous[field] || 0)
              positionChanges[positionType][participant] = change
              totalChange += Math.abs(change)
            })

            positionChanges[positionType].total = totalChange
          })

          // Calculate participant percentages for each position type (preserving signs)
          const participantPercentages = {}
          positionTypes.forEach(positionType => {
            participantPercentages[positionType] = {}
            const total = positionChanges[positionType].total

            participants.forEach(participant => {
              const change = positionChanges[positionType][participant]
              // Preserve the sign of the change when calculating percentage
              participantPercentages[positionType][participant] = total > 0 ? (change / total) * 100 : 0
            })
          })

          // Calculate participant-wise sentiment scores (with proper sign handling)
          const participantScores = {}
          participants.forEach(participant => {
            let score = 0

            // Call Long: positive contribution (keep sign as is)
            score += participantPercentages['Call Long'][participant]

            // Put Short: positive contribution (keep sign as is)
            score += participantPercentages['Put Short'][participant]

            // Call Short: negative contribution (multiply by -1)
            score -= participantPercentages['Call Short'][participant]

            // Put Long: negative contribution (multiply by -1)
            score -= participantPercentages['Put Long'][participant]

            participantScores[participant] = score
          })

          return (
            <div className="space-y-6">
              <div className="text-sm text-gray-400 mb-2">
                Comparing current positions ({latestDate}) with previous expiry ({targetExpiryDate})
              </div>

              {/* Position-wise Changes Table */}
              <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-lg p-4 backdrop-blur-sm">
                <h6 className="text-lg font-semibold text-white mb-4">Position-wise Weekly Changes</h6>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-purple-500/30">
                        <th className="text-left py-2 px-3 text-purple-400 font-semibold">Position Type</th>
                        {participants.map(participant => (
                          <th key={participant} className="text-center py-2 px-3 text-purple-400 font-semibold">
                            {participant}
                          </th>
                        ))}
                        <th className="text-center py-2 px-3 text-purple-400 font-semibold">Total Changes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {positionTypes.map(positionType => (
                        <tr key={positionType} className="border-b border-purple-500/20">
                          <td className="py-3 px-3 text-white font-medium">{positionType}</td>
                          {participants.map(participant => {
                            const change = positionChanges[positionType][participant]
                            const percentage = participantPercentages[positionType][participant]
                            return (
                              <td key={participant} className="text-center py-3 px-3">
                                <div className={`font-semibold ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {change >= 0 ? '+' : ''}{change.toLocaleString('en-IN')}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {percentage.toFixed(1)}%
                                </div>
                              </td>
                            )
                          })}
                          <td className="text-center py-3 px-3">
                            <div className="font-semibold text-cyan-400">
                              {positionChanges[positionType].total.toLocaleString('en-IN')}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Participant-wise Sentiment Scores */}
              <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-lg p-4 backdrop-blur-sm">
                <h6 className="text-lg font-semibold text-white mb-4">Participant Sentiment Scores (Weekly)</h6>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {participants.map(participant => {
                    const score = participantScores[participant]
                    let sentiment = ''
                    let color = ''
                    let icon = null

                    if (score <= -10) {
                      sentiment = 'Bearish'
                      color = 'text-red-400'
                      icon = <TrendingDown className="h-4 w-4 text-red-400" />
                    } else if (score <= -5) {
                      sentiment = 'Slightly Bearish'
                      color = 'text-orange-400'
                      icon = <TrendingDown className="h-4 w-4 text-orange-400" />
                    } else if (score >= -5 && score <= 5) {
                      sentiment = 'Neutral'
                      color = 'text-gray-400'
                      icon = <Minus className="h-4 w-4 text-gray-400" />
                    } else if (score <= 10) {
                      sentiment = 'Slightly Bullish'
                      color = 'text-blue-400'
                      icon = <TrendingUp className="h-4 w-4 text-blue-400" />
                    } else {
                      sentiment = 'Bullish'
                      color = 'text-green-400'
                      icon = <TrendingUp className="h-4 w-4 text-green-400" />
                    }

                    return (
                      <div key={participant} className="bg-white/5 rounded-lg p-4 text-center">
                        <div className="flex items-center justify-center space-x-2 mb-2">
                          {icon}
                          <h6 className="text-lg font-semibold text-white">{participant}</h6>
                        </div>
                        <div className={`text-2xl font-bold ${color} mb-1`}>
                          {score.toFixed(2)}
                        </div>
                        <div className={`text-sm font-medium ${color}`}>
                          {sentiment}
                        </div>

                      </div>
                    )
                  })}
                </div>
              </div>



              {/* Weekly Sentiment Trend Chart */}
              <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-lg p-4 backdrop-blur-sm mt-6">
                <h6 className="text-lg font-semibold text-white mb-4">Weekly Sentiment Trend</h6>
                <div className="h-[300px] w-full">
                  {(() => {
                    // 1. Identify date range: Expiry Date + 1 day ... Latest Date
                    // Function to parse dd-mm-yyyy to Date object
                    const parseDate = (dateStr) => {
                      const [d, m, y] = dateStr.split('-');
                      return new Date(`${y}-${m}-${d}`);
                    };

                    const expiryDateObj = parseDate(targetExpiryDate);
                    const latestDateObj = parseDate(latestDate);

                    // Filter data for the trend range
                    const trendDataRaw = data.filter(item => {
                      const itemDate = parseDate(item.date);
                      return itemDate > expiryDateObj && itemDate <= latestDateObj;
                    });

                    // Get unique dates sorted
                    const uniqueDates = [...new Set(trendDataRaw.map(item => item.date))];
                    // Sort dates logic if needed, but assuming data might be mixed, explicit sort is safer
                    uniqueDates.sort((a, b) => parseDate(a) - parseDate(b));

                    // 2. Build Chart Data
                    const chartData = uniqueDates.map(date => {
                      const dayData = data.filter(item => item.date === date);

                      // Calculate scores for this specific day vs Expiry
                      const dayScores = { date };

                      // Helper maps from outer scope
                      // const positionTypes = ['Call Long', 'Put Long', 'Call Short', 'Put Short']
                      // const participants = ['Client', 'FII', 'DII', 'Pro']

                      // Calculate position changes for this day
                      const dayPositionChanges = {};
                      positionTypes.forEach(pt => dayPositionChanges[pt] = { total: 0 });

                      positionTypes.forEach(positionType => {
                        const fieldMap = {
                          'Call Long': 'option_index_call_long',
                          'Put Long': 'option_index_put_long',
                          'Call Short': 'option_index_call_short',
                          'Put Short': 'option_index_put_short'
                        };
                        const field = fieldMap[positionType];
                        let totalChange = 0;

                        participants.forEach(participant => {
                          const current = dayData.find(item => item.client_type === participant) || {};
                          const baseline = expiryData.find(item => item.client_type === participant) || {};
                          const change = (current[field] || 0) - (baseline[field] || 0);

                          dayPositionChanges[positionType][participant] = change;
                          totalChange += Math.abs(change);
                        });
                        dayPositionChanges[positionType].total = totalChange;
                      });

                      // Calculate Percentages & Scores
                      participants.forEach(participant => {
                        let score = 0;

                        // Calculate percentage for each type and add to score
                        // Logic matching the main block

                        // Call Long (+)
                        const clTotal = dayPositionChanges['Call Long'].total;
                        const clChange = dayPositionChanges['Call Long'][participant];
                        const clPct = clTotal > 0 ? (clChange / clTotal) * 100 : 0;
                        score += clPct;

                        // Put Short (+)
                        const psTotal = dayPositionChanges['Put Short'].total;
                        const psChange = dayPositionChanges['Put Short'][participant];
                        const psPct = psTotal > 0 ? (psChange / psTotal) * 100 : 0;
                        score += psPct;

                        // Call Short (-)
                        const csTotal = dayPositionChanges['Call Short'].total;
                        const csChange = dayPositionChanges['Call Short'][participant];
                        const csPct = csTotal > 0 ? (csChange / csTotal) * 100 : 0;
                        score -= csPct;

                        // Put Long (-)
                        const plTotal = dayPositionChanges['Put Long'].total;
                        const plChange = dayPositionChanges['Put Long'][participant];
                        const plPct = plTotal > 0 ? (plChange / plTotal) * 100 : 0;
                        score -= plPct;

                        dayScores[participant] = parseFloat(score.toFixed(2));
                      });

                      return dayScores;
                    });

                    return (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickMargin={10} />
                          {/* Domain set to handle both positive and negative scores reasonably */}
                          <YAxis stroke="#9ca3af" fontSize={12} domain={['auto', 'auto']} />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                            itemSorter={(item) => -item.value}
                          />
                          <Legend />
                          <Line type="monotone" dataKey="Client" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                          <Line type="monotone" dataKey="FII" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                          <Line type="monotone" dataKey="DII" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                          <Line type="monotone" dataKey="Pro" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    );
                  })()}
                </div>
              </div>


            </div>
          )
        })()}
      </div>
    </div>
  )
}

export default DeepInsights