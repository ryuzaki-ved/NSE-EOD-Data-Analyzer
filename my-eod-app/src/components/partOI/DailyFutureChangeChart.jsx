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
        <div className="chart-card h-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <div>
                    <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                        Daily Future Index Change
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                        Daily change in Future Index contracts (Current Month)
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
                <BarChart data={dailyChangeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip content={<SortedCustomTooltip />} />
                    <Legend />
                    <ReferenceLine y={0} stroke="#666" />
                    <Bar dataKey="longChange" name="Future Long Change" fill="#10b981" />
                    <Bar dataKey="shortChange" name="Future Short Change" fill="#ef4444" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}

export default DailyFutureChangeChart
