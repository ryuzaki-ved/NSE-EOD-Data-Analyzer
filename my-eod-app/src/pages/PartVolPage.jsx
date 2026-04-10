import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import DataTable from '../components/DataTable'
import MetricCard from '../components/MetricCard'
import { Activity, TrendingUp, BarChart3, Users, Eye } from 'lucide-react'
import AnimatedLoader from '../components/AnimatedLoader'
import DeepInsightsPartVol from '../components/DeepInsightsPartVol'
import SortedCustomTooltip from '../components/SortedCustomTooltip'

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
          const [dayA, monthA, yearA] = a.split('-')
          const [dayB, monthB, yearB] = b.split('-')
          const dateA = new Date(`${yearA}-${monthA}-${dayA}`)
          const dateB = new Date(`${yearB}-${monthB}-${dayB}`)
          return dateB - dateA
        })

      const latestDate = allDates[0]
      const previousDate = allDates[1]

      setInsightsLatestDate(latestDate)
      setInsightsPreviousDate(previousDate)

      const clientTypes = ['Client', 'DII', 'FII', 'Pro']
      const processedData = []

      clientTypes.forEach(clientType => {
        const latestVolData = data.find(item => item.date === latestDate && item.client_type === clientType)
        const previousVolData = data.find(item => item.date === previousDate && item.client_type === clientType)

        const latestOiData = oiData.find(item => item.date === latestDate && item.client_type === clientType)
        const previousOiData = oiData.find(item => item.date === previousDate && item.client_type === clientType)

        if (latestVolData && previousVolData && latestOiData && previousOiData) {
          const callLongVolDiff = (latestVolData.option_index_call_long || 0) - (previousVolData.option_index_call_long || 0)
          const putLongVolDiff = (latestVolData.option_index_put_long || 0) - (previousVolData.option_index_put_long || 0)
          const callShortVolDiff = (latestVolData.option_index_call_short || 0) - (previousVolData.option_index_call_short || 0)
          const putShortVolDiff = (latestVolData.option_index_put_short || 0) - (previousVolData.option_index_put_short || 0)

          const callLongOiDiff = (latestOiData.option_index_call_long || 0) - (previousOiData.option_index_call_long || 0)
          const putLongOiDiff = (latestOiData.option_index_put_long || 0) - (previousOiData.option_index_put_long || 0)
          const callShortOiDiff = (latestOiData.option_index_call_short || 0) - (previousOiData.option_index_call_short || 0)
          const putShortOiDiff = (latestOiData.option_index_put_short || 0) - (previousOiData.option_index_put_short || 0)

          let adjustedCallLongVol = latestVolData.option_index_call_long || 0
          let adjustedPutLongVol = latestVolData.option_index_put_long || 0
          let adjustedCallShortVol = latestVolData.option_index_call_short || 0
          let adjustedPutShortVol = latestVolData.option_index_put_short || 0

          if (callLongOiDiff >= 0) {
            adjustedCallLongVol -= callLongOiDiff
          } else {
            adjustedCallShortVol -= Math.abs(callLongOiDiff)
          }

          if (putLongOiDiff >= 0) {
            adjustedPutLongVol -= putLongOiDiff
          } else {
            adjustedPutShortVol -= Math.abs(putLongOiDiff)
          }

          if (callShortOiDiff >= 0) {
            adjustedCallShortVol -= callShortOiDiff
          } else {
            adjustedCallLongVol -= Math.abs(callShortOiDiff)
          }

          if (putShortOiDiff >= 0) {
            adjustedPutShortVol -= putShortOiDiff
          } else {
            adjustedPutLongVol -= Math.abs(putShortOiDiff)
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
  }, [data, oiData, insightsLatestDate, insightsPreviousDate])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <AnimatedLoader text="Loading Participant Trading Volume..." />
      </div>
    )
  }

  const clientTypes = ['ALL', ...new Set(data.map(item => item.client_type).filter(type => type !== 'TOTAL'))]
  const filteredData = selectedClientType === 'ALL' ?
    data.filter(item => item.client_type !== 'TOTAL') :
    data.filter(item => item.client_type === selectedClientType)

  const totalLongVolume = filteredData.reduce((sum, item) => sum + (item.total_long_contracts || 0), 0)
  const totalShortVolume = filteredData.reduce((sum, item) => sum + (item.total_short_contracts || 0), 0)
  const futureIndexVolume = filteredData.reduce((sum, item) => sum + (item.future_index_long || 0) + (item.future_index_short || 0), 0)
  const optionIndexVolume = filteredData.reduce((sum, item) => sum + (item.option_index_call_long || 0) + (item.option_index_put_long || 0), 0)

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

  const latestDate = data.length > 0 ? data[data.length - 1].date : ''
  const volumeDistribution = data
    .filter(item => item.date === latestDate && item.client_type !== 'TOTAL')
    .map(item => ({
      name: item.client_type,
      volume: item.total_long_contracts + item.total_short_contracts,
    }))

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

  const COLORS = ['#38BDF8', '#818CF8', '#10B981', '#F59E0B']

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  }

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 15
      }
    }
  }

  return (
    <motion.div
      className="space-y-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        variants={itemVariants}
      >
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Participant Trading Volume</h1>
          <p className="text-slate-400 text-sm mt-0.5">Execution volume distribution, contracts and derivatives turnover</p>
        </div>
        <select
          value={selectedClientType}
          onChange={(e) => setSelectedClientType(e.target.value)}
          className="px-3.5 py-2 bg-[#0B0F19] border border-white/[0.08] rounded-xl text-xs font-medium text-slate-300 focus:ring-1 focus:ring-emerald-500/40 focus:border-emerald-500/40 outline-none transition-colors"
        >
          {clientTypes.map(type => (
            <option key={type} value={type}>{type === 'ALL' ? 'All Participants' : type}</option>
          ))}
        </select>
      </motion.div>

      {/* Metrics Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={containerVariants}
      >
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
          color="cyan"
        />
        <MetricCard
          title="Option Index Volume"
          value={optionIndexVolume}
          icon={Users}
          color="amber"
        />
      </motion.div>

      {/* Charts */}
      <motion.div
        className="grid lg:grid-cols-2 gap-6"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="glass-card p-6 border border-white/[0.07]">
          <h3 className="text-base font-bold text-white tracking-tight mb-4">Daily Total Volume Trend</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyVolumeData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorFuture" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#38BDF8" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorOption" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818CF8" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#818CF8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} />
                <Tooltip content={<SortedCustomTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: '12px' }}
                  formatter={(value) => <span className="text-xs text-slate-300 font-medium">{value}</span>}
                />
                <Area
                  type="monotone"
                  dataKey="future_volume"
                  stackId="1"
                  stroke="#38BDF8"
                  fill="url(#colorFuture)"
                  strokeWidth={2}
                  name="Futures Volume"
                />
                <Area
                  type="monotone"
                  dataKey="option_volume"
                  stackId="1"
                  stroke="#818CF8"
                  fill="url(#colorOption)"
                  strokeWidth={2}
                  name="Options Volume"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-card p-6 border border-white/[0.07]">
          <h3 className="text-base font-bold text-white tracking-tight mb-4">Participant Volume Distribution</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={volumeDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={95}
                  innerRadius={55}
                  paddingAngle={4}
                  dataKey="volume"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {volumeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#080B11" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(11, 15, 25, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: '#e2e8f0',
                    backdropFilter: 'blur(12px)',
                  }}
                  itemStyle={{ color: '#e2e8f0', fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        className="grid lg:grid-cols-2 gap-6"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="glass-card p-6 border border-white/[0.07]">
          <h3 className="text-base font-bold text-white tracking-tight mb-4">Participant Total Volume Comparison</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(11, 15, 25, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: '#e2e8f0',
                    backdropFilter: 'blur(12px)',
                  }}
                  itemStyle={{ color: '#e2e8f0', fontSize: 12 }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '12px' }}
                  formatter={(value) => <span className="text-xs text-slate-300 font-medium">{value}</span>}
                />
                <Bar dataKey="Client_total" fill="#38BDF8" name="Client" radius={[3, 3, 0, 0]} />
                <Bar dataKey="FII_total" fill="#10B981" name="FII" radius={[3, 3, 0, 0]} />
                <Bar dataKey="DII_total" fill="#818CF8" name="DII" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Pro_total" fill="#F59E0B" name="Pro" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-card p-6 border border-white/[0.07]">
          <h3 className="text-base font-bold text-white tracking-tight mb-4">FII Volume Long vs Short Trend</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} />
                <Tooltip content={<SortedCustomTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: '12px' }}
                  formatter={(value) => <span className="text-xs text-slate-300 font-medium">{value}</span>}
                />
                <Line
                  type="monotone"
                  dataKey="FII_long"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  dot={{ fill: '#10B981', strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5, stroke: '#10B981', strokeWidth: 2, fill: '#0B0F19' }}
                  name="FII Long Volume"
                />
                <Line
                  type="monotone"
                  dataKey="FII_short"
                  stroke="#F43F5E"
                  strokeWidth={2.5}
                  dot={{ fill: '#F43F5E', strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5, stroke: '#F43F5E', strokeWidth: 2, fill: '#0B0F19' }}
                  name="FII Short Volume"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </motion.div>

      {/* Deep Insights Section */}
      <motion.div variants={itemVariants}>
        <DeepInsightsPartVol
          data={deepInsightsData}
          latestDate={insightsLatestDate}
          previousDate={insightsPreviousDate}
          availableDates={[...new Set([...data.map(item => item.date), ...oiData.map(item => item.date)])].sort((a, b) => {
            const [dayA, monthA, yearA] = a.split('-')
            const [dayB, monthB, yearB] = b.split('-')
            const dateA = new Date(`${yearA}-${monthA}-${dayA}`)
            const dateB = new Date(`${yearB}-${monthB}-${dayB}`)
            return dateB - dateA
          })}
          onDateChange={(date) => {
            setInsightsLatestDate(date)
            const allDates = [...new Set([...data.map(item => item.date), ...oiData.map(item => item.date)])]
              .sort((a, b) => {
                const [dayA, monthA, yearA] = a.split('-')
                const [dayB, monthB, yearB] = b.split('-')
                const dateA = new Date(`${yearA}-${monthA}-${dayA}`)
                const dateB = new Date(`${yearB}-${monthB}-${dayB}`)
                return dateB - dateA
              })
            const currentIndex = allDates.indexOf(date)
            setInsightsPreviousDate(allDates[currentIndex + 1] || allDates[currentIndex])
          }}
          onPrevDateChange={setInsightsPreviousDate}
        />
      </motion.div>

      {/* Data Table */}
      <motion.div variants={itemVariants} className="glass-card border border-white/[0.07] overflow-hidden">
        <DataTable
          data={filteredData}
          columns={columns}
          title="Participant Trading Volume Data"
          defaultSortKey="date"
          defaultSortDirection="desc"
        />
      </motion.div>
    </motion.div>
  )
}

export default PartVolPage