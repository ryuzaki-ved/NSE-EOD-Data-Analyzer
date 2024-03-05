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

  // Get all available dates and find the latest Friday
  const allDates = useMemo(() => {
    const dates = chartData.map(item => item.date).sort((a, b) => {
      // Convert DD-MM-YYYY to YYYY-MM-DD for proper date comparison
      const [dayA, monthA, yearA] = a.split('-')
      const [dayB, monthB, yearB] = b.split('-')
      const dateA = new Date(`${yearA}-${monthA}-${dayA}`)
      const dateB = new Date(`${yearB}-${monthB}-${dayB}`)
      return dateA - dateB
    })
    
    // Find the latest Friday
    let latestFriday = null
    for (let i = dates.length - 1; i >= 0; i--) {
      const [day, month, year] = dates[i].split('-')
      const date = new Date(`${year}-${month}-${day}`)
      if (date.getDay() === 5) { // Friday = 5
        latestFriday = dates[i]
        break
      }
    }
    
    return { dates, latestFriday }
  }, [chartData])

  // Set default date range to latest Friday to latest available date
  React.useEffect(() => {
    if (allDates.latestFriday && !startDate) {
      setStartDate(allDates.latestFriday)
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

    // Get Friday baseline values
    const fridayData = filteredData.find(item => {
      const [day, month, year] = item.date.split('-')
      const date = new Date(`${year}-${month}-${day}`)
      return date.getDay() === 5 // Friday
    })

    if (!fridayData) return []

    // Find the previous day (Thursday) data for Friday calculation
    const [dayFriday, monthFriday, yearFriday] = fridayData.date.split('-')
    const fridayDate = new Date(`${yearFriday}-${monthFriday}-${dayFriday}`)
    const previousDayDate = new Date(fridayDate)
    previousDayDate.setDate(fridayDate.getDate() - 1)
    
    // Format the previous day in the same format as the data (DD-MMM-YYYY)
    const day = previousDayDate.getDate().toString().padStart(2, '0')
    const month = previousDayDate.toLocaleDateString('en-US', { month: 'short' })
    const year = previousDayDate.getFullYear()
    const previousDayStr = `${day}-${month}-${year}`
    
    // Look for previous day data in the entire dataset, not just filtered data
    const previousDayData = chartData.find(item => item.date === previousDayStr)

    // Calculate Friday's change from previous day
    const fridayCallLong = fridayData[`${selectedParticipant}_option_index_call_long`] || 0
    const fridayPutShort = fridayData[`${selectedParticipant}_option_index_put_short`] || 0
    const fridayPutLong = fridayData[`${selectedParticipant}_option_index_put_long`] || 0
    const fridayCallShort = fridayData[`${selectedParticipant}_option_index_call_short`] || 0

    const fridayOptionLong = fridayCallLong + fridayPutShort
    const fridayOptionShort = fridayPutLong + fridayCallShort

    const prevCallLong = previousDayData ? (previousDayData[`${selectedParticipant}_option_index_call_long`] || 0) : 0
    const prevPutShort = previousDayData ? (previousDayData[`${selectedParticipant}_option_index_put_short`] || 0) : 0
    const prevPutLong = previousDayData ? (previousDayData[`${selectedParticipant}_option_index_put_long`] || 0) : 0
    const prevCallShort = previousDayData ? (previousDayData[`${selectedParticipant}_option_index_call_short`] || 0) : 0

    const prevOptionLong = prevCallLong + prevPutShort
    const prevOptionShort = prevPutLong + prevCallShort

    // Friday's change from previous day
    const fridayOptionLongChange = fridayOptionLong - prevOptionLong
    const fridayOptionShortChange = fridayOptionShort - prevOptionShort

    // Calculate individual Friday changes
    const fridayCallLongChange = fridayData[`${selectedParticipant}_option_index_call_long`] - (prevCallLong || 0)
    const fridayPutLongChange = fridayData[`${selectedParticipant}_option_index_put_long`] - (prevPutLong || 0)
    const fridayCallShortChange = fridayData[`${selectedParticipant}_option_index_call_short`] - (prevCallShort || 0)
    const fridayPutShortChange = fridayData[`${selectedParticipant}_option_index_put_short`] - (prevPutShort || 0)

    // Debug logging
    console.log('Friday date:', fridayData.date)
    console.log('Previous day string:', previousDayStr)
    console.log('Previous day data found:', !!previousDayData)
    console.log('Friday Option Long:', fridayOptionLong)
    console.log('Previous Option Long:', prevOptionLong)
    console.log('Friday Option Long Change:', fridayOptionLongChange)

    return filteredData.map(item => {
      const callLong = item[`${selectedParticipant}_option_index_call_long`] || 0
      const putShort = item[`${selectedParticipant}_option_index_put_short`] || 0
      const putLong = item[`${selectedParticipant}_option_index_put_long`] || 0
      const callShort = item[`${selectedParticipant}_option_index_call_short`] || 0

      const currentOptionLong = callLong + putShort
      const currentOptionShort = putLong + callShort

      const [day, month, year] = item.date.split('-')
      const isFriday = new Date(`${year}-${month}-${day}`).getDay() === 5

      if (isFriday) {
        // Friday shows the change from previous day
        return {
          date: item.date,
          optionLongChange: fridayOptionLongChange,
          optionShortChange: fridayOptionShortChange,
          callLongChange: fridayCallLongChange,
          putLongChange: fridayPutLongChange,
          callShortChange: fridayCallShortChange,
          putShortChange: fridayPutShortChange,
          isFriday: true
        }
      } else {
        // Other days show cumulative change from Friday baseline
        const dayOptionLongChange = currentOptionLong - fridayOptionLong
        const dayOptionShortChange = currentOptionShort - fridayOptionShort
        const dayCallLongChange = callLong - fridayData[`${selectedParticipant}_option_index_call_long`]
        const dayPutLongChange = putLong - fridayData[`${selectedParticipant}_option_index_put_long`]
        const dayCallShortChange = callShort - fridayData[`${selectedParticipant}_option_index_call_short`]
        const dayPutShortChange = putShort - fridayData[`${selectedParticipant}_option_index_put_short`]

        return {
          date: item.date,
          optionLongChange: fridayOptionLongChange + dayOptionLongChange,
          optionShortChange: fridayOptionShortChange + dayOptionShortChange,
          callLongChange: fridayCallLongChange + dayCallLongChange,
          putLongChange: fridayPutLongChange + dayPutLongChange,
          callShortChange: fridayCallShortChange + dayCallShortChange,
          putShortChange: fridayPutShortChange + dayPutShortChange,
          isFriday: false
        }
      }
    })
  }, [chartData, selectedParticipant, startDate, endDate])

  // Get available date ranges (Fridays)
  const availableFridays = useMemo(() => {
    const fridays = []
    chartData.forEach(item => {
      const [day, month, year] = item.date.split('-')
      const date = new Date(`${year}-${month}-${day}`)
      if (date.getDay() === 5) { // Friday
        fridays.push(item.date)
      }
    })
    return fridays.sort((a, b) => {
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
            Cumulative change from Friday baseline: Option Long = Call Long + Put Short | Option Short = Put Long + Call Short
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
             <option value="">Select Start Date (Friday)</option>
             {availableFridays.map(friday => (
               <option key={friday} value={friday}>{friday}</option>
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
             className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
               showDetailed 
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