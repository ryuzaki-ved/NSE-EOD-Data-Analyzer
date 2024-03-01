import React from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const ClientTypeDistributionPie = ({ clientDistribution, COLORS }) => (
  <div className="chart-card">
    <h3>Client Type Distribution (Latest)</h3>
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie
          data={clientDistribution}
          cx="50%"
          cy="50%"
          outerRadius={80}
          fill="#8884d8"
          dataKey="long"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {clientDistribution.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: '#1f2937',
            border: '1px solid #374151',
            borderRadius: '8px',
            color: '#e2e8f0',
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  </div>
)

export default ClientTypeDistributionPie 