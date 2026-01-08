import React from 'react'
import { Eye, Target } from 'lucide-react'
import { formatDifference } from '../utils/partOIHelpers'
import DateSelector from './DateSelector'

const DeepInsightsPartVol = ({
  data,
  latestDate,
  previousDate,
  availableDates = [],
  onDateChange,
  onPrevDateChange
}) => {
  if (!data || data.length === 0) {
    return null
  }

  // Calculate totals for all client types
  const totals = data.reduce((acc, row) => ({
    callLong: acc.callLong + row.callLong,
    putLong: acc.putLong + row.putLong,
    callShort: acc.callShort + row.callShort,
    putShort: acc.putShort + row.putShort
  }), { callLong: 0, putLong: 0, callShort: 0, putShort: 0 })

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

      {/* Volume Analysis with OI Adjustments */}
      <div className="glass-card p-6 border border-primary-500/20 mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <Target className="h-5 w-5 text-primary-400" />
          <h4 className="text-xl font-semibold">Index Options Intraday Volume (Open and Closed Intraday)</h4>
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
                  <td className="py-3 px-4 text-center text-gray-300">
                    {formatDifference(row.callLong)}
                  </td>
                  <td className="py-3 px-4 text-center text-gray-300">
                    {formatDifference(row.putLong)}
                  </td>
                  <td className="py-3 px-4 text-center text-gray-300">
                    {formatDifference(row.callShort)}
                  </td>
                  <td className="py-3 px-4 text-center text-gray-300">
                    {formatDifference(row.putShort)}
                  </td>
                </tr>
              ))}
              <tr className="border-t-2 border-primary-500/30 bg-primary-500/10">
                <td className="py-3 px-4 font-bold text-primary-300">Total</td>
                <td className="py-3 px-4 text-center font-bold text-primary-300">
                  {formatDifference(totals.callLong)}
                </td>
                <td className="py-3 px-4 text-center font-bold text-primary-300">
                  {formatDifference(totals.putLong)}
                </td>
                <td className="py-3 px-4 text-center font-bold text-primary-300">
                  {formatDifference(totals.callShort)}
                </td>
                <td className="py-3 px-4 text-center font-bold text-primary-300">
                  {formatDifference(totals.putShort)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-xs text-gray-400">
          <p>* Values are adjusted based on OI changes: Positive OI changes subtract from same category, Negative OI changes subtract from opposite category</p>
        </div>
      </div>
    </div>
  )
}

export default DeepInsightsPartVol