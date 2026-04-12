import React, { useState, useMemo } from 'react'
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'
import ChartHeaderHUD from '../charts/ChartHeaderHUD'
import {
  filterByTimeframe, formatAxisDate, formatSignedCompact,
  formatIndianCompact, getAxisInterval
} from '../../utils/chartHelpers'

const PARTICIPANTS = ['FII', 'Pro', 'Client', 'DII']

const OptionsLongVsShortChart = ({ chartData }) => {
  const [selectedParticipant, setSelectedParticipant] = useState('FII')
  const [timeframe, setTimeframe] = useState('1M')
  const [viewMode, setViewMode] = useState('net')
  const [hoveredSession, setHoveredSession] = useState(null)

  // Calculate options long vs short data for selected participant
  const optionsData = useMemo(() => {
    if (!chartData) return []
    return chartData.map(item => {
      const callLong = item[`${selectedParticipant}_option_index_call_long`] || 0
      const putShort = item[`${selectedParticipant}_option_index_put_short`] || 0
      const putLong = item[`${selectedParticipant}_option_index_put_long`] || 0
      const callShort = item[`${selectedParticipant}_option_index_call_short`] || 0

      const optionLong = callLong + putShort // Synthetic Bullish
      const optionShort = putLong + callShort // Synthetic Bearish
      const netOptionBias = optionLong - optionShort

      return {
        date: item.date,
        optionLong,
        optionShort,
        netOptionBias,
      }
    }).filter(item => item.optionLong > 0 || item.optionShort > 0)
  }, [chartData, selectedParticipant])

  const filteredData = useMemo(() => {
    return filterByTimeframe(optionsData, timeframe)
  }, [optionsData, timeframe])

  const axisInterval = getAxisInterval(filteredData.length)

  const handleMouseMove = (state) => {
    if (state && state.activePayload && state.activePayload.length > 0) {
      const payload = state.activePayload[0].payload
      setHoveredSession({
        date: payload.date,
        values: [
          { label: 'Net Option Bias', value: payload.netOptionBias, color: payload.netOptionBias >= 0 ? '#10B981' : '#F43F5E' },
          { label: 'Bullish Legs', value: payload.optionLong, color: '#38BDF8' },
          { label: 'Bearish Legs', value: payload.optionShort, color: '#F59E0B' },
        ],
        bias: payload.netOptionBias > 0 ? 'NET BULLISH' : payload.netOptionBias < 0 ? 'NET BEARISH' : 'NEUTRAL',
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
        title="Options Synthetic Directional Exposure"
        subtitle={`Bullish (Call Long + Put Short) vs Bearish (Put Long + Call Short) for ${selectedParticipant}`}
        tag="SYNTHETIC EXPOSURE"
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
        viewMode={viewMode}
        viewOptions={[
          { key: 'net', label: 'Net Directional' },
          { key: 'curves', label: 'Long vs Short' },
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
                <linearGradient id="optNetGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.0} />
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
                dataKey="netOptionBias"
                stroke="#38BDF8"
                strokeWidth={2}
                fill="url(#optNetGrad)"
                name="Net Option Bias"
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
              <Tooltip cursor={{ stroke: '#475569', strokeDasharray: '3 3' }} content={() => null} />
              <Line
                type="monotone"
                dataKey="optionLong"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ fill: '#10B981', strokeWidth: 0, r: 2.5 }}
                activeDot={{ r: 4.5, stroke: '#10B981', strokeWidth: 2, fill: '#0B0F19' }}
                name="Bullish Legs (Call L + Put S)"
              />
              <Line
                type="monotone"
                dataKey="optionShort"
                stroke="#F43F5E"
                strokeWidth={2}
                dot={{ fill: '#F43F5E', strokeWidth: 0, r: 2.5 }}
                activeDot={{ r: 4.5, stroke: '#F43F5E', strokeWidth: 2, fill: '#0B0F19' }}
                name="Bearish Legs (Put L + Call S)"
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default OptionsLongVsShortChart