import React, { useState, useEffect } from 'react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, ComposedChart } from 'recharts'
import DataTable from '../components/DataTable'
import MetricCard from '../components/MetricCard'
import { TrendingUp, TrendingDown, DollarSign, Activity, BarChart3, Eye, Target } from 'lucide-react'

const FIIDerivStatsPage = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedInstrument, setSelectedInstrument] = useState('ALL')
  const [selectedPieInstruments, setSelectedPieInstruments] = useState([
    'BANKNIFTY FUTURES', 'NIFTY FUTURES', 'FINNIFTY FUTURES', 'MIDCPNIFTY FUTURES', 'NIFTYNXT50 FUTURES',
    'BANKNIFTY OPTIONS', 'NIFTY OPTIONS', 'FINNIFTY OPTIONS', 'MIDCPNIFTY OPTIONS', 'NIFTYNXT50 OPTIONS'
  ])

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

  // Helper function to round to nearest 50
  const roundToFifty = (value) => Math.round(value / 50) * 50

  // Get most recent date data for Deep Data section
  const latestDate = data.length > 0 ? data.reduce((latest, item) => {
    const itemDate = new Date(item.date.split('-').reverse().join('-'))
    const latestDateObj = new Date(latest.split('-').reverse().join('-'))
    return itemDate > latestDateObj ? item.date : latest
  }, data[0].date) : ''

  const latestIndexOptionsData = data.find(item => 
    item.date === latestDate && item.instrument === 'INDEX OPTIONS'
  )

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
  const allInstruments = [...new Set(data.map(item => item.instrument))]
  const availableInstruments = allInstruments.filter(inst => 
    !['INDEX FUTURES', 'INDEX OPTIONS', 'STOCK FUTURES', 'STOCK OPTIONS'].includes(inst)
  )

  const instrumentData = data.reduce((acc, item) => {
    if (selectedPieInstruments.includes(item.instrument)) {
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

  // Futures and Options OI distribution data for Deep Data section
  const latestDateData = data.filter(item => item.date === latestDate)
  
  const futuresOIData = latestDateData
    .filter(item => item.instrument.includes('FUTURES') && !item.instrument.includes('STOCK') && item.instrument !== 'INDEX FUTURES')
    .map(item => ({
      name: item.instrument.replace(' FUTURES', ''),
      value: item.oi_amt_adj || 0
    }))

  const optionsOIData = latestDateData
    .filter(item => item.instrument.includes('OPTIONS') && !item.instrument.includes('STOCK') && item.instrument !== 'INDEX OPTIONS')
    .map(item => ({
      name: item.instrument.replace(' OPTIONS', ''),
      value: item.oi_amt_adj || 0
    }))

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
          <div className="mb-4">
            <label className="block text-sm font-medium mb-3">Select Instruments:</label>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 bg-dark-800/50 rounded-lg border border-gray-700">
              {availableInstruments.map(instrument => (
                <button
                  key={instrument}
                  onClick={() => {
                    if (selectedPieInstruments.includes(instrument)) {
                      setSelectedPieInstruments(prev => prev.filter(inst => inst !== instrument))
                    } else {
                      setSelectedPieInstruments(prev => [...prev, instrument])
                    }
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 border ${
                    selectedPieInstruments.includes(instrument)
                      ? 'bg-primary-600 text-white border-primary-500 shadow-lg shadow-primary-500/25 scale-105'
                      : 'bg-dark-700 text-gray-300 border-gray-600 hover:bg-dark-600 hover:border-gray-500 hover:text-white'
                  }`}
                >
                  {instrument.replace(' FUTURES', '').replace(' OPTIONS', '')}
                </button>
              ))}
            </div>
          </div>
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

      {/* Deep Data Section */}
      <div className="glass-card p-8 border-2 border-primary-500/30 bg-gradient-to-br from-primary-900/10 to-purple-900/10">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 rounded-lg bg-gradient-to-r from-primary-500 to-purple-500">
            <Eye className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold gradient-text">Deep Data</h2>
          <div className="px-3 py-1 bg-primary-500/20 rounded-full text-xs text-primary-400 border border-primary-500/30">
            PREMIUM INSIGHTS
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Futures OI Distribution */}
          <div className="glass-card p-4">
            <h4 className="text-lg font-semibold mb-3 text-center">Index Futures OI Distribution</h4>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={futuresOIData}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {futuresOIData.map((entry, index) => (
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

          {/* Options OI Distribution */}
          <div className="glass-card p-4">
            <h4 className="text-lg font-semibold mb-3 text-center">Index Options OI Distribution</h4>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={optionsOIData}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {optionsOIData.map((entry, index) => (
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

          {/* Deep Insights Text */}
          <div className="space-y-4">
            <div className="glass-card p-4 border border-primary-500/20">
              <div className="flex items-center space-x-2 mb-3">
                <Target className="h-5 w-5 text-primary-400" />
                <h4 className="text-lg font-semibold">Strike Activity Analysis</h4>
              </div>
              {latestIndexOptionsData ? (
                <div className="space-y-3 text-sm">
                  <p className="text-gray-300">
                    <span className="text-primary-400 font-medium">Latest Data:</span> {latestDate}
                  </p>
                  <p className="text-gray-300">
                    FII have Options activity near{' '}
                    <span className="text-green-400 font-bold">
                      {latestIndexOptionsData.buy_str_act?.toFixed(0) || 0}
                    </span>{' '}
                    for buying and{' '}
                    <span className="text-red-400 font-bold">
                      {latestIndexOptionsData.sell_str_act?.toFixed(0) || 0}
                    </span>{' '}
                    for selling.
                  </p>
                  <div className="border-t border-gray-700 pt-3">
                    <p className="text-gray-300">
                      The strikes traded around for buy{' '}
                      <span className="text-green-400 font-bold">
                        {roundToFifty(latestIndexOptionsData.buy_str_act || 0)}
                      </span>
                      , and sell{' '}
                      <span className="text-red-400 font-bold">
                        {roundToFifty(latestIndexOptionsData.sell_str_act || 0)}
                      </span>
                      .
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No recent INDEX OPTIONS data available</p>
              )}
            </div>

            <div className="glass-card p-4 border border-purple-500/20">
              <h4 className="text-sm font-semibold text-purple-400 mb-2">Market Sentiment</h4>
              <div className="space-y-2 text-xs text-gray-400">
                <div className="flex justify-between">
                  <span>Futures OI:</span>
                  <span className="text-primary-400">
                    ₹{(futuresOIData.reduce((sum, item) => sum + item.value, 0) / 1e7).toFixed(1)}Cr
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Options OI:</span>
                  <span className="text-purple-400">
                    ₹{(optionsOIData.reduce((sum, item) => sum + item.value, 0) / 1e7).toFixed(1)}Cr
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={filteredData}
        columns={columns}
        title="FII Derivatives Data"
        defaultSortKey="date"
        defaultSortDirection="desc"
      />
    </div>
  )
}

export default FIIDerivStatsPage