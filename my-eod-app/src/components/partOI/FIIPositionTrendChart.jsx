import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const FIIPositionTrendChart = ({ chartData }) => (
  <div className="w-full">
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="text-base font-bold text-white tracking-tight">FII Position Trend</h3>
        <p className="text-xs text-slate-400 mt-0.5">Historical FII long vs short positioning</p>
      </div>
      <div className="px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-[10px] font-semibold text-rose-400">
        FII DESK
      </div>
    </div>
    
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
          <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
          <YAxis stroke="#64748B" fontSize={11} tickLine={false} tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(11, 15, 25, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              color: '#e2e8f0',
              backdropFilter: 'blur(12px)',
            }}
            itemStyle={{ color: '#e2e8f0', fontSize: 12 }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '12px' }}
            formatter={(value) => <span className="text-xs text-slate-300 font-medium">{value}</span>}
          />
          <Line
            type="monotone"
            dataKey="FII_long"
            stroke="#10B981"
            strokeWidth={2.5}
            dot={{ fill: '#10B981', strokeWidth: 0, r: 3 }}
            activeDot={{ r: 5, stroke: '#10B981', strokeWidth: 2, fill: '#0B0F19' }}
            name="FII Long"
          />
          <Line
            type="monotone"
            dataKey="FII_short"
            stroke="#F43F5E"
            strokeWidth={2.5}
            dot={{ fill: '#F43F5E', strokeWidth: 0, r: 3 }}
            activeDot={{ r: 5, stroke: '#F43F5E', strokeWidth: 2, fill: '#0B0F19' }}
            name="FII Short"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
)

export default FIIPositionTrendChart