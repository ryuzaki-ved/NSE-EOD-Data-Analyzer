import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const OptionIndexOIBarChart = ({ clientDistribution, data, latestDate }) => {
  const chartData = clientDistribution.map(item => {
    const participantData = data.find(d => d.date === latestDate && d.client_type === item.name)
    return {
      name: item.name,
      call_long: (participantData?.option_index_call_long || 0),
      put_long: (participantData?.option_index_put_long || 0),
      call_short: (participantData?.option_index_call_short || 0),
      put_short: (participantData?.option_index_put_short || 0),
    }
  })

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">Option Index OI by Participant</h3>
          <p className="text-xs text-slate-400 mt-0.5">Call/Put long and short breakdown</p>
        </div>
        <div className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-semibold text-cyan-400">
          OPTIONS
        </div>
      </div>
      
      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
            <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
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
            <Bar dataKey="call_long" fill="#38BDF8" name="Call Long" radius={[3, 3, 0, 0]} />
            <Bar dataKey="put_long" fill="#818CF8" name="Put Long" radius={[3, 3, 0, 0]} />
            <Bar dataKey="call_short" fill="#F43F5E" name="Call Short" radius={[3, 3, 0, 0]} />
            <Bar dataKey="put_short" fill="#F59E0B" name="Put Short" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default OptionIndexOIBarChart