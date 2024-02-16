import React, { useState, useEffect } from 'react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import DataTable from '../components/DataTable'
import MetricCard from '../components/MetricCard'
import { Users, TrendingUp, PieChart as PieChartIcon, Activity, Eye, Target } from 'lucide-react'

const PartOIPage = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedClientType, setSelectedClientType] = useState('ALL')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/data/participant_oi.json')
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

  // Helper functions for Deep Insights
  const calculateRatio = (numerator, denominator) => {
    if (denominator === 0 || denominator === null || denominator === undefined) {
      return numerator > 0 ? 'Inf' : 'N/A'
    }
    return numerator / denominator
  }

  const getRatioClass = (ratio) => {
    if (ratio === 'N/A' || ratio === 'Inf') return 'text-gray-400'
    if (ratio > 1.5) return 'text-green-400 font-bold animate-pulse'
    if (ratio > 1) return 'text-green-400 font-semibold'
    if (ratio < 0.7) return 'text-red-400 font-bold animate-pulse'
    if (ratio < 1) return 'text-red-400 font-semibold'
    return 'text-gray-300'
  }

  const formatRatio = (ratio) => {
    if (ratio === 'N/A' || ratio === 'Inf') return ratio
    return ratio.toFixed(2)
  }

  const formatIndianNumber = (num) => {
    if (typeof num !== 'number') return num
    return num.toLocaleString('en-IN')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400"></div>
      </div>
    )
  }

  const clientTypes = ['ALL', ...new Set(data.map(item => item.client_type).filter(type => type !== 'TOTAL'))]
  const filteredData = selectedClientType === 'ALL' ? 
    data.filter(item => item.client_type !== 'TOTAL') : 
    data.filter(item => item.client_type === selectedClientType)

  // Calculate metrics
  const totalLongContracts = filteredData.reduce((sum, item) => sum + (item.total_long_contracts || 0), 0)
  const totalShortContracts = filteredData.reduce((sum, item) => sum + (item.total_short_contracts || 0), 0)
  const futureIndexLong = filteredData.reduce((sum, item) => sum + (item.future_index_long || 0), 0)
  const optionIndexLong = filteredData.reduce((sum, item) => sum + (item.option_index_call_long || 0) + (item.option_index_put_long || 0), 0)

  // Prepare chart data by date
  const chartData = data.reduce((acc, item) => {
    if (item.client_type !== 'TOTAL') {
      const existingDate = acc.find(d => d.date === item.date)
      if (existingDate) {
        existingDate[item.client_type + '_long'] = item.total_long_contracts
        existingDate[item.client_type + '_short'] = item.total_short_contracts
      } else {
        const dateEntry = { date: item.date }
        dateEntry[item.client_type + '_long'] = item.total_long_contracts
        dateEntry[item.client_type + '_short'] = item.total_short_contracts
        acc.push(dateEntry)
      }
    }
    return acc
  }, [])

  // Client type distribution for latest date
  const latestDate = data.length > 0 ? data[data.length - 1].date : ''
  const clientDistribution = data
    .filter(item => item.date === latestDate && item.client_type !== 'TOTAL')
    .map(item => ({
      name: item.client_type,
      long: item.total_long_contracts,
      short: item.total_short_contracts,
    }))

  // Prepare ratio data for Deep Insights
  const latestDateData = data.filter(item => item.date === latestDate && item.client_type !== 'TOTAL')
  const ratioData = latestDateData.map(item => {
    const callBuyPutBuy = calculateRatio(item.option_index_call_long, item.option_index_put_long)
    const callBuyCallSell = calculateRatio(item.option_index_call_long, item.option_index_call_short)
    const putSellPutBuy = calculateRatio(item.option_index_put_short, item.option_index_put_long)
    const putSellCallSell = calculateRatio(item.option_index_put_short, item.option_index_call_short)
    
    return {
      clientType: item.client_type,
      callBuyPutBuy,
      callBuyCallSell,
      putSellPutBuy,
      putSellCallSell,
      data: item
    }
  })

  // Generate insights based on ratios
  const generateInsights = () => {
    const insights = []
    
    ratioData.forEach(({ clientType, callBuyPutBuy, callBuyCallSell, putSellPutBuy, putSellCallSell }) => {
      // Call Buy/Put Buy insights (Bullish vs Bearish bias)
      if (callBuyPutBuy > 1.5) {
        insights.push(`${clientType} shows strong bullish bias with Call Buy/Put Buy ratio of ${formatRatio(callBuyPutBuy)}`)
      } else if (callBuyPutBuy < 0.7) {
        insights.push(`${clientType} shows strong bearish bias with Call Buy/Put Buy ratio of ${formatRatio(callBuyPutBuy)}`)
      }
      
      // Call Buy/Call Sell insights (Long vs Short positioning)
      if (callBuyCallSell > 1.5) {
        insights.push(`${clientType} has aggressive long call positioning with ratio ${formatRatio(callBuyCallSell)}`)
      } else if (callBuyCallSell < 0.7) {
        insights.push(`${clientType} is heavily short on calls with ratio ${formatRatio(callBuyCallSell)}`)
      }
      
      // Put Sell/Put Buy insights (Put writing vs Put buying)
      if (putSellPutBuy > 1.5) {
        insights.push(`${clientType} is aggressively writing puts (bullish) with ratio ${formatRatio(putSellPutBuy)}`)
      } else if (putSellPutBuy < 0.7) {
        insights.push(`${clientType} is heavily buying puts (bearish) with ratio ${formatRatio(putSellPutBuy)}`)
      }
      
      // Put Sell/Call Sell insights (Put vs Call writing preference)
      if (putSellCallSell > 1.2) {
        insights.push(`${clientType} prefers put writing over call writing with ratio ${formatRatio(putSellCallSell)}`)
      } else if (putSellCallSell < 0.8) {
        insights.push(`${clientType} prefers call writing over put writing with ratio ${formatRatio(putSellCallSell)}`)
      }
    })
    
    return insights.length > 0 ? insights : ['Market positioning appears balanced across all participant categories']
  }

  const COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b']

  const columns = [
    { key: 'date', label: 'Date' },
    { key: 'client_type', label: 'Client Type' },
    { key: 'future_index_long', label: 'Future Index Long' },
    { key: 'future_index_short', label: 'Future Index Short' },
    { key: 'future_stock_long', label: 'Future Stock Long' },
    { key: 'future_stock_short', label: 'Future Stock Short' },
    { key: 'total_long_contracts', label: 'Total Long' },
    { key: 'total_short_contracts', label: 'Total Short' },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h1 className="text-3xl font-bold gradient-text mb-4 sm:mb-0">Participant Open Interest</h1>
        <select
          value={selectedClientType}
          onChange={(e) => setSelectedClientType(e.target.value)}
          className="px-4 py-2 bg-dark-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          {clientTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Long Contracts"
          value={totalLongContracts}
          icon={TrendingUp}
          color="green"
        />
        <MetricCard
          title="Total Short Contracts"
          value={totalShortContracts}
          icon={TrendingUp}
          color="red"
        />
        <MetricCard
          title="Future Index Long"
          value={futureIndexLong}
          icon={Activity}
          color="primary"
        />
        <MetricCard
          title="Option Index Long"
          value={optionIndexLong}
          icon={PieChartIcon}
          color="purple"
        />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-8">
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

        <div className="glass-card p-6">
          <h3 className="text-xl font-semibold mb-4">Client Type Distribution (Latest)</h3>
          <ResponsiveContainer width="100%" height={300}>
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
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="glass-card p-6">
          <h3 className="text-xl font-semibold mb-4">FII Position Trend</h3>
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
              />
              <Line
                type="monotone"
                dataKey="FII_short"
                stroke="#ef4444"
                strokeWidth={3}
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                name="FII Short"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-xl font-semibold mb-4">Client vs Pro Comparison</h3>
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
                  color: '#e2e8f0',
                }}
              />
              <Legend />
              <Bar dataKey="Client_long" fill="#0ea5e9" name="Client Long" />
              <Bar dataKey="Pro_long" fill="#f59e0b" name="Pro Long" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Participant Comparison Charts */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="glass-card p-6">
          <h3 className="text-xl font-semibold mb-4">Future Index OI by Participant</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={clientDistribution.map(item => ({
              name: item.name,
              long: data.find(d => d.date === latestDate && d.client_type === item.name)?.future_index_long || 0,
              short: data.find(d => d.date === latestDate && d.client_type === item.name)?.future_index_short || 0,
            }))}>
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

        <div className="glass-card p-6">
          <h3 className="text-xl font-semibold mb-4">Option Index OI by Participant</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={clientDistribution.map(item => {
              const participantData = data.find(d => d.date === latestDate && d.client_type === item.name)
              return {
                name: item.name,
                call_long: (participantData?.option_index_call_long || 0),
                put_long: (participantData?.option_index_put_long || 0),
                call_short: (participantData?.option_index_call_short || 0),
                put_short: (participantData?.option_index_put_short || 0),
              }
            })}>
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
      </div>

      {/* Deep Insights Section */}
      <div className="glass-card p-8 border-2 border-primary-500/30 bg-gradient-to-br from-primary-900/10 to-purple-900/10">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 rounded-lg bg-gradient-to-r from-primary-500 to-purple-500">
            <Eye className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold gradient-text">Deep Insights</h2>
          <div className="px-3 py-1 bg-primary-500/20 rounded-full text-xs text-primary-400 border border-primary-500/30">
            PREMIUM INSIGHTS
          </div>
        </div>

        {/* Ratio Analysis Table */}
        <div className="glass-card p-6 border border-primary-500/20 mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <Target className="h-5 w-5 text-primary-400" />
            <h4 className="text-xl font-semibold">Index Options Ratio Analysis</h4>
            <div className="text-sm text-gray-400">({latestDate})</div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-300">Client Type</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-300">Call Buy / Put Buy</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-300">Call Buy / Call Sell</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-300">Put Sell / Put Buy</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-300">Put Sell / Call Sell</th>
                </tr>
              </thead>
              <tbody>
                {ratioData.map((row, index) => (
                  <tr key={index} className="border-b border-gray-800 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 font-semibold text-primary-400">{row.clientType}</td>
                    <td className={`py-3 px-4 text-center ${getRatioClass(row.callBuyPutBuy)}`}>
                      {formatRatio(row.callBuyPutBuy)}
                    </td>
                    <td className={`py-3 px-4 text-center ${getRatioClass(row.callBuyCallSell)}`}>
                      {formatRatio(row.callBuyCallSell)}
                    </td>
                    <td className={`py-3 px-4 text-center ${getRatioClass(row.putSellPutBuy)}`}>
                      {formatRatio(row.putSellPutBuy)}
                    </td>
                    <td className={`py-3 px-4 text-center ${getRatioClass(row.putSellCallSell)}`}>
                      {formatRatio(row.putSellCallSell)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 text-xs text-gray-400 space-y-1">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-2">
                <span className="w-3 h-3 bg-green-400 rounded-full"></span>
                <span>Ratio > 1 (Green)</span>
              </span>
              <span className="flex items-center space-x-2">
                <span className="w-3 h-3 bg-red-400 rounded-full"></span>
                <span>Ratio &lt; 1 (Red)</span>
              </span>
              <span className="flex items-center space-x-2">
                <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
                <span>Strong Signal > 1.5 or &lt; 0.7 (Flaming)</span>
              </span>
            </div>
          </div>
        </div>

        {/* Generated Insights */}
        <div className="glass-card p-6 border border-purple-500/20">
          <h4 className="text-xl font-semibold text-purple-400 mb-4">Market Positioning Insights</h4>
          <div className="space-y-3">
            {generateInsights().map((insight, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-300 text-sm leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={filteredData}
        columns={columns}
        title="Participant Open Interest Data"
        defaultSortKey="date"
        defaultSortDirection="desc"
      />
    </div>
  )
}

export default PartOIPage