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
        // The first item of currentMonthData is the start of this month.
        // We need the item immediately preceding it in the sorted full dataset.
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
            // If this is the start of the dataset, start from 0 change on day 1??
            // Or strictly following user req "change of 1st day of month".
            // Change = Current - Prev. If no Prev, Change is undefined or 0?
            // Let's assume if no prev data, we treat the first day value as the starting point (cumulative 0)
            // effectively checking change from "0" position or just resets.
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
        <div className="chart-card h-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <div>
                    <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
                        Monthly Future Cumulative Change
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                        Cumulative change in Future Index from Month Start
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
                <LineChart data={cumulativeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip content={<SortedCustomTooltip />} />
                    <Legend />
                    <ReferenceLine y={0} stroke="#666" />
                    <Line
                        type="monotone"
                        dataKey="longCumulative"
                        name="Future Long Cumulative"
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={{ fill: '#10b981', r: 4 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="shortCumulative"
                        name="Future Short Cumulative"
                        stroke="#ef4444"
                        strokeWidth={3}
                        dot={{ fill: '#ef4444', r: 4 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}

export default MonthlyFutureCumulativeChart
