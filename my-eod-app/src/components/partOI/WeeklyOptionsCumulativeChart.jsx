import React, { useState, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const WeeklyOptionsCumulativeChart = ({ chartData }) => {
  const [selectedParticipant, setSelectedParticipant] = useState('FII')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [showDetailed, setShowDetailed] = useState(false)

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

  // Helper to check if a date is a cycle start date
  // Before Aug 28, 2025: Start of cycle is Friday (expiry Thursday)
  // After Aug 28, 2025: Start of cycle is Wednesday (expiry Tuesday)
  const isCycleStartDate = (dateStr) => {
    const [day, month, year] = dateStr.split('-')
    const date = new Date(`${year}-${month}-${day}`)
    const cutoffDate = new Date('2025-08-28')

    const dayOfWeek = date.getDay()

    if (date <= cutoffDate) {
      return dayOfWeek === 5 // Friday
    } else {
      return dayOfWeek === 3 // Wednesday
    }
  }

  // Get all available dates and find the latest Cycle Start Date
  const allDates = useMemo(() => {
    const dates = chartData.map(item => item.date).sort((a, b) => {
      // Convert DD-MM-YYYY to YYYY-MM-DD for proper date comparison
      const [dayA, monthA, yearA] = a.split('-')
      const [dayB, monthB, yearB] = b.split('-')
      const dateA = new Date(`${yearA}-${monthA}-${dayA}`)
      const dateB = new Date(`${yearB}-${monthB}-${dayB}`)
      return dateA - dateB
    })

    // Find the latest Cycle Start Date
    let latestCycleStart = null
    for (let i = dates.length - 1; i >= 0; i--) {
      if (isCycleStartDate(dates[i])) {
        latestCycleStart = dates[i]
        break
      }
    }

    return { dates, latestCycleStart }
  }, [chartData])

  // Set default date range to latest Cycle Start to latest available date
  React.useEffect(() => {
    if (allDates.latestCycleStart && !startDate) {
      setStartDate(allDates.latestCycleStart)
      setEndDate(allDates.dates[allDates.dates.length - 1])
    }
  }, [allDates, startDate])

  // Calculate cumulative options data for selected participant and date range
  const cumulativeData = useMemo(() => {
    if (!startDate || !endDate) return []

    // Filter data for selected date range
    const filteredData = chartData.filter(item => {
      const [dayItem, monthItem, yearItem] = item.date.split('-')
      const [dayStart, monthStart, yearStart] = startDate.split('-')
      const [dayEnd, monthEnd, yearEnd] = endDate.split('-')

      const itemDate = new Date(`${yearItem}-${monthItem}-${dayItem}`)
      const start = new Date(`${yearStart}-${monthStart}-${dayStart}`)
      const end = new Date(`${yearEnd}-${monthEnd}-${dayEnd}`)
      return itemDate >= start && itemDate <= end
    }).sort((a, b) => {
      const [dayA, monthA, yearA] = a.date.split('-')
      const [dayB, monthB, yearB] = b.date.split('-')
      const dateA = new Date(`${yearA}-${monthA}-${dayA}`)
      const dateB = new Date(`${yearB}-${monthB}-${dayB}`)
      return dateA - dateB
    })

    if (filteredData.length === 0) return []

    // Get Baseline values (Start of Cycle data)
    // The "Start Date" selected by user is expected to be a valid cycle start date (Friday/Wednesday)
    // So the first item in filteredData SHOULD be the baseline if it matches startDate
    // However, to be safe, we look for the specific starting record.
    const baselineData = filteredData.find(item => item.date === startDate)

    if (!baselineData) return []

    // Find the previous day data to calculate the baseline's daily change
    const [dayBase, monthBase, yearBase] = baselineData.date.split('-')
    const baselineDateObj = new Date(`${yearBase}-${monthBase}-${dayBase}`)
    const previousDayDate = new Date(baselineDateObj)
    previousDayDate.setDate(baselineDateObj.getDate() - 1)

    // Format the previous day in the same format as the data (DD-MMM-YYYY)
    const day = previousDayDate.getDate().toString().padStart(2, '0')
    const month = previousDayDate.toLocaleDateString('en-US', { month: 'short' })
    const year = previousDayDate.getFullYear()
    const previousDayStr = `${day}-${month}-${year}`

    // Look for previous day data in the entire dataset
    const previousDayData = chartData.find(item => item.date === previousDayStr)

    // Calculate Baseline's change from previous day
    const baselineCallLong = baselineData[`${selectedParticipant}_option_index_call_long`] || 0
    const baselinePutShort = baselineData[`${selectedParticipant}_option_index_put_short`] || 0
    const baselinePutLong = baselineData[`${selectedParticipant}_option_index_put_long`] || 0
    const baselineCallShort = baselineData[`${selectedParticipant}_option_index_call_short`] || 0

    const baselineOptionLong = baselineCallLong + baselinePutShort
    const baselineOptionShort = baselinePutLong + baselineCallShort

    const prevCallLong = previousDayData ? (previousDayData[`${selectedParticipant}_option_index_call_long`] || 0) : 0
    const prevPutShort = previousDayData ? (previousDayData[`${selectedParticipant}_option_index_put_short`] || 0) : 0
    const prevPutLong = previousDayData ? (previousDayData[`${selectedParticipant}_option_index_put_long`] || 0) : 0
    const prevCallShort = previousDayData ? (previousDayData[`${selectedParticipant}_option_index_call_short`] || 0) : 0

    const prevOptionLong = prevCallLong + prevPutShort
    const prevOptionShort = prevPutLong + prevCallShort

    // Baseline's change from previous day (Initials for the chart)
    const baselineOptionLongChange = baselineOptionLong - prevOptionLong
    const baselineOptionShortChange = baselineOptionShort - prevOptionShort

    // Calculate individual Baseline changes
    const baselineCallLongChange = baselineData[`${selectedParticipant}_option_index_call_long`] - (prevCallLong || 0)
    const baselinePutLongChange = baselineData[`${selectedParticipant}_option_index_put_long`] - (prevPutLong || 0)
    const baselineCallShortChange = baselineData[`${selectedParticipant}_option_index_call_short`] - (prevCallShort || 0)
    const baselinePutShortChange = baselineData[`${selectedParticipant}_option_index_put_short`] - (prevPutShort || 0)

    // Debug logging
    console.log('Baseline date:', baselineData.date)
    console.log('Previous day string:', previousDayStr)
    console.log('Previous day data found:', !!previousDayData)

    return filteredData.map(item => {
      const callLong = item[`${selectedParticipant}_option_index_call_long`] || 0
      const putShort = item[`${selectedParticipant}_option_index_put_short`] || 0
      const putLong = item[`${selectedParticipant}_option_index_put_long`] || 0
      const callShort = item[`${selectedParticipant}_option_index_call_short`] || 0

      const currentOptionLong = callLong + putShort
      const currentOptionShort = putLong + callShort

      if (item.date === startDate) {
        // The Start Date shows its own change from previous day as the starting point (0 + change)
        // OR should it start at 0? 
        // The original code: Friday shows "fridayOptionLongChange". 
        // Logic: The chart shows cumulative change within this cycle.
        // Day 1 (Friday/Wed) change is (Day 1 - Day 0). Value = Change.
        return {
          date: item.date,
          optionLongChange: baselineOptionLongChange,
          optionShortChange: baselineOptionShortChange,
          callLongChange: baselineCallLongChange,
          putLongChange: baselinePutLongChange,
          callShortChange: baselineCallShortChange,
          putShortChange: baselinePutShortChange,
          isCycleStart: true
        }
      } else {
        // Other days show cumulative change from Baseline
        // Logic: (Current - Baseline) + BaselineChange 
        // = (Current - Day0)
        // Original code: currentOptionLong - fridayOptionLong + fridayOptionLongChange
        // = currentOptionLong - (fridayOptionLong - fridayOptionLongChange)
        // = currentOptionLong - prevOptionLong (Day 0 value)

        // Let's stick to the original formula structure to be safe:
        // cumulative = (current - baselineValue) + baselineChange

        const dayOptionLongChange = currentOptionLong - baselineOptionLong
        const dayOptionShortChange = currentOptionShort - baselineOptionShort

        const dayCallLongChange = callLong - baselineCallLong
        const dayPutLongChange = putLong - baselinePutLong
        const dayCallShortChange = callShort - baselineCallShort
        const dayPutShortChange = putShort - baselinePutShort

        return {
          date: item.date,
          optionLongChange: baselineOptionLongChange + dayOptionLongChange,
          optionShortChange: baselineOptionShortChange + dayOptionShortChange,
          callLongChange: baselineCallLongChange + dayCallLongChange,
          putLongChange: baselinePutLongChange + dayPutLongChange,
          callShortChange: baselineCallShortChange + dayCallShortChange,
          putShortChange: baselinePutShortChange + dayPutShortChange,
          isCycleStart: false
        }
      }
    })
  }, [chartData, selectedParticipant, startDate, endDate])

  // Get available date ranges (Cycle Starts)
  const availableCycleStarts = useMemo(() => {
    const cycleStarts = []
    chartData.forEach(item => {
      if (isCycleStartDate(item.date)) {
        cycleStarts.push(item.date)
      }
    })
    return cycleStarts.sort((a, b) => {
      const [dayA, monthA, yearA] = a.split('-')
      const [dayB, monthB, yearB] = b.split('-')
      const dateA = new Date(`${yearA}-${monthA}-${dayA}`)
      const dateB = new Date(`${yearB}-${monthB}-${dayB}`)
      return dateA - dateB
    })
  }, [chartData])

  return (
    <div className="chart-card">
      <div className="flex flex-col space-y-4 mb-4">
        <div>
          <h3 className="text-xl font-semibold">Weekly Options Cumulative Change</h3>
          <p className="text-sm text-gray-400 mt-1">
            Cumulative change from Cycle Start baseline: Option Long = Call Long + Put Short | Option Short = Put Long + Call Short
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={selectedParticipant}
            onChange={(e) => setSelectedParticipant(e.target.value)}
            className="px-3 py-2 bg-dark-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
          >
            {participants.map(participant => (
              <option key={participant} value={participant}>{participant}</option>
            ))}
          </select>

          <select
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 bg-dark-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
          >
            <option value="">Select Start Date</option>
            {availableCycleStarts.map(date => (
              <option key={date} value={date}>{date}</option>
            ))}
          </select>

          <select
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 bg-dark-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
          >
            <option value="">Select End Date</option>
            {chartData
              .filter(item => {
                if (!startDate) return true
                const [dayItem, monthItem, yearItem] = item.date.split('-')
                const [dayStart, monthStart, yearStart] = startDate.split('-')
                const itemDate = new Date(`${yearItem}-${monthItem}-${dayItem}`)
                const start = new Date(`${yearStart}-${monthStart}-${dayStart}`)
                return itemDate >= start
              })
              .map(item => item.date)
              .sort((a, b) => {
                const [dayA, monthA, yearA] = a.split('-')
                const [dayB, monthB, yearB] = b.split('-')
                const dateA = new Date(`${yearA}-${monthA}-${dayA}`)
                const dateB = new Date(`${yearB}-${monthB}-${dayB}`)
                return dateA - dateB
              })
              .map(date => (
                <option key={date} value={date}>{date}</option>
              ))
            }
          </select>

          <button
            onClick={() => setShowDetailed(!showDetailed)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${showDetailed
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-600 text-gray-200 hover:bg-gray-700'
              }`}
          >
            {showDetailed ? 'Hide Detailed' : 'See Detailed'}
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={cumulativeData}>
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
          {!showDetailed ? (
            <>
              <Line
                type="monotone"
                dataKey="optionLongChange"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                name="Option Long Change"
              />
              <Line
                type="monotone"
                dataKey="optionShortChange"
                stroke="#ef4444"
                strokeWidth={3}
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                name="Option Short Change"
              />
            </>
          ) : (
            <>
              <Line
                type="monotone"
                dataKey="callLongChange"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
                name="Call Long Change"
              />
              <Line
                type="monotone"
                dataKey="putLongChange"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 3 }}
                name="Put Long Change"
              />
              <Line
                type="monotone"
                dataKey="callShortChange"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ fill: '#f59e0b', strokeWidth: 2, r: 3 }}
                name="Call Short Change"
              />
              <Line
                type="monotone"
                dataKey="putShortChange"
                stroke="#ec4899"
                strokeWidth={2}
                dot={{ fill: '#ec4899', strokeWidth: 2, r: 3 }}
                name="Put Short Change"
              />
            </>
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default WeeklyOptionsCumulativeChart 