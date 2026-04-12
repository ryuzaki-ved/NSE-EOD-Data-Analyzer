import React, { useState, useMemo } from 'react'
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine
} from 'recharts'
import ChartHeaderHUD from '../charts/ChartHeaderHUD'
import {
  filterByTimeframe, formatAxisDate, formatSignedCompact,
  formatIndianCompact, getAxisInterval
} from '../../utils/chartHelpers'

const PARTICIPANTS = ['FII', 'Pro', 'Client', 'DII']

const MonthlyFutureCumulativeChart = ({ chartData }) => {
  const [selectedParticipant, setSelectedParticipant] = useState('FII')
  const [timeframe, setTimeframe] = useState('1M')
  const [viewMode, setViewMode] = useState('net')
  const [hoveredSession, setHoveredSession] = useState(null)

  // Process data for cumulative change from month start
  const cumulativeData = useMemo(() => {
    if (!chartData || chartData.length === 0) return []

    // Sort data chronologically
    const sortedData = [...chartData].sort((a, b) => {
      const [dayA, monthA, yearA] = a.date.split('-')
      const [dayB, monthB, yearB] = b.date.split('-')
      return new Date(`${yearA}-${monthA}-${dayA}`) - new Date(`${yearB}-${monthB}-${dayB}`)
    })

    if (sortedData.length === 0) return []

    // Filter for current month (latest month in data)
    const lastDate = sortedData[sortedData.length - 1].date
    const [lastDay, lastMonth, lastYear] = lastDate.split('-')

    const currentMonthData = sortedData.filter(item => {
      const [d, m, y] = item.date.split('-')
      return m === lastMonth && y === lastYear
    })

    if (currentMonthData.length === 0) return []

    const firstCurrentMonthDate = currentMonthData[0].date
    const startIndexInFull = sortedData.findIndex(item => item.date === firstCurrentMonthDate)

    let baseLong = 0
    let baseShort = 0

    if (startIndexInFull > 0) {
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
      const longCumulative = currentLong - baseLong
      const shortCumulative = currentShort - baseShort
      const netCumulative = longCumulative - shortCumulative

      return {
        date: item.date,
        longCumulative,
        shortCumulative,
        netCumulative,
      }
    })
  }, [chartData, selectedParticipant])

  const filteredData = useMemo(() => {
    return filterByTimeframe(cumulativeData, timeframe)
  }, [cumulativeData, timeframe])

  const axisInterval = getAxisInterval(filteredData.length)

  const handleMouseMove = (state) => {
    if (state && state.activePayload && state.activePayload.length > 0) {
      const payload = state.activePayload[0].payload
      setHoveredSession({
        date: payload.date,
        values: [
          { label: 'Net Cumulative', value: payload.netCumulative, color: payload.netCumulative >= 0 ? '#10B981' : '#F43F5E' },
          { label: 'Long Cum.', value: payload.longCumulative, color: '#38BDF8' },
          { label: 'Short Cum.', value: payload.shortCumulative, color: '#F59E0B' },
        ],
        bias: payload.netCumulative > 0 ? 'MONTHLY BULLISH' : payload.netCumulative < 0 ? 'MONTHLY BEARISH' : 'FLAT',
      })
    }
  }

  const seriesChips = PARTICIPANTS.map((p) => ({
    key: p,
    label: p,
    color: p === 'FII' ? '#10B981' : p === 'Pro' ? '#F59E0B' : p === 'Client' ? '#38BDF8' : '#818CF8',
    active: selectedParticipant === p,
  }))

  return (
    <div className="w-full">
      <ChartHeaderHUD
        title="Monthly Future Cumulative Trend"
        subtitle={`MTD cumulative contract build-up for ${selectedParticipant}`}
        tag="MTD BUILD-UP"
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
        viewMode={viewMode}
        viewOptions={[
          { key: 'net', label: 'Net MTD' },
          { key: 'curves', label: 'Long / Short' },
        ]}
        onViewModeChange={setViewMode}
        seriesChips={seriesChips}
        onToggleSeries={(p) => setSelectedParticipant(p)}
        hoveredData={hoveredSession}
      />

      <div className="h-[280px] w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'net' ? (
            <AreaChart
              data={filteredData}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setHoveredSession(null)}
            >
              <defs>
                <linearGradient id="netCumGrad" x1="0" y1="0" x2="0" y2="1">
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
                dataKey="netCumulative"
                stroke="#10B981"
                strokeWidth={2}
                fill="url(#netCumGrad)"
                name="Net MTD Cumulative"
              />
            </AreaChart>
          ) : (
            <LineChart
              data={filteredData}
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
                dataKey="longCumulative"
                name="Future Long Cumulative"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ fill: '#10B981', strokeWidth: 0, r: 2.5 }}
                activeDot={{ r: 4.5, stroke: '#10B981', strokeWidth: 2, fill: '#0B0F19' }}
              />
              <Line
                type="monotone"
                dataKey="shortCumulative"
                name="Future Short Cumulative"
                stroke="#F43F5E"
                strokeWidth={2}
                dot={{ fill: '#F43F5E', strokeWidth: 0, r: 2.5 }}
                activeDot={{ r: 4.5, stroke: '#F43F5E', strokeWidth: 2, fill: '#0B0F19' }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default MonthlyFutureCumulativeChart
