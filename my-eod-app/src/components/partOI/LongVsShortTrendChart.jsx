import React from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import SortedCustomTooltip from '../SortedCustomTooltip'

const LongVsShortTrendChart = ({ chartData }) => (
  <div className="w-full">
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="text-base font-bold text-white tracking-tight">Long vs Short Positions Trend</h3>
        <p className="text-xs text-slate-400 mt-0.5">Historical stacked open interest accumulation</p>
      </div>
      <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-semibold text-emerald-400">
        TIME SERIES
      </div>
    </div>
    
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="clientGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.0}/>
            </linearGradient>
            <linearGradient id="fiiGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
            </linearGradient>
            <linearGradient id="diiGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#818CF8" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#818CF8" stopOpacity={0.0}/>
            </linearGradient>
            <linearGradient id="proGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
          <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
          <YAxis stroke="#64748B" fontSize={11} tickLine={false} tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} />
          <Tooltip content={<SortedCustomTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: '12px' }}
            formatter={(value) => <span className="text-xs text-slate-300 font-medium">{value}</span>}
          />
          <Area
            type="monotone"
            dataKey="Client_long"
            stackId="1"
            stroke="#38BDF8"
            strokeWidth={2}
            fill="url(#clientGrad)"
            name="Client Long"
          />
          <Area
            type="monotone"
            dataKey="FII_long"
            stackId="1"
            stroke="#10B981"
            strokeWidth={2}
            fill="url(#fiiGrad)"
            name="FII Long"
          />
          <Area
            type="monotone"
            dataKey="DII_long"
            stackId="1"
            stroke="#818CF8"
            strokeWidth={2}
            fill="url(#diiGrad)"
            name="DII Long"
          />
          <Area
            type="monotone"
            dataKey="Pro_long"
            stackId="1"
            stroke="#F59E0B"
            strokeWidth={2}
            fill="url(#proGrad)"
            name="Pro Long"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
)

export default LongVsShortTrendChart