import React, { useState, useMemo } from 'react'
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'
import ChartHeaderHUD from '../charts/ChartHeaderHUD'
import {
  formatAxisDate, formatSignedCompact, formatIndianCompact, getAxisInterval
} from '../../utils/chartHelpers'

const PARTICIPANTS = ['FII', 'Pro', 'Client', 'DII']

const WeeklyOptionsCumulativeChart = ({ chartData }) => {
  const [selectedParticipant, setSelectedParticipant] = useState('FII')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [viewMode, setViewMode] = useState('net')
  const [hoveredSession, setHoveredSession] = useState(null)

  // Helper to check if a date is a cycle start date
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
    if (!chartData || chartData.length === 0) return { dates: [], latestCycleStart: null }
    const dates = chartData.map(item => item.date).sort((a, b) => {
      const [dayA, monthA, yearA] = a.split('-')
      const [dayB, monthB, yearB] = b.split('-')
      return new Date(`${yearA}-${monthA}-${dayA}`) - new Date(`${yearB}-${monthB}-${dayB}`)
    })

    let latestCycleStart = null
    for (let i = dates.length - 1; i >= 0; i--) {
      if (isCycleStartDate(dates[i])) {
        latestCycleStart = dates[i]
        break
      }
    }

    return { dates, latestCycleStart }
  }, [chartData])

  // Set default date range
  React.useEffect(() => {
    if (allDates.latestCycleStart && !startDate) {
      setStartDate(allDates.latestCycleStart)
      setEndDate(allDates.dates[allDates.dates.length - 1])
    }
  }, [allDates, startDate])

  // Calculate cumulative options data for selected participant and date range
  const cumulativeData = useMemo(() => {
    if (!startDate || !endDate || !chartData) return []

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
      return new Date(`${yearA}-${monthA}-${dayA}`) - new Date(`${yearB}-${monthB}-${dayB}`)
    })

    if (filteredData.length === 0) return []

    const baselineData = filteredData.find(item => item.date === startDate)
    if (!baselineData) return []

    const [dayBase, monthBase, yearBase] = baselineData.date.split('-')
    const baselineDateObj = new Date(`${yearBase}-${monthBase}-${dayBase}`)
    const previousDayDate = new Date(baselineDateObj)
    previousDayDate.setDate(baselineDateObj.getDate() - 1)

    const day = previousDayDate.getDate().toString().padStart(2, '0')
    const month = previousDayDate.toLocaleDateString('en-US', { month: 'short' })
    const year = previousDayDate.getFullYear()
    const previousDayStr = `${day}-${month}-${year}`

    const previousDayData = chartData.find(item => item.date === previousDayStr)

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

    const baselineOptionLongChange = baselineOptionLong - prevOptionLong
    const baselineOptionShortChange = baselineOptionShort - prevOptionShort

    const baselineCallLongChange = baselineData[`${selectedParticipant}_option_index_call_long`] - (prevCallLong || 0)
    const baselinePutLongChange = baselineData[`${selectedParticipant}_option_index_put_long`] - (prevPutLong || 0)
    const baselineCallShortChange = baselineData[`${selectedParticipant}_option_index_call_short`] - (prevCallShort || 0)
    const baselinePutShortChange = baselineData[`${selectedParticipant}_option_index_put_short`] - (prevPutShort || 0)

    return filteredData.map(item => {
      const callLong = item[`${selectedParticipant}_option_index_call_long`] || 0
      const putShort = item[`${selectedParticipant}_option_index_put_short`] || 0
      const putLong = item[`${selectedParticipant}_option_index_put_long`] || 0
      const callShort = item[`${selectedParticipant}_option_index_call_short`] || 0

      const currentOptionLong = callLong + putShort
      const currentOptionShort = putLong + callShort

      if (item.date === startDate) {
        return {
          date: item.date,
          optionLongChange: baselineOptionLongChange,
          optionShortChange: baselineOptionShortChange,
          netOptionChange: baselineOptionLongChange - baselineOptionShortChange,
          callLongChange: baselineCallLongChange,
          putLongChange: baselinePutLongChange,
          callShortChange: baselineCallShortChange,
          putShortChange: baselinePutShortChange,
          isCycleStart: true
        }
      } else {
        const dayOptionLongChange = currentOptionLong - baselineOptionLong
        const dayOptionShortChange = currentOptionShort - baselineOptionShort

        const optLongChange = baselineOptionLongChange + dayOptionLongChange
        const optShortChange = baselineOptionShortChange + dayOptionShortChange

        return {
          date: item.date,
          optionLongChange: optLongChange,
          optionShortChange: optShortChange,
          netOptionChange: optLongChange - optShortChange,
          callLongChange: baselineCallLongChange + (callLong - baselineCallLong),
          putLongChange: baselinePutLongChange + (putLong - baselinePutLong),
          callShortChange: baselineCallShortChange + (callShort - baselineCallShort),
          putShortChange: baselinePutShortChange + (putShort - baselinePutShort),
          isCycleStart: false
        }
      }
    })
  }, [chartData, selectedParticipant, startDate, endDate])

  const availableCycleStarts = useMemo(() => {
    if (!chartData) return []
    const cycleStarts = []
    chartData.forEach(item => {
      if (isCycleStartDate(item.date)) {
        cycleStarts.push(item.date)
      }
    })
    return cycleStarts.sort((a, b) => {
      const [dayA, monthA, yearA] = a.split('-')
      const [dayB, monthB, yearB] = b.split('-')
      return new Date(`${yearA}-${monthA}-${dayA}`) - new Date(`${yearB}-${monthB}-${dayB}`)
    })
  }, [chartData])

  const handleMouseMove = (state) => {
    if (state && state.activePayload && state.activePayload.length > 0) {
      const payload = state.activePayload[0].payload
      setHoveredSession({
        date: payload.date,
        values: [
          { label: 'Net Cycle Δ', value: payload.netOptionChange, color: payload.netOptionChange >= 0 ? '#10B981' : '#F43F5E' },
          { label: 'Bullish Legs', value: payload.optionLongChange, color: '#38BDF8' },
          { label: 'Bearish Legs', value: payload.optionShortChange, color: '#F59E0B' },
        ],
        bias: payload.netOptionChange > 0 ? 'CYCLE BULLISH' : payload.netOptionChange < 0 ? 'CYCLE BEARISH' : 'CYCLE NEUTRAL',
      })
    }
  }

  const seriesChips = PARTICIPANTS.map((p) => ({
    key: p,
    label: p,
    color: p === 'FII' ? '#10B981' : p === 'Pro' ? '#F59E0B' : p === 'Client' ? '#38BDF8' : '#818CF8',
    active: selectedParticipant === p,
  }))

  const axisInterval = getAxisInterval(cumulativeData.length)

  return (
    <div className="w-full">
      <ChartHeaderHUD
        title="Weekly Options Expiry Cycle Flow"
        subtitle={`Cumulative option contract progression since cycle start for ${selectedParticipant}`}
        tag="CYCLE CUMULATIVE"
        viewMode={viewMode}
        viewOptions={[
          { key: 'net', label: 'Net Cycle Δ' },
          { key: 'synthetic', label: 'Bull / Bear Legs' },
          { key: 'legs', label: 'All 4 Legs' },
        ]}
        onViewModeChange={setViewMode}
        seriesChips={seriesChips}
        onToggleSeries={(p) => setSelectedParticipant(p)}
        hoveredData={hoveredSession}
      />

      {/* Date Selectors Row */}
      <div className="flex items-center space-x-2 my-2">
        <span className="text-[11px] font-mono text-slate-400">CYCLE:</span>
        <select
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="px-2.5 py-1 bg-[#0B0F19] border border-white/[0.08] rounded-md text-[11px] font-mono text-slate-300 focus:ring-1 focus:ring-emerald-500/40 outline-none"
        >
          {availableCycleStarts.map(date => (
            <option key={date} value={date}>{date}</option>
          ))}
        </select>
        <span className="text-slate-400 text-xs font-mono">→</span>
        <select
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="px-2.5 py-1 bg-[#0B0F19] border border-white/[0.08] rounded-md text-[11px] font-mono text-slate-300 focus:ring-1 focus:ring-emerald-500/40 outline-none"
        >
          {allDates.dates
            .filter(d => {
              if (!startDate) return true
              const [dayItem, monthItem, yearItem] = d.split('-')
              const [dayStart, monthStart, yearStart] = startDate.split('-')
              return new Date(`${yearItem}-${monthItem}-${dayItem}`) >= new Date(`${yearStart}-${monthStart}-${dayStart}`)
            })
            .map(date => (
              <option key={date} value={date}>{date}</option>
            ))
          }
        </select>
      </div>

      <div className="h-[280px] w-full mt-1">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'net' ? (
            <AreaChart
              data={cumulativeData}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setHoveredSession(null)}
            >
              <defs>
                <linearGradient id="cycleNetGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                tickFormatter={formatAxisDate}
                interval={axisInterval}
              />
              <YAxis
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                tickFormatter={(val) => formatIndianCompact(val)}
              />
              <ReferenceLine y={0} stroke="#334155" strokeWidth={1.5} />
              <Tooltip cursor={{ stroke: '#475569', strokeDasharray: '3 3' }} content={() => null} />
              <Area
                type="monotone"
                dataKey="netOptionChange"
                stroke="#10B981"
                strokeWidth={2}
                fill="url(#cycleNetGrad)"
                name="Net Cycle Cumulative Δ"
              />
            </AreaChart>
          ) : viewMode === 'synthetic' ? (
            <LineChart
              data={cumulativeData}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setHoveredSession(null)}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                tickFormatter={formatAxisDate}
                interval={axisInterval}
              />
              <YAxis
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                tickFormatter={(val) => formatIndianCompact(val)}
              />
              <ReferenceLine y={0} stroke="#334155" strokeWidth={1} />
              <Tooltip cursor={{ stroke: '#475569', strokeDasharray: '3 3' }} content={() => null} />
              <Line
                type="monotone"
                dataKey="optionLongChange"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ fill: '#10B981', strokeWidth: 0, r: 2.5 }}
                activeDot={{ r: 4.5, stroke: '#10B981', strokeWidth: 2, fill: '#0B0F19' }}
                name="Bullish Legs Δ"
              />
              <Line
                type="monotone"
                dataKey="optionShortChange"
                stroke="#F43F5E"
                strokeWidth={2}
                dot={{ fill: '#F43F5E', strokeWidth: 0, r: 2.5 }}
                activeDot={{ r: 4.5, stroke: '#F43F5E', strokeWidth: 2, fill: '#0B0F19' }}
                name="Bearish Legs Δ"
              />
            </LineChart>
          ) : (
            <LineChart
              data={cumulativeData}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setHoveredSession(null)}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                tickFormatter={formatAxisDate}
                interval={axisInterval}
              />
              <YAxis
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                tickFormatter={(val) => formatIndianCompact(val)}
              />
              <ReferenceLine y={0} stroke="#334155" strokeWidth={1} />
              <Tooltip cursor={{ stroke: '#475569', strokeDasharray: '3 3' }} content={() => null} />
              <Line type="monotone" dataKey="callLongChange" stroke="#38BDF8" strokeWidth={1.5} dot={false} name="Call Long Δ" />
              <Line type="monotone" dataKey="putLongChange" stroke="#818CF8" strokeWidth={1.5} dot={false} name="Put Long Δ" />
              <Line type="monotone" dataKey="callShortChange" stroke="#F59E0B" strokeWidth={1.5} dot={false} name="Call Short Δ" />
              <Line type="monotone" dataKey="putShortChange" stroke="#FB7185" strokeWidth={1.5} dot={false} name="Put Short Δ" />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default WeeklyOptionsCumulativeChart