import React, { useState, useMemo } from 'react'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell
} from 'recharts'
import ChartHeaderHUD from '../charts/ChartHeaderHUD'
import {
  filterByTimeframe, formatAxisDate, formatSignedCompact,
  formatIndianCompact, getAxisInterval
} from '../../utils/chartHelpers'

const FIIPositionTrendChart = ({ chartData }) => {
  const [timeframe, setTimeframe] = useState('1M')
  const [viewMode, setViewMode] = useState('net')
  const [hoveredSession, setHoveredSession] = useState(null)

  const processedData = useMemo(() => {
    if (!chartData) return []
    return chartData.map(item => {
      const fiiLong = item.FII_long || 0
      const fiiShort = item.FII_short || 0
      const fiiNet = fiiLong - fiiShort
      return {
        date: item.date,
        FII_long: fiiLong,
        FII_short: fiiShort,
        fiiNet,
      }
    })
  }, [chartData])

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
          { label: 'FII Net', value: payload.fiiNet, color: payload.fiiNet >= 0 ? '#10B981' : '#F43F5E' },
          { label: 'Long', value: payload.FII_long, color: '#38BDF8' },
          { label: 'Short', value: payload.FII_short, color: '#F59E0B' },
        ],
        bias: payload.fiiNet > 0 ? 'FII BULLISH' : payload.fiiNet < 0 ? 'FII BEARISH' : 'NEUTRAL',
      })
    }
  }

  return (
    <div className="w-full">
      <ChartHeaderHUD
        title="FII Directional Positioning Trend"
        subtitle="Institutional FII long vs short contracts and net delta"
        tag="FII DESK"
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
        viewMode={viewMode}
        viewOptions={[
          { key: 'net', label: 'Net Delta' },
          { key: 'curves', label: 'Long vs Short' },
        ]}
        onViewModeChange={setViewMode}
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
              <Bar dataKey="fiiNet" radius={[3, 3, 0, 0]} maxBarSize={28}>
                {filteredData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.fiiNet >= 0 ? '#10B981' : '#F43F5E'}
                  />
                ))}
              </Bar>
            </BarChart>
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
                dataKey="FII_long"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ fill: '#10B981', strokeWidth: 0, r: 2.5 }}
                activeDot={{ r: 4.5, stroke: '#10B981', strokeWidth: 2, fill: '#0B0F19' }}
                name="FII Long"
              />
              <Line
                type="monotone"
                dataKey="FII_short"
                stroke="#F43F5E"
                strokeWidth={2}
                dot={{ fill: '#F43F5E', strokeWidth: 0, r: 2.5 }}
                activeDot={{ r: 4.5, stroke: '#F43F5E', strokeWidth: 2, fill: '#0B0F19' }}
                name="FII Short"
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default FIIPositionTrendChart