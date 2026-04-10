import React from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const PARTICIPANT_PALETTE = {
  Client: '#38BDF8', // Cyan
  FII: '#10B981',    // Emerald
  DII: '#818CF8',    // Indigo
  Pro: '#F59E0B',    // Amber
}

const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0]
    return (
      <div className="bg-[#0B0F19]/95 border border-white/10 rounded-xl p-3 shadow-2xl backdrop-blur-xl">
        <div className="text-xs font-semibold text-slate-400 mb-1">{data.name}</div>
        <div className="text-sm font-bold font-mono text-white">
          {Number(data.value).toLocaleString('en-IN')} <span className="text-xs text-slate-400 font-normal">Contracts</span>
        </div>
      </div>
    )
  }
  return null
}

const ClientTypeDistributionPie = ({ clientDistribution, COLORS }) => (
  <div className="w-full">
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="text-base font-bold text-white tracking-tight">Participant Open Interest Distribution</h3>
        <p className="text-xs text-slate-400 mt-0.5">Latest session market share breakdown</p>
      </div>
      <div className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-semibold text-cyan-400">
        CURRENT SESSION
      </div>
    </div>
    
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={clientDistribution}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={95}
            paddingAngle={4}
            dataKey="long"
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
            labelLine={{ stroke: '#475569', strokeWidth: 1 }}
          >
            {clientDistribution.map((entry, index) => {
              const color = PARTICIPANT_PALETTE[entry.name] || COLORS[index % COLORS.length]
              return <Cell key={`cell-${index}`} fill={color} stroke="#0B0F19" strokeWidth={2} />
            })}
          </Pie>
          <Tooltip content={<CustomPieTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
    
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/5">
      {clientDistribution.map((item, idx) => {
        const color = PARTICIPANT_PALETTE[item.name] || COLORS[idx % COLORS.length]
        return (
          <div key={item.name} className="flex items-center space-x-2 bg-slate-900/40 p-2 rounded-lg border border-white/[0.04]">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-semibold text-slate-300 truncate">{item.name}</div>
              <div className="text-[10px] font-mono text-slate-400">{(item.long || 0).toLocaleString('en-IN')}</div>
            </div>
          </div>
        )
      })}
    </div>
  </div>
)

export default ClientTypeDistributionPie