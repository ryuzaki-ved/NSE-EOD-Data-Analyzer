import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const ClientVsProBarChart = ({ chartData }) => (
  <div className="w-full">
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="text-base font-bold text-white tracking-tight">Client vs Pro Comparison</h3>
        <p className="text-xs text-slate-400 mt-0.5">Retail/HNI positioning against professional desks</p>
      </div>
    </div>
    
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
          <Bar dataKey="Client_long" fill="#38BDF8" name="Client Long" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Pro_long" fill="#F59E0B" name="Pro Long" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
)

export default ClientVsProBarChart