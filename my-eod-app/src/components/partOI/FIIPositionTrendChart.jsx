import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const FIIPositionTrendChart = ({ chartData }) => (
  <div className="glass-card p-6 animate-fade-in-up hover-lift">
    <h3 className="text-xl font-semibold mb-4 animate-slide-in-left">FII Position Trend</h3>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="date" stroke="#9ca3af" />
        <YAxis stroke="#9ca3af" />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1f2937',
            border: '1px solid #374151',
            borderRadius: '8px',
            color: '#e2e8f0',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="FII_long"
          stroke="#10b981"
          strokeWidth={3}
          dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
          name="FII Long"
          animationDuration={1500}
          animationBegin={0}
        />
        <Line
          type="monotone"
          dataKey="FII_short"
          stroke="#ef4444"
          strokeWidth={3}
          dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
          name="FII Short"
          animationDuration={1500}
          animationBegin={300}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
)

export default FIIPositionTrendChart 