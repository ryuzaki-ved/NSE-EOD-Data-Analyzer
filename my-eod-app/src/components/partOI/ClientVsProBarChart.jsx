import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const ClientVsProBarChart = ({ chartData }) => (
  <div className="chart-card">
    <h3>Client vs Pro Comparison</h3>
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chartData}>
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
        <Bar dataKey="Client_long" fill="#0ea5e9" name="Client Long" />
        <Bar dataKey="Pro_long" fill="#f59e0b" name="Pro Long" />
      </BarChart>
    </ResponsiveContainer>
  </div>
)

export default ClientVsProBarChart