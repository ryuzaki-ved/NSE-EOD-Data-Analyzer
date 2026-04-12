import React, { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell
} from 'recharts'
import { formatIndianCompact, formatSignedCompact } from '../../utils/chartHelpers'

const OptionIndexOIBarChart = ({ clientDistribution, data, latestDate }) => {
  const [viewMode, setViewMode] = useState('net')
  const [hoveredItem, setHoveredItem] = useState(null)

  const chartData = clientDistribution.map(item => {
    const participantData = data.find(d => d.date === latestDate && d.client_type === item.name)
    const call_long = participantData?.option_index_call_long || 0
    const put_long = participantData?.option_index_put_long || 0
    const call_short = participantData?.option_index_call_short || 0
    const put_short = participantData?.option_index_put_short || 0

    // Synthetic Option Exposure:
    // Bullish Exposure = Call Long + Put Short
    // Bearish Exposure = Put Long + Call Short
    const optionLong = call_long + put_short
    const optionShort = put_long + call_short
    const netExposure = optionLong - optionShort

    return {
      name: item.name,
      call_long,
      put_long,
      call_short,
      put_short,
      optionLong,
      optionShort,
      netExposure,
      total: call_long + put_long + call_short + put_short,
    }
  })

  return (
    <div className="w-full">
      <div className="flex flex-col space-y-3 mb-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-white tracking-tight">Option Index OI by Participant</h3>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-semibold text-cyan-400">
                OPTIONS
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {viewMode === 'net'
                ? 'Net synthetic directional bias (Bullish vs Bearish legs)'
                : 'Individual Call/Put long & short leg breakdown'}
            </p>
          </div>

          <div className="flex items-center p-0.5 bg-[#0B0F19] border border-white/[0.08] rounded-lg">
            <button
              onClick={() => setViewMode('net')}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all ${
                viewMode === 'net'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Net Directional
            </button>
            <button
              onClick={() => setViewMode('detailed')}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all ${
                viewMode === 'detailed'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              4-Leg Split
            </button>
          </div>
        </div>

        {/* Live Monospace Micro-HUD */}
        <div className="h-7 px-3 py-1 bg-[#090D16] border border-white/[0.05] rounded-lg flex items-center justify-between text-xs font-mono">
          {hoveredItem ? (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-2">
                <span className="text-slate-400 uppercase text-[10px]">DESK:</span>
                <span className="text-white font-bold">{hoveredItem.name}</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-slate-400">Net Bias:</span>
                <span className={hoveredItem.netExposure >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {formatSignedCompact(hoveredItem.netExposure)} ({hoveredItem.netExposure >= 0 ? 'BULLISH' : 'BEARISH'})
                </span>
                <span className="text-slate-400">Call/Put Ratio:</span>
                <span className="text-cyan-300 font-semibold">
                  {(hoveredItem.call_long + hoveredItem.call_short) > 0 && (hoveredItem.put_long + hoveredItem.put_short) > 0
                    ? ((hoveredItem.call_long + hoveredItem.call_short) / (hoveredItem.put_long + hoveredItem.put_short)).toFixed(2)
                    : '1.00'}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-[11px] text-slate-400 flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              <span>Hover over desks for synthetic option bias and Call/Put balance</span>
            </div>
          )}
        </div>
      </div>

      <div className="h-[280px] w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'net' ? (
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              onMouseMove={(state) => {
                if (state && state.activePayload && state.activePayload.length > 0) {
                  setHoveredItem(state.activePayload[0].payload)
                }
              }}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                tickFormatter={(val) => formatIndianCompact(val)}
              />
              <ReferenceLine y={0} stroke="#334155" strokeWidth={1.5} />
              <Tooltip cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }} content={() => null} />
              <Bar dataKey="netExposure" radius={[4, 4, 0, 0]} maxBarSize={36}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.netExposure >= 0 ? '#10B981' : '#F43F5E'}
                  />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              onMouseMove={(state) => {
                if (state && state.activePayload && state.activePayload.length > 0) {
                  setHoveredItem(state.activePayload[0].payload)
                }
              }}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                tickFormatter={(val) => formatIndianCompact(val)}
              />
              <Tooltip cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }} content={() => null} />
              <Bar dataKey="call_long" fill="#38BDF8" name="Call Long" radius={[2, 2, 0, 0]} maxBarSize={16} />
              <Bar dataKey="put_long" fill="#818CF8" name="Put Long" radius={[2, 2, 0, 0]} maxBarSize={16} />
              <Bar dataKey="call_short" fill="#F43F5E" name="Call Short" radius={[2, 2, 0, 0]} maxBarSize={16} />
              <Bar dataKey="put_short" fill="#F59E0B" name="Put Short" radius={[2, 2, 0, 0]} maxBarSize={16} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default OptionIndexOIBarChart