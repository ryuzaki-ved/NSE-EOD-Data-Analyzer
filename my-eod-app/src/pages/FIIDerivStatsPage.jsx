import React, { useState, useEffect } from 'react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import DataTable from '../components/DataTable'
import MetricCard from '../components/MetricCard'
import { TrendingUp, TrendingDown, DollarSign, Activity, BarChart3 } from 'lucide-react'

const FIIDerivStatsPage = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedInstrument, setSelectedInstrument] = useState('ALL')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/data/fii_derivatives.json')
        const jsonData = await response.json()
        setData(jsonData)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400"></div>
      </div>
    )
  }

  const instruments = ['ALL', ...new Set(data.map(item => item.instrument))]
  const filteredData = selectedInstrument === 'ALL' ? data : data.filter(item => item.instrument === selectedInstrument)

  // Calculate metrics
  const totalBuyAmt = filteredData.reduce((sum, item) => sum + (item.buy_amt_adj || 0), 0)
  const totalSellAmt = filteredData.reduce((sum, item) => sum + (item.sell_amt_adj || 0), 0)
  const totalOI = filteredData.reduce((sum, item) => sum + (item.oi_amt_adj || 0), 0)
  const netFlow = totalBuyAmt - totalSellAmt

  // Prepare chart data
  const chartData = data.reduce((acc, item) => {
    const existingDate = acc.find(d => d.date === item.date)
    if (existingDate) {
      existingDate.buy_amt += item.buy_amt_adj || 0
      existingDate.sell_amt += item.sell_amt_adj || 0
      existingDate.oi_amt += item.oi_amt_adj || 0
    } else {
      acc.push({
        date: item.date,
        buy_amt: item.buy_amt_adj || 0,
        sell_amt: item.sell_amt_adj || 0,
        oi_amt: item.oi_amt_adj || 0,
      })
    }
    return acc
  }, [])

  // Instrument-wise data for pie chart
  const instrumentData = data.reduce((acc, item) => {
    if (item.instrument !== 'INDEX FUTURES' && item.instrument !== 'INDEX OPTIONS') {
      const existing = acc.find(d => d.name === item.instrument)
      if (existing) {
        existing.value += item.oi_amt_adj || 0
      } else {
        acc.push({
          name: item.instrument,
          value: item.oi_amt_adj || 0,
        })
      }
    }
    return acc
  }, [])

  const COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16', '#f97316']

  const columns = [
    { key: 'date', label: 'Date' },
    { key: 'instrument', label: 'Instrument' },
    { key: 'buy_contracts_adj', label: 'Buy Contracts' },
    { key: 'buy_amt_adj', label: 'Buy Amount' },
    { key: 'sell_contracts_adj', label: 'Sell Contracts' },
    { key: 'sell_amt_adj', label: 'Sell Amount' },
    { key: 'oi_contracts_adj', label: 'OI Contracts' },
    { key: 'oi_amt_adj', label: 'OI Amount' },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h1 className="text-3xl font-bold gradient-text mb-4 sm:mb-0">FII Derivatives Statistics</h1>
        <select
          value={selectedInstrument}
          onChange={(e) => setSelectedInstrument(e.target.value)}
          className="px-4 py-2 bg-dark-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          {instruments.map(instrument => (
            <option key={instrument} value={instrument}>{instrument}</option>
          ))}
        </select>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Buy Amount"
          value={totalBuyAmt}
          icon={TrendingUp}
          color="green"
        />
        <MetricCard
          title="Total Sell Amount"
          value={totalSellAmt}
          icon={TrendingDown}
          color="red"
        />
        <MetricCard
          title="Net Flow"
          value={netFlow}
          icon={DollarSign}
          color={netFlow >= 0 ? 'green' : 'red'}
        />
        <MetricCard
          title="Open Interest"
          value={totalOI}
          icon={Activity}
          color="primary"
        />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="glass-card p-6">
          <h3 className="text-xl font-semibold mb-4">Daily Buy vs Sell Trend</h3>
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
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="buy_amt"
                stackId="1"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.6}
                name="Buy Amount"
              />
              <Area
                type="monotone"
                dataKey="sell_amt"
                stackId="2"
                stroke="#ef4444"
                fill="#ef4444"
                fillOpacity={0.6}
                name="Sell Amount"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-xl font-semibold mb-4">Open Interest Trend</h3>
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
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="oi_amt"
                stroke="#0ea5e9"
                strokeWidth={3}
                dot={{ fill: '#0ea5e9', strokeWidth: 2, r: 4 }}
                name="Open Interest"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="glass-card p-6">
            <h3 className="text-xl font-semibold mb-4">Daily Net Flow</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                />
                <Bar
                  dataKey="buy_amt"
                  fill="#10b981"
                  name="Buy Amount"
                />
                <Bar
                  dataKey="sell_amt"
                  fill="#ef4444"
                  name="Sell Amount"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-xl font-semibold mb-4">Instrument Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={instrumentData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {instrumentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={filteredData}
        columns={columns}
        title="FII Derivatives Data"
      />
    </div>
  )
}

export default FIIDerivStatsPage