import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const FutureIndexOIBarChart = ({ clientDistribution, data, latestDate }) => {
  const chartData = clientDistribution.map(item => ({
    name: item.name,
    long: data.find(d => d.date === latestDate && d.client_type === item.name)?.future_index_long || 0,
    short: data.find(d => d.date === latestDate && d.client_type === item.name)?.future_index_short || 0,
  }))

  return (
    <div className="glass-card p-6">
      <h3 className="text-xl font-semibold mb-4">Future Index OI by Participant</h3>
      <ResponsiveContainer width="100%" height={300}>
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
          <Bar dataKey="long" fill="#10b981" name="Long Positions" />
          <Bar dataKey="short" fill="#ef4444" name="Short Positions" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default FutureIndexOIBarChart 