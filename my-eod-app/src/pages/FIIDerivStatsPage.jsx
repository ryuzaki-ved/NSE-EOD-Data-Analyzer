import React, { useState, useEffect } from 'react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, ComposedChart } from 'recharts'
import DataTable from '../components/DataTable'
import MetricCard from '../components/MetricCard'
import { TrendingUp, TrendingDown, DollarSign, Activity, BarChart3, Eye, Target } from 'lucide-react'
import { motion } from 'framer-motion'
import SortedCustomTooltip from '../components/SortedCustomTooltip'
import DateSelector from '../components/DateSelector'

const FIIDerivStatsPage = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedInstrument, setSelectedInstrument] = useState('ALL')
  const [selectedDate, setSelectedDate] = useState('')
  const [previousDate, setPreviousDate] = useState('')

  // Helper function to format numbers with Indian comma system
  const formatIndianNumber = (num) => {
    if (typeof num !== 'number') return num
    return num.toLocaleString('en-IN')
  }

  // Helper function to format amounts in crores with Indian comma system
  const formatAmountInCrores = (amount) => {
    if (typeof amount !== 'number') return amount
    const crores = amount / 1e7
    return `₹${crores.toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}Cr`
  }
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

  // Set default selected dates when data is loaded
  useEffect(() => {
    if (data.length > 0 && !selectedDate) {
      const dates = [...new Set(data.map(item => item.date))].sort((a, b) => {
        // Convert DD-MM-YYYY to YYYY-MM-DD for proper date comparison
        const [dayA, monthA, yearA] = a.split('-')
        const [dayB, monthB, yearB] = b.split('-')
        const dateA = new Date(`${yearA}-${monthA}-${dayA}`)
        const dateB = new Date(`${yearB}-${monthB}-${dayB}`)
        return dateB - dateA
      })

      if (dates.length > 0) {
        setSelectedDate(dates[0])
        setPreviousDate(dates.length > 1 ? dates[1] : dates[0])
      }
    }
  }, [data, selectedDate])

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

  // Helper function to generate insights based on OI changes
  const generateInsight = (latestData, previousData) => {
    if (!latestData || !previousData) return "Insufficient data for analysis"

    const oiContractDiff = (latestData.oi_contracts_adj || 0) - (previousData.oi_contracts_adj || 0)
    const oiAmountDiff = (latestData.oi_amt_adj || 0) - (previousData.oi_amt_adj || 0)

    if (oiContractDiff > 0) {
      return `Added ${formatIndianNumber(Math.abs(oiContractDiff))} contracts worth ${formatAmountInCrores(Math.abs(oiAmountDiff))}`
    } else if (oiContractDiff < 0) {
      return `Reduced ${formatIndianNumber(Math.abs(oiContractDiff))} contracts worth ${formatAmountInCrores(Math.abs(oiAmountDiff))}`
    } else {
      return "No change in open interest"
    }
  }

  // Get available dates and set default selected dates
  const availableDates = [...new Set(data.map(item => item.date))].sort((a, b) => {
    // Convert DD-MM-YYYY to YYYY-MM-DD for proper date comparison
    const [dayA, monthA, yearA] = a.split('-')
    const [dayB, monthB, yearB] = b.split('-')
    const dateA = new Date(`${yearA}-${monthA}-${dayA}`)
    const dateB = new Date(`${yearB}-${monthB}-${dayB}`)
    return dateB - dateA
  })



  // Get latest data for all index options
  const indexOptions = ['NIFTY OPTIONS', 'BANKNIFTY OPTIONS', 'FINNIFTY OPTIONS', 'MIDCPNIFTY OPTIONS', 'NIFTYNXT50 OPTIONS']
  const latestIndexOptionsData = data.find(item =>
    item.date === selectedDate && item.instrument === 'INDEX OPTIONS'
  )

  const latestOptionsData = indexOptions.map(option => ({
    instrument: option,
    data: data.find(item => item.date === selectedDate && item.instrument === option)
  }))

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
  const latestDateData = data.filter(item => item.date === selectedDate)

  const mainFuturesOIData = latestDateData
    .filter(item => item.instrument.includes('FUTURES') && !item.instrument.includes('STOCK') && item.instrument !== 'INDEX FUTURES')
    .map(item => ({
      name: item.instrument.replace(' FUTURES', ''),
      value: item.oi_amt_adj || 0
    }))

  const mainOptionsOIData = latestDateData
    .filter(item => item.instrument.includes('OPTIONS') && !item.instrument.includes('STOCK') && item.instrument !== 'INDEX OPTIONS')
    .map(item => ({
      name: item.instrument.replace(' OPTIONS', ''),
      value: item.oi_amt_adj || 0
    }))

  // Futures and Options OI distribution data for Deep Data section
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

  // Color mapping for different indices - subtle backgrounds with colored borders
  const getIndexColor = (instrument) => {
    const colorMap = {
      'NIFTY': 'bg-dark-700/80 border-blue-500/40',
      'BANKNIFTY': 'bg-dark-700/80 border-purple-500/40',
      'FINNIFTY': 'bg-dark-700/80 border-green-500/40',
      'MIDCPNIFTY': 'bg-dark-700/80 border-orange-500/40',
      'NIFTYNXT50': 'bg-dark-700/80 border-indigo-500/40'
    }
    return colorMap[instrument] || 'bg-dark-700/80 border-gray-500/40'
  }

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  }

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="flex flex-col sm:flex-row justify-between items-start sm:items-center" variants={itemVariants}>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent mb-4 sm:mb-0">FII Derivatives Statistics</h1>
        <select
          value={selectedInstrument}
          onChange={(e) => setSelectedInstrument(e.target.value)}
          className="px-4 py-2 bg-dark-800 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 text-slate-200 outline-none"
        >
          {instruments.map(instrument => (
            <option key={instrument} value={instrument}>{instrument}</option>
          ))}
        </select>
      </motion.div>

      {/* Metrics Cards */}
      <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" variants={containerVariants}>
        <motion.div variants={itemVariants}>
          <MetricCard
            title="Total Buy Amount"
            value={totalBuyAmt}
            icon={TrendingUp}
            color="green"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <MetricCard
            title="Total Sell Amount"
            value={totalSellAmt}
            icon={TrendingDown}
            color="red"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <MetricCard
            title="Net Flow"
            value={netFlow}
            icon={DollarSign}
            color={netFlow >= 0 ? 'green' : 'red'}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <MetricCard
            title="Open Interest"
            value={totalOI}
            icon={Activity}
            color="primary"
          />
        </motion.div>
      </motion.div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-8">
        <motion.div variants={itemVariants} className="glass-card p-6">
          <h3 className="text-xl font-semibold mb-6 text-slate-200">Daily Buy vs Sell Trend</h3>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorBuy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorSell" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="date" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<SortedCustomTooltip formatter={(val) => `₹${val.toLocaleString('en-IN')}`} />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="buy_amt"
                stackId="1"
                stroke="#10b981"
                fill="url(#colorBuy)"
                name="Buy Amount"
              />
              <Area
                type="monotone"
                dataKey="sell_amt"
                stackId="2"
                stroke="#ef4444"
                fill="url(#colorSell)"
                name="Sell Amount"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-card p-6">
          <h3 className="text-xl font-semibold mb-6 text-slate-200">Open Interest Trend</h3>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="date" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: '12px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="oi_amt"
                stroke="#0ea5e9"
                strokeWidth={3}
                dot={{ fill: '#0ea5e9', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 8 }}
                name="Open Interest"
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <motion.div variants={itemVariants} className="glass-card p-6">
        <h3 className="text-xl font-semibold mb-6 text-slate-200">Daily Net Flow</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="date" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              contentStyle={{
                backgroundColor: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: '12px',
              }}
            />
            <Bar
              dataKey="buy_amt"
              fill="#10b981"
              name="Buy Amount"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="sell_amt"
              fill="#ef4444"
              name="Sell Amount"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Instrument Distribution Charts */}
      <div className="grid lg:grid-cols-2 gap-8">
        <motion.div variants={itemVariants} className="glass-card p-6">
          <h3 className="text-xl font-semibold mb-6 text-slate-200">Index Futures OI Distribution</h3>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={mainFuturesOIData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {mainFuturesOIData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.1)" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: '12px',
                  color: '#e2e8f0',
                }}
                itemStyle={{ color: '#e2e8f0' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-card p-6">
          <h3 className="text-xl font-semibold mb-6 text-slate-200">Index Options OI Distribution</h3>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={mainOptionsOIData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {mainOptionsOIData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.1)" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: '12px',
                  color: '#e2e8f0',
                }}
                itemStyle={{ color: '#e2e8f0' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Deep Data Section */}
      <motion.div variants={itemVariants} className="glass-card p-8 border border-primary-500/20 bg-gradient-to-br from-dark-900/80 to-dark-800/80 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -z-10"></div>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-gradient-to-r from-primary-500 to-accent-purple shadow-lg shadow-primary-500/20">
              <Eye className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Deep Data</h2>
            <div className="px-3 py-1 bg-primary-500/10 rounded-full text-xs font-semibold text-primary-400 border border-primary-500/20">
              PREMIUM INSIGHTS
            </div>
          </div>
          <div className="bg-dark-900/50 p-2 rounded-xl border border-white/5">
            <DateSelector
              selectedDate={selectedDate}
              previousDate={previousDate}
              availableDates={availableDates}
              onDateChange={(date) => {
                setSelectedDate(date)
                const currentIndex = availableDates.indexOf(date)
                setPreviousDate(availableDates[currentIndex + 1] || availableDates[currentIndex])
              }}
              onPrevDateChange={setPreviousDate}
            />
          </div>
        </div>

        <div className="space-y-8">
          {/* Strike Activity Analysis for All Index Options */}
          <div className="glass-card p-6 border border-white/5 bg-dark-800/50">
            <div className="flex items-center space-x-2 mb-6">
              <Target className="h-5 w-5 text-primary-400" />
              <h4 className="text-xl font-semibold text-slate-200">Strike Activity Analysis</h4>
              <div className="px-2 py-0.5 bg-dark-700 rounded text-[10px] text-slate-400 border border-white/5">
                ALL INDICES
              </div>
            </div>

            <div className="mb-6 flex items-center space-x-2 text-sm">
              <span className="text-slate-400">Selected Date:</span>
              <span className="text-primary-400 font-medium bg-primary-500/10 px-2 py-0.5 rounded border border-primary-500/20">{selectedDate}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {latestOptionsData.map(({ instrument, data }, index) => {
                if (!data) return null

                const instrumentName = instrument.replace(' OPTIONS', '')
                const buyStrike = roundToFifty(data.buy_str_act || 0)
                const sellStrike = roundToFifty(data.sell_str_act || 0)

                return (
                  <motion.div
                    key={instrument}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`glass-card p-5 border ${getIndexColor(instrumentName)} hover:border-opacity-50 transition-all duration-300 group`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-1 h-8 rounded-full ${instrumentName === 'NIFTY' ? 'bg-blue-500' :
                          instrumentName === 'BANKNIFTY' ? 'bg-purple-500' :
                            instrumentName === 'FINNIFTY' ? 'bg-emerald-500' :
                              instrumentName === 'MIDCPNIFTY' ? 'bg-orange-500' :
                                'bg-indigo-500'}`}></div>
                        <h5 className="text-lg font-bold text-white tracking-wide">{instrumentName}</h5>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${instrumentName === 'NIFTY' ? 'bg-blue-400' :
                        instrumentName === 'BANKNIFTY' ? 'bg-purple-400' :
                          instrumentName === 'FINNIFTY' ? 'bg-emerald-400' :
                            instrumentName === 'MIDCPNIFTY' ? 'bg-orange-400' :
                              'bg-indigo-400'} animate-pulse`}></div>
                    </div>

                    <div className="space-y-4 text-sm">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-dark-900/50 p-3 rounded-lg border border-white/5">
                          <span className="text-slate-400 text-xs block mb-1">Buy Activity</span>
                          <span className="text-emerald-400 font-bold text-lg">
                            {formatIndianNumber(Math.round(data.buy_str_act || 0))}
                          </span>
                        </div>
                        <div className="bg-dark-900/50 p-3 rounded-lg border border-white/5">
                          <span className="text-slate-400 text-xs block mb-1">Sell Activity</span>
                          <span className="text-rose-400 font-bold text-lg">
                            {formatIndianNumber(Math.round(data.sell_str_act || 0))}
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-white/5 pt-4">
                        <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-3">Key Strikes</p>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center bg-emerald-500/5 px-3 py-2 rounded-lg border border-emerald-500/10">
                            <span className="text-emerald-400 text-xs font-bold">BUY LEVEL</span>
                            <span className="text-emerald-300 font-mono font-bold">
                              {formatIndianNumber(buyStrike)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center bg-rose-500/5 px-3 py-2 rounded-lg border border-rose-500/10">
                            <span className="text-rose-400 text-xs font-bold">SELL LEVEL</span>
                            <span className="text-rose-300 font-mono font-bold">
                              {formatIndianNumber(sellStrike)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Additional metrics */}
                      <div className="border-t border-white/5 pt-4 grid grid-cols-3 gap-2 text-center">
                        <div>
                          <span className="text-slate-500 text-[10px] block uppercase">Buy Amt</span>
                          <span className="text-emerald-400 text-xs font-medium">
                            {formatAmountInCrores(data.buy_amt_adj || 0)}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[10px] block uppercase">Sell Amt</span>
                          <span className="text-rose-400 text-xs font-medium">
                            {formatAmountInCrores(data.sell_amt_adj || 0)}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[10px] block uppercase">OI Amt</span>
                          <span className="text-cyan-400 text-xs font-medium">
                            {formatAmountInCrores(data.oi_amt_adj || 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {latestOptionsData.every(({ data }) => !data) && (
              <div className="text-center py-12 bg-dark-800/30 rounded-xl border border-dashed border-white/10">
                <p className="text-slate-400 text-sm">No recent index options data available</p>
              </div>
            )}
          </div>

          {/* Enhanced Market Sentiment for All Indices */}
          <div className="glass-card p-6 border border-purple-500/20 bg-dark-800/50">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <TrendingUp className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-slate-200">Market Sentiment Analysis</h4>
                  <div className="text-xs text-purple-400 font-medium">DAY-OVER-DAY COMPARISON</div>
                </div>
              </div>
            </div>

            {(() => {
              if (availableDates.length < 2) {
                return <p className="text-slate-400 text-sm text-center py-8">Insufficient data for comparison</p>
              }

              const sentimentData = indexOptions.map(option => {
                const latestData = data.find(item =>
                  item.date === selectedDate && item.instrument === option
                )
                const previousData = data.find(item =>
                  item.date === previousDate && item.instrument === option
                )

                if (!latestData || !previousData) return null

                const buyDiff = (latestData.buy_amt_adj || 0) - (previousData.buy_amt_adj || 0)
                const sellDiff = (latestData.sell_amt_adj || 0) - (previousData.sell_amt_adj || 0)
                const oiDiff = (latestData.oi_amt_adj || 0) - (previousData.oi_amt_adj || 0)

                return {
                  instrument: option.replace(' OPTIONS', ''),
                  latestData,
                  previousData,
                  buyDiff,
                  sellDiff,
                  oiDiff
                }
              }).filter(Boolean)

              return (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {sentimentData.map(({ instrument, latestData, previousData, buyDiff, sellDiff, oiDiff }, index) => (
                      <motion.div
                        key={instrument}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                        className={`glass-card p-5 border ${getIndexColor(instrument)} hover:border-opacity-50 transition-all duration-300`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <div className={`w-1 h-6 rounded-full ${instrument === 'NIFTY' ? 'bg-blue-500' :
                              instrument === 'BANKNIFTY' ? 'bg-purple-500' :
                                instrument === 'FINNIFTY' ? 'bg-emerald-500' :
                                  instrument === 'MIDCPNIFTY' ? 'bg-orange-500' :
                                    'bg-indigo-500'}`}></div>
                            <h5 className="text-lg font-bold text-white">{instrument}</h5>
                          </div>
                          <div className={`w-2 h-2 rounded-full ${buyDiff > sellDiff ? 'bg-emerald-400' : 'bg-rose-400'
                            } animate-pulse`}></div>
                        </div>

                        <div className="space-y-4 text-sm">
                          <div className="grid grid-cols-3 gap-2 text-center bg-dark-900/30 p-2 rounded-lg">
                            <div>
                              <span className="text-slate-500 text-[10px] block uppercase">Buy</span>
                              <span className="text-emerald-400 font-medium text-xs">
                                {formatAmountInCrores(latestData.buy_amt_adj)}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-500 text-[10px] block uppercase">Sell</span>
                              <span className="text-rose-400 font-medium text-xs">
                                {formatAmountInCrores(latestData.sell_amt_adj)}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-500 text-[10px] block uppercase">OI</span>
                              <span className="text-cyan-400 font-medium text-xs">
                                {formatAmountInCrores(latestData.oi_amt_adj)}
                              </span>
                            </div>
                          </div>

                          <div className="border-t border-white/5 pt-3">
                            <p className="text-slate-400 text-[10px] uppercase font-bold mb-2">Day-over-Day Change</p>
                            <div className="space-y-1.5">
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-400">Buy Change</span>
                                <span className={buyDiff >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                                  {buyDiff >= 0 ? '+' : ''}{formatAmountInCrores(buyDiff)}
                                </span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-400">Sell Change</span>
                                <span className={sellDiff >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                                  {sellDiff >= 0 ? '+' : ''}{formatAmountInCrores(sellDiff)}
                                </span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-400">OI Change</span>
                                <span className={oiDiff >= 0 ? 'text-cyan-400 font-bold' : 'text-rose-400 font-bold'}>
                                  {oiDiff >= 0 ? '+' : ''}{formatAmountInCrores(oiDiff)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Market Insight */}
                          <div className="border-t border-white/5 pt-3">
                            <div className="bg-primary-500/5 rounded-lg p-3 border border-primary-500/10">
                              <p className="text-xs text-primary-200 leading-relaxed">
                                {generateInsight(latestData, previousData)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {sentimentData.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-slate-400 text-sm">Insufficient data for sentiment analysis</p>
                    </div>
                  )}
                </div>
              )
            })()}
          </div>
        </div>
      </motion.div>

      {/* Data Table */}
      <motion.div variants={itemVariants}>
        <DataTable
          data={filteredData}
          columns={columns}
          title="FII Derivatives Data"
          defaultSortKey="date"
          defaultSortDirection="desc"
        />
      </motion.div>
    </motion.div>
  )
}

export default FIIDerivStatsPage