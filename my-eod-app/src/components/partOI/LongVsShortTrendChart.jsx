import React, { useState, useMemo } from 'react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'
import ChartHeaderHUD from '../charts/ChartHeaderHUD'
import {
  filterByTimeframe, formatAxisDate, formatSignedCompact,
  formatIndianCompact, getAxisInterval
} from '../../utils/chartHelpers'

const DESK_CONFIG = [
  { key: 'FII', label: 'FII', color: '#10B981', netKey: 'FII_net', longKey: 'FII_long', shortKey: 'FII_short' },
  { key: 'Pro', label: 'PRO', color: '#F59E0B', netKey: 'Pro_net', longKey: 'Pro_long', shortKey: 'Pro_short' },
  { key: 'Client', label: 'CLIENT', color: '#38BDF8', netKey: 'Client_net', longKey: 'Client_long', shortKey: 'Client_short' },
  { key: 'DII', label: 'DII', color: '#818CF8', netKey: 'DII_net', longKey: 'DII_long', shortKey: 'DII_short' },
]

const LongVsShortTrendChart = ({ chartData }) => {
  const [timeframe, setTimeframe] = useState('1M')
  const [viewMode, setViewMode] = useState('net')
  const [activeDesks, setActiveDesks] = useState({
    FII: true,
    Pro: true,
    Client: true,
    DII: false,
  })
  const [hoveredSession, setHoveredSession] = useState(null)

  // Enrich data with Net positions
  const enrichedData = useMemo(() => {
    if (!chartData) return []
    return chartData.map((d) => ({
      ...d,
      FII_net: (d.FII_long || 0) - (d.FII_short || 0),
      Pro_net: (d.Pro_long || 0) - (d.Pro_short || 0),
      Client_net: (d.Client_long || 0) - (d.Client_short || 0),
      DII_net: (d.DII_long || 0) - (d.DII_short || 0),
    }))
  }, [chartData])

  // Filter by timeframe
  const filteredData = useMemo(() => {
    return filterByTimeframe(enrichedData, timeframe)
  }, [enrichedData, timeframe])

  // Toggle desk series visibility
  const handleToggleSeries = (key) => {
    setActiveDesks((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  // Handle Chart Hover for HUD
  const handleMouseMove = (state) => {
    if (state && state.activePayload && state.activePayload.length > 0) {
      const payload = state.activePayload[0].payload
      const fiiNet = payload.FII_net || 0
      const proNet = payload.Pro_net || 0
      const clientNet = payload.Client_net || 0

      const values = []
      if (activeDesks.FII) values.push({ label: 'FII Net', value: fiiNet, color: '#10B981' })
      if (activeDesks.Pro) values.push({ label: 'Pro Net', value: proNet, color: '#F59E0B' })
      if (activeDesks.Client) values.push({ label: 'Client Net', value: clientNet, color: '#38BDF8' })
      if (activeDesks.DII) values.push({ label: 'DII Net', value: payload.DII_net || 0, color: '#818CF8' })

      setHoveredSession({
        date: payload.date,
        values,
        bias: fiiNet > 0 ? 'BULLISH' : fiiNet < 0 ? 'BEARISH' : 'NEUTRAL',
      })
    }
  }

  const handleMouseLeave = () => {
    setHoveredSession(null)
  }

  const seriesChips = DESK_CONFIG.map((d) => ({
    key: d.key,
    label: d.label,
    color: d.color,
    active: activeDesks[d.key],
  }))

  const axisInterval = getAxisInterval(filteredData.length)

  return (
    <div className="w-full">
      <ChartHeaderHUD
        title="Participant Positioning Dynamics"
        subtitle={
          viewMode === 'net'
            ? 'Net positional bias (Long - Short contracts) per participant'
            : 'Gross cumulative open interest distribution'
        }
        tag={viewMode === 'net' ? 'NET DELTA' : 'GROSS STACKED'}
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
        viewMode={viewMode}
        viewOptions={[
          { key: 'net', label: 'Net Delta' },
          { key: 'gross', label: 'Gross Stacked' },
        ]}
        onViewModeChange={setViewMode}
        seriesChips={seriesChips}
        onToggleSeries={handleToggleSeries}
        hoveredData={hoveredSession}
      />

      <div className="h-[310px] w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'net' ? (
            <BarChart
              data={filteredData}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
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
              {activeDesks.FII && (
                <Bar
                  dataKey="FII_net"
                  fill="#10B981"
                  name="FII Net"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={28}
                />
              )}
              {activeDesks.Pro && (
                <Bar
                  dataKey="Pro_net"
                  fill="#F59E0B"
                  name="Pro Net"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={28}
                />
              )}
              {activeDesks.Client && (
                <Bar
                  dataKey="Client_net"
                  fill="#38BDF8"
                  name="Client Net"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={28}
                />
              )}
              {activeDesks.DII && (
                <Bar
                  dataKey="DII_net"
                  fill="#818CF8"
                  name="DII Net"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={28}
                />
              )}
            </BarChart>
          ) : (
            <AreaChart
              data={filteredData}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <defs>
                <linearGradient id="clientGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="fiiGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="diiGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818CF8" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#818CF8" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="proGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
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
              <Tooltip cursor={{ stroke: '#475569', strokeDasharray: '3 3' }} content={() => null} />
              {activeDesks.Client && (
                <Area
                  type="monotone"
                  dataKey="Client_long"
                  stackId="1"
                  stroke="#38BDF8"
                  strokeWidth={1.5}
                  fill="url(#clientGrad)"
                  name="Client Long"
                />
              )}
              {activeDesks.FII && (
                <Area
                  type="monotone"
                  dataKey="FII_long"
                  stackId="1"
                  stroke="#10B981"
                  strokeWidth={1.5}
                  fill="url(#fiiGrad)"
                  name="FII Long"
                />
              )}
              {activeDesks.DII && (
                <Area
                  type="monotone"
                  dataKey="DII_long"
                  stackId="1"
                  stroke="#818CF8"
                  strokeWidth={1.5}
                  fill="url(#diiGrad)"
                  name="DII Long"
                />
              )}
              {activeDesks.Pro && (
                <Area
                  type="monotone"
                  dataKey="Pro_long"
                  stackId="1"
                  stroke="#F59E0B"
                  strokeWidth={1.5}
                  fill="url(#proGrad)"
                  name="Pro Long"
                />
              )}
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default LongVsShortTrendChart