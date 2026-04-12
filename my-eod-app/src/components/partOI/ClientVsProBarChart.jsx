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

const ClientVsProBarChart = ({ chartData }) => {
  const [timeframe, setTimeframe] = useState('1M')
  const [viewMode, setViewMode] = useState('spread')
  const [hoveredSession, setHoveredSession] = useState(null)

  const processedData = useMemo(() => {
    if (!chartData) return []
    return chartData.map(item => {
      const clientLong = item.Client_long || 0
      const proLong = item.Pro_long || 0
      const clientShort = item.Client_short || 0
      const proShort = item.Pro_short || 0

      const clientNet = clientLong - clientShort
      const proNet = proLong - proShort
      const spreadDivergence = proNet - clientNet // Positive means Pro desk is more bullish than Retail

      return {
        date: item.date,
        Client_long: clientLong,
        Pro_long: proLong,
        clientNet,
        proNet,
        spreadDivergence,
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
          { label: 'Pro-Client Spread', value: payload.spreadDivergence, color: payload.spreadDivergence >= 0 ? '#10B981' : '#F43F5E' },
          { label: 'Pro Net', value: payload.proNet, color: '#F59E0B' },
          { label: 'Client Net', value: payload.clientNet, color: '#38BDF8' },
        ],
        bias: payload.spreadDivergence > 0 ? 'PRO DOMINANT' : payload.spreadDivergence < 0 ? 'RETAIL DOMINANT' : 'BALANCED',
      })
    }
  }

  return (
    <div className="w-full">
      <ChartHeaderHUD
        title="Client vs Pro Desk Divergence"
        subtitle="Institutional Pro desk positioning against retail Client flow"
        tag="SMART MONEY SPREAD"
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
        viewMode={viewMode}
        viewOptions={[
          { key: 'spread', label: 'Pro/Retail Spread' },
          { key: 'gross', label: 'Long Comparison' },
        ]}
        onViewModeChange={setViewMode}
        hoveredData={hoveredSession}
      />

      <div className="h-[280px] w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'spread' ? (
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
              <Bar dataKey="spreadDivergence" radius={[3, 3, 0, 0]} maxBarSize={28}>
                {filteredData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.spreadDivergence >= 0 ? '#10B981' : '#F43F5E'}
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
              <Tooltip cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }} content={() => null} />
              <Bar dataKey="Pro_long" fill="#F59E0B" name="Pro Long" radius={[2, 2, 0, 0]} maxBarSize={18} />
              <Bar dataKey="Client_long" fill="#38BDF8" name="Client Long" radius={[2, 2, 0, 0]} maxBarSize={18} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default ClientVsProBarChart