import React, { useState, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell
} from 'recharts'
import ChartHeaderHUD from '../charts/ChartHeaderHUD'
import {
  filterByTimeframe, formatAxisDate, formatSignedCompact,
  formatIndianCompact, getAxisInterval
} from '../../utils/chartHelpers'

const PARTICIPANTS = ['FII', 'Pro', 'Client', 'DII']

const DailyFutureChangeChart = ({ chartData }) => {
  const [selectedParticipant, setSelectedParticipant] = useState('FII')
  const [timeframe, setTimeframe] = useState('1M')
  const [viewMode, setViewMode] = useState('net')
  const [hoveredSession, setHoveredSession] = useState(null)

  // Process data for daily change
  const processedData = useMemo(() => {
    if (!chartData || chartData.length === 0) return []

    // Sort chronologically
    const sortedData = [...chartData].sort((a, b) => {
      const [dayA, monthA, yearA] = a.date.split('-')
      const [dayB, monthB, yearB] = b.date.split('-')
      return new Date(`${yearA}-${monthA}-${dayA}`) - new Date(`${yearB}-${monthB}-${dayB}`)
    })

    return sortedData.map((item, index) => {
      const prevItem = index > 0 ? sortedData[index - 1] : null
      const currentLong = item[`${selectedParticipant}_future_index_long`] || 0
      const currentShort = item[`${selectedParticipant}_future_index_short`] || 0
      const prevLong = prevItem ? (prevItem[`${selectedParticipant}_future_index_long`] || 0) : currentLong
      const prevShort = prevItem ? (prevItem[`${selectedParticipant}_future_index_short`] || 0) : currentShort

      const longChange = currentLong - prevLong
      const shortChange = currentShort - prevShort
      const netChange = longChange - shortChange

      return {
        date: item.date,
        longChange,
        shortChange,
        netChange,
      }
    })
  }, [chartData, selectedParticipant])

  // Filter by timeframe
  const filteredData = useMemo(() => {
    return filterByTimeframe(processedData, timeframe)
  }, [processedData, timeframe])

  const axisInterval = getAxisInterval(filteredData.length)

  const handleMouseMove = (state) => {
    if (state && state.activePayload && state.activePayload.length > 0) {
      const payload = state.activePayload[0].payload
      setHoveredSession({
        date: payload.date,
        values: [
          { label: `${selectedParticipant} Net Δ`, value: payload.netChange, color: payload.netChange >= 0 ? '#10B981' : '#F43F5E' },
          { label: 'Long Δ', value: payload.longChange, color: '#38BDF8' },
          { label: 'Short Δ', value: payload.shortChange, color: '#F59E0B' },
        ],
        bias: payload.netChange > 0 ? 'BULLISH Δ' : payload.netChange < 0 ? 'BEARISH Δ' : 'FLAT',
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
        title="Daily Future Index Contract Flow"
        subtitle={`Day-over-day net contract change for ${selectedParticipant}`}
        tag="DAILY DELTA"
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
        viewMode={viewMode}
        viewOptions={[
          { key: 'net', label: 'Net Flow' },
          { key: 'split', label: 'Long / Short' },
        ]}
        onViewModeChange={setViewMode}
        seriesChips={seriesChips}
        onToggleSeries={(p) => setSelectedParticipant(p)}
        hoveredData={hoveredSession}
      />

      <div className="h-[280px] w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'net' ? (
            <BarChart
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
              <ReferenceLine y={0} stroke="#334155" strokeWidth={1.5} />
              <Tooltip cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }} content={() => null} />
              <Bar dataKey="netChange" radius={[3, 3, 0, 0]} maxBarSize={28}>
                {filteredData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.netChange >= 0 ? '#10B981' : '#F43F5E'}
                  />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <BarChart
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
              <Tooltip cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }} content={() => null} />
              <Bar dataKey="longChange" fill="#10B981" name="Long Δ" radius={[2, 2, 0, 0]} maxBarSize={18} />
              <Bar dataKey="shortChange" fill="#F43F5E" name="Short Δ" radius={[2, 2, 0, 0]} maxBarSize={18} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default DailyFutureChangeChart
