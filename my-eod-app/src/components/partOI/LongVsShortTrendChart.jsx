import React from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const LongVsShortTrendChart = ({ chartData }) => (
  <div className="glass-card p-6">
    <h3 className="text-xl font-semibold mb-4">Long vs Short Positions Trend</h3>
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="date" stroke="#9ca3af" />
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
        <Area
          type="monotone"
          dataKey="Client_long"
          stackId="1"
          stroke="#0ea5e9"
          fill="#0ea5e9"
          fillOpacity={0.6}
          name="Client Long"
        />
        <Area
          type="monotone"
          dataKey="FII_long"
          stackId="1"
          stroke="#10b981"
          fill="#10b981"
          fillOpacity={0.6}
          name="FII Long"
        />
        <Area
          type="monotone"
          dataKey="DII_long"
          stackId="1"
          stroke="#8b5cf6"
          fill="#8b5cf6"
          fillOpacity={0.6}
          name="DII Long"
        />
        <Area
          type="monotone"
          dataKey="Pro_long"
          stackId="1"
          stroke="#f59e0b"
          fill="#f59e0b"
          fillOpacity={0.6}
          name="Pro Long"
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
)

export default LongVsShortTrendChart 