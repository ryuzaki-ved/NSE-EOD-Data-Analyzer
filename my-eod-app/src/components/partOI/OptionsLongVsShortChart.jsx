import React, { useState, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import SortedCustomTooltip from '../SortedCustomTooltip'

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
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">Options Long vs Short</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Option Long = Call Long + Put Short | Option Short = Put Long + Call Short
          </p>
        </div>
        <select
          value={selectedParticipant}
          onChange={(e) => setSelectedParticipant(e.target.value)}
          className="px-3 py-1.5 bg-[#0B0F19] border border-white/[0.08] rounded-lg text-xs font-medium text-slate-300 focus:ring-1 focus:ring-emerald-500/40 focus:border-emerald-500/40 outline-none transition-colors"
        >
          {participants.map(participant => (
            <option key={participant} value={participant}>{participant}</option>
          ))}
        </select>
      </div>
      
      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={optionsData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
            <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
            <YAxis stroke="#64748B" fontSize={11} tickLine={false} tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} />
            <Tooltip content={<SortedCustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '12px' }}
              formatter={(value) => <span className="text-xs text-slate-300 font-medium">{value}</span>}
            />
            <Line
              type="monotone"
              dataKey="optionLong"
              stroke="#10B981"
              strokeWidth={2.5}
              dot={{ fill: '#10B981', strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, stroke: '#10B981', strokeWidth: 2, fill: '#0B0F19' }}
              name="Option Long"
            />
            <Line
              type="monotone"
              dataKey="optionShort"
              stroke="#F43F5E"
              strokeWidth={2.5}
              dot={{ fill: '#F43F5E', strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, stroke: '#F43F5E', strokeWidth: 2, fill: '#0B0F19' }}
              name="Option Short"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default OptionsLongVsShortChart