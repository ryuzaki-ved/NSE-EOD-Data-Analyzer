import React, { useState, useEffect } from 'react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import DataTable from '../components/DataTable'
import MetricCard from '../components/MetricCard'
import { Activity, TrendingUp, BarChart3, Users, Eye } from 'lucide-react'
import DeepInsightsPartVol from '../components/DeepInsightsPartVol'

const PartVolPage = () => {
  const [data, setData] = useState([])
  const [oiData, setOiData] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedClientType, setSelectedClientType] = useState('ALL')
  const [deepInsightsData, setDeepInsightsData] = useState([])
  const [insightsLatestDate, setInsightsLatestDate] = useState('')
  const [insightsPreviousDate, setInsightsPreviousDate] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [volResponse, oiResponse] = await Promise.all([
          fetch('/data/participant_vol.json'),
          fetch('/data/participant_oi.json')
        ])
        const volData = await volResponse.json()
        const oiJsonData = await oiResponse.json()
        setData(volData)
        setOiData(oiJsonData)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Process deep insights data when both datasets are loaded
  useEffect(() => {
    if (data.length > 0 && oiData.length > 0) {
      // Get sorted dates from combined data
      const allDates = [...new Set([...data.map(item => item.date), ...oiData.map(item => item.date)])]
        .sort((a, b) => {
          const dateA = new Date(a.split('-').reverse().join('-'))
          const dateB = new Date(b.split('-').reverse().join('-'))
          return dateB - dateA
        })
      
      const latestDate = allDates[0]
      const previousDate = allDates[1]
      
      setInsightsLatestDate(latestDate)
      setInsightsPreviousDate(previousDate)
      
      // Process data for each client type
      const clientTypes = ['Client', 'DII', 'FII', 'Pro']
      const processedData = []
      
      clientTypes.forEach(clientType => {
        // Get volume data for latest and previous dates
        const latestVolData = data.find(item => item.date === latestDate && item.client_type === clientType)
        const previousVolData = data.find(item => item.date === previousDate && item.client_type === clientType)
        
        // Get OI data for latest and previous dates
        const latestOiData = oiData.find(item => item.date === latestDate && item.client_type === clientType)
        const previousOiData = oiData.find(item => item.date === previousDate && item.client_type === clientType)
        
        if (latestVolData && previousVolData && latestOiData && previousOiData) {
          // Calculate volume daily changes
          const callLongVolDiff = (latestVolData.option_index_call_long || 0) - (previousVolData.option_index_call_long || 0)
          const putLongVolDiff = (latestVolData.option_index_put_long || 0) - (previousVolData.option_index_put_long || 0)
          const callShortVolDiff = (latestVolData.option_index_call_short || 0) - (previousVolData.option_index_call_short || 0)
          const putShortVolDiff = (latestVolData.option_index_put_short || 0) - (previousVolData.option_index_put_short || 0)
          
          // Calculate OI daily changes
          const callLongOiDiff = (latestOiData.option_index_call_long || 0) - (previousOiData.option_index_call_long || 0)
          const putLongOiDiff = (latestOiData.option_index_put_long || 0) - (previousOiData.option_index_put_long || 0)
          const callShortOiDiff = (latestOiData.option_index_call_short || 0) - (previousOiData.option_index_call_short || 0)
          const putShortOiDiff = (latestOiData.option_index_put_short || 0) - (previousOiData.option_index_put_short || 0)
          
          // Initialize with latest day's volume (not differences)
          let adjustedCallLongVol = latestVolData.option_index_call_long || 0
          let adjustedPutLongVol = latestVolData.option_index_put_long || 0
          let adjustedCallShortVol = latestVolData.option_index_call_short || 0
          let adjustedPutShortVol = latestVolData.option_index_put_short || 0
          
          // Apply conditional adjustments based on OI differences
          // Call Long OI
          if (callLongOiDiff >= 0) {
            adjustedCallLongVol += callLongOiDiff
          } else {
            adjustedCallShortVol += Math.abs(callLongOiDiff)
          }
          
          // Put Long OI
          if (putLongOiDiff >= 0) {
            adjustedPutLongVol += putLongOiDiff
          } else {
            adjustedPutShortVol += Math.abs(putLongOiDiff)
          }
          
          // Call Short OI
          if (callShortOiDiff >= 0) {
            adjustedCallShortVol += callShortOiDiff
          } else {
            adjustedCallLongVol += Math.abs(callShortOiDiff)
          }
          
          // Put Short OI
          if (putShortOiDiff >= 0) {
            adjustedPutShortVol += putShortOiDiff
          } else {
            adjustedPutLongVol += Math.abs(putShortOiDiff)
          }
          
          processedData.push({
            clientType,
            callLong: adjustedCallLongVol,
            putLong: adjustedPutLongVol,
            callShort: adjustedCallShortVol,
            putShort: adjustedPutShortVol,
            originalCallLongVol: latestVolData.option_index_call_long || 0,
            originalPutLongVol: latestVolData.option_index_put_long || 0,
            originalCallShortVol: latestVolData.option_index_call_short || 0,
            originalPutShortVol: latestVolData.option_index_put_short || 0,
            callLongOiDiff,
            putLongOiDiff,
            callShortOiDiff,
            putShortOiDiff
          })
        }
      })
      
      setDeepInsightsData(processedData)
    }
  }, [data, oiData])

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
  const totalLongVolume = filteredData.reduce((sum, item) => sum + (item.total_long_contracts || 0), 0)
  const totalShortVolume = filteredData.reduce((sum, item) => sum + (item.total_short_contracts || 0), 0)
  const futureIndexVolume = filteredData.reduce((sum, item) => sum + (item.future_index_long || 0) + (item.future_index_short || 0), 0)
  const optionIndexVolume = filteredData.reduce((sum, item) => sum + (item.option_index_call_long || 0) + (item.option_index_put_long || 0), 0)

  // Prepare chart data by date
  const chartData = data.reduce((acc, item) => {
    if (item.client_type !== 'TOTAL') {
      const existingDate = acc.find(d => d.date === item.date)
      if (existingDate) {
        existingDate[item.client_type + '_long'] = item.total_long_contracts
        existingDate[item.client_type + '_short'] = item.total_short_contracts
        existingDate[item.client_type + '_total'] = item.total_long_contracts + item.total_short_contracts
      } else {
        const dateEntry = { date: item.date }
        dateEntry[item.client_type + '_long'] = item.total_long_contracts
        dateEntry[item.client_type + '_short'] = item.total_short_contracts
        dateEntry[item.client_type + '_total'] = item.total_long_contracts + item.total_short_contracts
        acc.push(dateEntry)
      }
    }
    return acc
  }, [])

  // Client type volume distribution for latest date
  const latestDate = data.length > 0 ? data[data.length - 1].date : ''
  const volumeDistribution = data
    .filter(item => item.date === latestDate && item.client_type !== 'TOTAL')
    .map(item => ({
      name: item.client_type,
      volume: item.total_long_contracts + item.total_short_contracts,
    }))

  // Daily total volume trend
  const dailyVolumeData = data.reduce((acc, item) => {
    if (item.client_type === 'TOTAL') {
      acc.push({
        date: item.date,
        total_volume: item.total_long_contracts + item.total_short_contracts,
        future_volume: item.future_index_long + item.future_index_short + item.future_stock_long + item.future_stock_short,
        option_volume: item.option_index_call_long + item.option_index_put_long + item.option_stock_call_long + item.option_stock_put_long,
      })
    }
    return acc
  }, [])

  const COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b']

  const columns = [
    { key: 'date', label: 'Date' },
    { key: 'client_type', label: 'Client Type' },
    { key: 'future_index_long', label: 'Future Index Long' },
    { key: 'future_index_short', label: 'Future Index Short' },
    { key: 'option_index_call_long', label: 'Option Call Long' },
    { key: 'option_index_put_long', label: 'Option Put Long' },
    { key: 'total_long_contracts', label: 'Total Long' },
    { key: 'total_short_contracts', label: 'Total Short' },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h1 className="text-3xl font-bold gradient-text mb-4 sm:mb-0">Participant Trading Volume</h1>
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
          title="Total Long Volume"
          value={totalLongVolume}
          icon={TrendingUp}
          color="green"
        />
        <MetricCard
          title="Total Short Volume"
          value={totalShortVolume}
          icon={Activity}
          color="red"
        />
        <MetricCard
          title="Future Index Volume"
          value={futureIndexVolume}
          icon={BarChart3}
          color="primary"
        />
        <MetricCard
          title="Option Index Volume"
          value={optionIndexVolume}
          icon={Users}
          color="purple"
        />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-xl font-semibold mb-4">Daily Total Volume Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dailyVolumeData}>
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
                dataKey="future_volume"
                stackId="1"
                stroke="#0ea5e9"
                fill="#0ea5e9"
                fillOpacity={0.6}
                name="Future Volume"
              />
              <Area
                type="monotone"
                dataKey="option_volume"
                stackId="1"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.6}
                name="Option Volume"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-xl font-semibold mb-4">Client Type Volume Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={volumeDistribution}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="volume"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {volumeDistribution.map((entry, index) => (
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

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-xl font-semibold mb-4">Client Type Volume Comparison</h3>
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
              <Bar dataKey="Client_total" fill="#0ea5e9" name="Client" />
              <Bar dataKey="FII_total" fill="#10b981" name="FII" />
              <Bar dataKey="DII_total" fill="#8b5cf6" name="DII" />
              <Bar dataKey="Pro_total" fill="#f59e0b" name="Pro" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-xl font-semibold mb-4">FII Volume Trend</h3>
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
                name="FII Long Volume"
              />
              <Line
                type="monotone"
                dataKey="FII_short"
                stroke="#ef4444"
                strokeWidth={3}
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                name="FII Short Volume"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Deep Insights Section */}
      <DeepInsightsPartVol
        data={deepInsightsData}
        latestDate={insightsLatestDate}
        previousDate={insightsPreviousDate}
      />

      {/* Data Table */}
      <DataTable
        data={filteredData}
        columns={columns}
        title="Participant Trading Volume Data"
        defaultSortKey="date"
        defaultSortDirection="desc"
      />
    </div>
  )
}

export default PartVolPage