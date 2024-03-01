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
    <div className="chart-card">
      <h3>Option Index OI by Participant</h3>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="name" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#e2e8f0',
            }}
          />
          <Legend />
          <Bar dataKey="call_long" fill="#0ea5e9" name="Call Long" />
          <Bar dataKey="put_long" fill="#8b5cf6" name="Put Long" />
          <Bar dataKey="call_short" fill="#ef4444" name="Call Short" />
          <Bar dataKey="put_short" fill="#f59e0b" name="Put Short" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default OptionIndexOIBarChart 