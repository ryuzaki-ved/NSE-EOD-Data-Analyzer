import React, { useState, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const OptionsLongVsShortChart = ({ chartData }) => {
  const [selectedParticipant, setSelectedParticipant] = useState('FII')

  // Get unique participants from chart data
  const participants = useMemo(() => {
    const participantSet = new Set()
    chartData.forEach(item => {
      Object.keys(item).forEach(key => {
        if (key.includes('_option_index_')) {
          const participant = key.split('_option_index_')[0]
          if (participant !== 'date') {
            participantSet.add(participant)
          }
        }
      })
    })
    return Array.from(participantSet).sort()
  }, [chartData])

  // Calculate options long vs short data for selected participant
  const optionsData = useMemo(() => {
    return chartData.map(item => {
      const callLong = item[`${selectedParticipant}_option_index_call_long`] || 0
      const putShort = item[`${selectedParticipant}_option_index_put_short`] || 0
      const putLong = item[`${selectedParticipant}_option_index_put_long`] || 0
      const callShort = item[`${selectedParticipant}_option_index_call_short`] || 0

      return {
        date: item.date,
        optionLong: callLong + putShort, // Call Long + Put Short
        optionShort: putLong + callShort, // Put Long + Call Short
      }
    }).filter(item => item.optionLong > 0 || item.optionShort > 0) // Filter out entries with no data
  }, [chartData, selectedParticipant])

  return (
    <div className="glass-card p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <div>
          <h3 className="text-xl font-semibold">Options Long vs Short</h3>
          <p className="text-sm text-gray-400 mt-1">
            Option Long = Call Long + Put Short | Option Short = Put Long + Call Short
          </p>
        </div>
        <select
          value={selectedParticipant}
          onChange={(e) => setSelectedParticipant(e.target.value)}
          className="px-3 py-1 bg-dark-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
        >
          {participants.map(participant => (
            <option key={participant} value={participant}>{participant}</option>
          ))}
        </select>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={optionsData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="date" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#e2e8f0',
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="optionLong"
            stroke="#10b981"
            strokeWidth={3}
            dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
            name="Option Long"
          />
          <Line
            type="monotone"
            dataKey="optionShort"
            stroke="#ef4444"
            strokeWidth={3}
            dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
            name="Option Short"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default OptionsLongVsShortChart 