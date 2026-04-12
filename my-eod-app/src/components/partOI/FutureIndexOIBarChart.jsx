import React, { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell
} from 'recharts'
import { formatIndianCompact, formatSignedCompact } from '../../utils/chartHelpers'

const FutureIndexOIBarChart = ({ clientDistribution, data, latestDate }) => {
  const [viewMode, setViewMode] = useState('net')
  const [hoveredItem, setHoveredItem] = useState(null)

  const chartData = clientDistribution.map(item => {
    const participantData = data.find(d => d.date === latestDate && d.client_type === item.name)
    const long = participantData?.future_index_long || 0
    const short = participantData?.future_index_short || 0
    const net = long - short
    return {
      name: item.name,
      long,
      short,
      net,
      total: long + short,
    }
  })

  const totalOpenInterest = chartData.reduce((sum, d) => sum + d.total, 0)

  return (
    <div className="w-full">
      <div className="flex flex-col space-y-3 mb-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-white tracking-tight">Future Index OI by Participant</h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-semibold text-emerald-400">
                FUTURES
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {viewMode === 'net' ? 'Net directional open contracts per desk' : 'Long vs Short gross positioning'}
            </p>
          </div>

          <div className="flex items-center p-0.5 bg-[#0B0F19] border border-white/[0.08] rounded-lg">
            <button
              onClick={() => setViewMode('net')}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all ${
                viewMode === 'net'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Net Bias
            </button>
            <button
              onClick={() => setViewMode('gross')}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all ${
                viewMode === 'gross'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Gross Split
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
                <span className="text-slate-400">Net:</span>
                <span className={hoveredItem.net >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {formatSignedCompact(hoveredItem.net)}
                </span>
                <span className="text-slate-400">Share:</span>
                <span className="text-slate-200 font-semibold">
                  {totalOpenInterest > 0 ? `${((hoveredItem.total / totalOpenInterest) * 100).toFixed(1)}%` : '0%'}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-[11px] text-slate-400 flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Hover over desks for net bias and market share metrics</span>
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
              <Bar dataKey="net" radius={[4, 4, 0, 0]} maxBarSize={36}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.net >= 0 ? '#10B981' : '#F43F5E'}
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
              <Bar dataKey="long" fill="#10B981" name="Long" radius={[3, 3, 0, 0]} maxBarSize={24} />
              <Bar dataKey="short" fill="#F43F5E" name="Short" radius={[3, 3, 0, 0]} maxBarSize={24} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default FutureIndexOIBarChart