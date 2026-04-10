import React, { useState, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'
import SortedCustomTooltip from '../SortedCustomTooltip'

const MonthlyFutureCumulativeChart = ({ chartData }) => {
    const [selectedParticipant, setSelectedParticipant] = useState('FII')

    // Get unique participants
    const participants = useMemo(() => {
        const participantSet = new Set()
        chartData.forEach(item => {
            Object.keys(item).forEach(key => {
                if (key.includes('_future_index_')) {
                    const participant = key.split('_future_index_')[0]
                    participantSet.add(participant)
                }
            })
        })
        return Array.from(participantSet).sort()
    }, [chartData])

    // Process data for cumulative change
    const cumulativeData = useMemo(() => {
        // Sort data by date first
        const sortedData = [...chartData].sort((a, b) => {
            const [dayA, monthA, yearA] = a.date.split('-')
            const [dayB, monthB, yearB] = b.date.split('-')
            return new Date(`${yearA}-${monthA}-${dayA}`) - new Date(`${yearB}-${monthB}-${dayB}`)
        })

        if (sortedData.length === 0) return []

        // Filter for current month (latest month in data)
        const lastDate = sortedData[sortedData.length - 1].date
        const [lastDay, lastMonth, lastYear] = lastDate.split('-')

        // Filter data for this month only
        const currentMonthData = sortedData.filter(item => {
            const [d, m, y] = item.date.split('-')
            return m === lastMonth && y === lastYear
        })

        if (currentMonthData.length === 0) return []

        // Find the last day of the PREVIOUS month to use as baseline
        const firstCurrentMonthDate = currentMonthData[0].date
        const startIndexInFull = sortedData.findIndex(item => item.date === firstCurrentMonthDate)

        let baseLong = 0
        let baseShort = 0

        if (startIndexInFull > 0) {
            // We have data from the previous month
            const prevMonthLastItem = sortedData[startIndexInFull - 1]
            baseLong = prevMonthLastItem[`${selectedParticipant}_future_index_long`] || 0
            baseShort = prevMonthLastItem[`${selectedParticipant}_future_index_short`] || 0
        } else {
            const baseItem = currentMonthData[0]
            baseLong = baseItem[`${selectedParticipant}_future_index_long`] || 0
            baseShort = baseItem[`${selectedParticipant}_future_index_short`] || 0
        }

        return currentMonthData.map(item => {
            const currentLong = item[`${selectedParticipant}_future_index_long`] || 0
            const currentShort = item[`${selectedParticipant}_future_index_short`] || 0

            return {
                date: item.date,
                longCumulative: currentLong - baseLong,
                shortCumulative: currentShort - baseShort
            }
        })
    }, [chartData, selectedParticipant])

    return (
        <div className="w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                <div>
                    <h3 className="text-base font-bold text-white tracking-tight">Monthly Future Cumulative Change</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                        Cumulative change in future index from month start
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
            
            <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={cumulativeData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                        <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
                        <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                        <Tooltip content={<SortedCustomTooltip />} />
                        <Legend 
                            wrapperStyle={{ paddingTop: '12px' }}
                            formatter={(value) => <span className="text-xs text-slate-300 font-medium">{value}</span>}
                        />
                        <ReferenceLine y={0} stroke="#334155" strokeWidth={1} />
                        <Line
                            type="monotone"
                            dataKey="longCumulative"
                            name="Future Long Cumulative"
                            stroke="#10B981"
                            strokeWidth={2.5}
                            dot={{ fill: '#10B981', strokeWidth: 0, r: 3 }}
                            activeDot={{ r: 5, stroke: '#10B981', strokeWidth: 2, fill: '#0B0F19' }}
                        />
                        <Line
                            type="monotone"
                            dataKey="shortCumulative"
                            name="Future Short Cumulative"
                            stroke="#F43F5E"
                            strokeWidth={2.5}
                            dot={{ fill: '#F43F5E', strokeWidth: 0, r: 3 }}
                            activeDot={{ r: 5, stroke: '#F43F5E', strokeWidth: 2, fill: '#0B0F19' }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

export default MonthlyFutureCumulativeChart
