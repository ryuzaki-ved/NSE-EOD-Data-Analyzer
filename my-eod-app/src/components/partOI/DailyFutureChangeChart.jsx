import React, { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'
import SortedCustomTooltip from '../SortedCustomTooltip'

const DailyFutureChangeChart = ({ chartData }) => {
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

    // Process data for daily change
    const dailyChangeData = useMemo(() => {
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

        // Calculate daily changes
        return currentMonthData.map((item, index) => {
            // Find previous day's data from the FULL sorted list to handle month boundaries correcty
            // But purely for "change", we need the absolute previous trading day
            const originalIndex = sortedData.findIndex(d => d.date === item.date)
            const prevItem = originalIndex > 0 ? sortedData[originalIndex - 1] : null

            const currentLong = item[`${selectedParticipant}_future_index_long`] || 0
            const currentShort = item[`${selectedParticipant}_future_index_short`] || 0

            const prevLong = prevItem ? (prevItem[`${selectedParticipant}_future_index_long`] || 0) : currentLong // No change if no prev data
            const prevShort = prevItem ? (prevItem[`${selectedParticipant}_future_index_short`] || 0) : currentShort

            return {
                date: item.date,
                longChange: currentLong - prevLong,
                shortChange: currentShort - prevShort
            }
        })
    }, [chartData, selectedParticipant])

    return (
        <div className="w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                <div>
                    <h3 className="text-base font-bold text-white tracking-tight">Daily Future Index Change</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                        Daily change in future index contracts (current month)
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
                    <BarChart data={dailyChangeData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                        <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
                        <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                        <Tooltip content={<SortedCustomTooltip />} />
                        <Legend 
                            wrapperStyle={{ paddingTop: '12px' }}
                            formatter={(value) => <span className="text-xs text-slate-300 font-medium">{value}</span>}
                        />
                        <ReferenceLine y={0} stroke="#334155" strokeWidth={1} />
                        <Bar dataKey="longChange" name="Future Long Change" fill="#10B981" radius={[3, 3, 0, 0]} />
                        <Bar dataKey="shortChange" name="Future Short Change" fill="#F43F5E" radius={[3, 3, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

export default DailyFutureChangeChart
