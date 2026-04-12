import React, { useState, useEffect, useMemo } from 'react'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, ReferenceLine
} from 'recharts'
import DataTable from '../components/DataTable'
import MetricCard from '../components/MetricCard'
import AnimatedLoader from '../components/AnimatedLoader'
import { TrendingUp, TrendingDown, DollarSign, Activity, Eye, Target } from 'lucide-react'
import { motion } from 'framer-motion'
import SortedCustomTooltip from '../components/SortedCustomTooltip'
import DateSelector from '../components/DateSelector'
import ChartHeaderHUD from '../components/charts/ChartHeaderHUD'
import {
  filterByTimeframe, formatAxisDate, formatSignedCompact,
  formatIndianCompact, formatRupeesCompact, formatSignedRupeesCompact, getAxisInterval
} from '../utils/chartHelpers'

const SUMMARY_INSTRUMENTS = ['INDEX FUTURES', 'INDEX OPTIONS', 'STOCK FUTURES', 'STOCK OPTIONS']

const FIIDerivStatsPage = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedInstrument, setSelectedInstrument] = useState('ALL')
  const [selectedDate, setSelectedDate] = useState('')
  const [previousDate, setPreviousDate] = useState('')
  const [flowTimeframe, setFlowTimeframe] = useState('1M')
  const [flowViewMode, setFlowViewMode] = useState('net')
  const [hoveredFlowSession, setHoveredFlowSession] = useState(null)
  const [oiTimeframe, setOiTimeframe] = useState('1M')
  const [hoveredOiSession, setHoveredOiSession] = useState(null)

  const formatIndianNumber = (num) => {
    if (typeof num !== 'number') return num
    return num.toLocaleString('en-IN')
  }

  const formatAmountInCrores = (amount) => {
    if (typeof amount !== 'number') return amount
    return formatRupeesCompact(amount)
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

  useEffect(() => {
    if (data.length > 0 && !selectedDate) {
      const dates = [...new Set(data.map(item => item.date))].sort((a, b) => {
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

  const instruments = useMemo(() => ['ALL', ...new Set(data.map(item => item.instrument))], [data])
  
  // Exclude double-counted summary vs individual items when 'ALL' is selected
  const activeDataset = useMemo(() => {
    if (selectedInstrument === 'ALL') {
      return data.filter(item => SUMMARY_INSTRUMENTS.includes(item.instrument))
    }
    return data.filter(item => item.instrument === selectedInstrument)
  }, [data, selectedInstrument])

  const totalBuyAmt = useMemo(() => activeDataset.reduce((sum, item) => sum + (item.buy_amt_adj || 0), 0), [activeDataset])
  const totalSellAmt = useMemo(() => activeDataset.reduce((sum, item) => sum + (item.sell_amt_adj || 0), 0), [activeDataset])
  const totalOI = useMemo(() => activeDataset.reduce((sum, item) => sum + (item.oi_amt_adj || 0), 0), [activeDataset])
  const netFlow = totalBuyAmt - totalSellAmt

  const roundToFifty = (value) => Math.round(value / 50) * 50

  const generateInsight = (latestData, previousData) => {
    if (!latestData || !previousData) return "Insufficient data for comparative analysis"

    const oiContractDiff = (latestData.oi_contracts_adj || 0) - (previousData.oi_contracts_adj || 0)
    const oiAmountDiff = (latestData.oi_amt_adj || 0) - (previousData.oi_amt_adj || 0)

    if (oiContractDiff > 0) {
      return `Added ${formatIndianNumber(Math.abs(oiContractDiff))} contracts worth ${formatRupeesCompact(Math.abs(oiAmountDiff))}`
    } else if (oiContractDiff < 0) {
      return `Liquidated ${formatIndianNumber(Math.abs(oiContractDiff))} contracts worth ${formatRupeesCompact(Math.abs(oiAmountDiff))}`
    } else {
      return "No net change in open interest position"
    }
  }

  const availableDates = useMemo(() => [...new Set(data.map(item => item.date))].sort((a, b) => {
    const [dayA, monthA, yearA] = a.split('-')
    const [dayB, monthB, yearB] = b.split('-')
    const dateA = new Date(`${yearA}-${monthA}-${dayA}`)
    const dateB = new Date(`${yearB}-${monthB}-${dayB}`)
    return dateB - dateA
  }), [data])

  const indexOptions = ['NIFTY OPTIONS', 'BANKNIFTY OPTIONS', 'FINNIFTY OPTIONS', 'MIDCPNIFTY OPTIONS', 'NIFTYNXT50 OPTIONS']

  const latestOptionsData = indexOptions.map(option => ({
    instrument: option,
    data: data.find(item => item.date === selectedDate && item.instrument === option)
  }))

  const rawChartData = useMemo(() => {
    const map = new Map()
    activeDataset.forEach(item => {
      if (!map.has(item.date)) {
        map.set(item.date, {
          date: item.date,
          buy_amt: item.buy_amt_adj || 0,
          sell_amt: item.sell_amt_adj || 0,
          oi_amt: item.oi_amt_adj || 0,
          net_flow: (item.buy_amt_adj || 0) - (item.sell_amt_adj || 0),
        })
      } else {
        const existing = map.get(item.date)
        existing.buy_amt += item.buy_amt_adj || 0
        existing.sell_amt += item.sell_amt_adj || 0
        existing.oi_amt += item.oi_amt_adj || 0
        existing.net_flow = existing.buy_amt - existing.sell_amt
      }
    })

    return Array.from(map.values()).sort((a, b) => {
      const [dayA, monthA, yearA] = a.date.split('-')
      const [dayB, monthB, yearB] = b.date.split('-')
      return new Date(`${yearA}-${monthA}-${dayA}`) - new Date(`${yearB}-${monthB}-${dayB}`)
    })
  }, [activeDataset])

  const filteredFlowData = useMemo(() => filterByTimeframe(rawChartData, flowTimeframe), [rawChartData, flowTimeframe])
  const filteredOiData = useMemo(() => filterByTimeframe(rawChartData, oiTimeframe), [rawChartData, oiTimeframe])

  const latestDateData = useMemo(() => data.filter(item => item.date === selectedDate), [data, selectedDate])

  const mainFuturesOIData = useMemo(() => latestDateData
    .filter(item => item.instrument.includes('FUTURES') && !item.instrument.includes('STOCK') && item.instrument !== 'INDEX FUTURES')
    .map(item => ({
      name: item.instrument.replace(' FUTURES', ''),
      value: item.oi_amt_adj || 0
    })), [latestDateData])

  const mainOptionsOIData = useMemo(() => latestDateData
    .filter(item => item.instrument.includes('OPTIONS') && !item.instrument.includes('STOCK') && item.instrument !== 'INDEX OPTIONS')
    .map(item => ({
      name: item.instrument.replace(' OPTIONS', ''),
      value: item.oi_amt_adj || 0
    })), [latestDateData])

  const COLORS = ['#10b981', '#06b6d4', '#38bdf8', '#818cf8', '#f59e0b', '#f43f5e']

  const columns = [
    { key: 'date', label: 'Date' },
    { key: 'instrument', label: 'Instrument' },
    { key: 'buy_contracts_adj', label: 'Buy Contracts' },
    { key: 'buy_amt_adj', label: 'Buy Amount (₹)' },
    { key: 'sell_contracts_adj', label: 'Sell Contracts' },
    { key: 'sell_amt_adj', label: 'Sell Amount (₹)' },
    { key: 'oi_contracts_adj', label: 'OI Contracts' },
    { key: 'oi_amt_adj', label: 'OI Amount (₹)' },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  }

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.3 }
    }
  }

  if (loading) {
    return <AnimatedLoader message="INITIALIZING FII FLOW INTELLIGENCE ENGINE" />
  }

  return (
    <motion.div
      className="space-y-6 max-w-7xl mx-auto pb-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Bar */}
      <motion.div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0D121D]/90 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 shadow-terminal" variants={itemVariants}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase tracking-widest">
              INSTITUTIONAL FLOW
            </span>
            <span className="text-xs text-slate-400 font-mono">FII DERIVATIVES DESK</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            FII Derivatives Statistics
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-xs font-mono text-slate-400 uppercase font-semibold">Instrument</label>
          <select
            value={selectedInstrument}
            onChange={(e) => setSelectedInstrument(e.target.value)}
            className="px-3 py-1.5 bg-[#161D2B] border border-white/[0.08] rounded-xl text-xs font-mono font-medium text-slate-200 focus:ring-1 focus:ring-emerald-500/50 outline-none cursor-pointer"
          >
            {instruments.map(instrument => (
              <option key={instrument} value={instrument}>{instrument}</option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Metrics Cards */}
      <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" variants={containerVariants}>
        <motion.div variants={itemVariants}>
          <MetricCard
            title="Total Buy Amount"
            value={totalBuyAmt}
            icon={TrendingUp}
            color="emerald"
            subtitle="Gross Purchases"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <MetricCard
            title="Total Sell Amount"
            value={totalSellAmt}
            icon={TrendingDown}
            color="rose"
            subtitle="Gross Sales"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <MetricCard
            title="Net Institutional Flow"
            value={netFlow}
            icon={DollarSign}
            color={netFlow >= 0 ? 'emerald' : 'rose'}
            subtitle="Buy - Sell Turnover"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <MetricCard
            title="Total Open Interest"
            value={totalOI}
            icon={Activity}
            color="cyan"
            subtitle="Gross Outstanding"
          />
        </motion.div>
      </motion.div>

      {/* Advanced Decluttered Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Buy vs Sell Flow / Net Institutional Turnover */}
        <motion.div variants={itemVariants} className="bg-[#0D121D]/90 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 shadow-terminal">
          <ChartHeaderHUD
            title="Daily FII Turnover Dynamics"
            subtitle={`Institutional turnover & net directional liquidity (${selectedInstrument})`}
            tag="FII FLOW"
            timeframe={flowTimeframe}
            onTimeframeChange={setFlowTimeframe}
            viewMode={flowViewMode}
            viewOptions={[
              { key: 'net', label: 'Net Flow (₹)' },
              { key: 'gross', label: 'Gross Split' },
            ]}
            onViewModeChange={setFlowViewMode}
            hoveredData={hoveredFlowSession}
          />

          <div className="h-[280px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              {flowViewMode === 'net' ? (
                <BarChart
                  data={filteredFlowData}
                  margin={{ top: 10, right: 10, left: -5, bottom: 0 }}
                  onMouseMove={(state) => {
                    if (state && state.activePayload && state.activePayload.length > 0) {
                      const payload = state.activePayload[0].payload
                      setHoveredFlowSession({
                        date: payload.date,
                        values: [
                          { label: 'Net Flow', value: formatSignedRupeesCompact(payload.net_flow), color: payload.net_flow >= 0 ? '#10B981' : '#F43F5E' },
                          { label: 'Buy Turn.', value: formatRupeesCompact(payload.buy_amt), color: '#38BDF8' },
                          { label: 'Sell Turn.', value: formatRupeesCompact(payload.sell_amt), color: '#F59E0B' },
                        ],
                        bias: payload.net_flow >= 0 ? 'NET BUYER' : 'NET SELLER',
                      })
                    }
                  }}
                  onMouseLeave={() => setHoveredFlowSession(null)}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={formatAxisDate}
                    interval={getAxisInterval(filteredFlowData.length)}
                  />
                  <YAxis
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(v) => formatRupeesCompact(v)}
                    width={70}
                  />
                  <ReferenceLine y={0} stroke="#334155" strokeWidth={1.5} />
                  <Tooltip
                    content={<SortedCustomTooltip formatter={(val) => formatRupeesCompact(val)} />}
                    cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
                  />
                  <Bar dataKey="net_flow" name="Net Flow" radius={[3, 3, 0, 0]} maxBarSize={28}>
                    {filteredFlowData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.net_flow >= 0 ? '#10B981' : '#F43F5E'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              ) : (
                <AreaChart
                  data={filteredFlowData}
                  margin={{ top: 10, right: 10, left: -5, bottom: 0 }}
                  onMouseMove={(state) => {
                    if (state && state.activePayload && state.activePayload.length > 0) {
                      const payload = state.activePayload[0].payload
                      setHoveredFlowSession({
                        date: payload.date,
                        values: [
                          { label: 'Buy Turn.', value: formatRupeesCompact(payload.buy_amt), color: '#10B981' },
                          { label: 'Sell Turn.', value: formatRupeesCompact(payload.sell_amt), color: '#F43F5E' },
                          { label: 'Net Flow', value: formatSignedRupeesCompact(payload.net_flow), color: payload.net_flow >= 0 ? '#10B981' : '#F43F5E' },
                        ],
                        bias: payload.buy_amt >= payload.sell_amt ? 'NET BUY' : 'NET SELL',
                      })
                    }
                  }}
                  onMouseLeave={() => setHoveredFlowSession(null)}
                >
                  <defs>
                    <linearGradient id="colorBuy" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorSell" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={formatAxisDate}
                    interval={getAxisInterval(filteredFlowData.length)}
                  />
                  <YAxis
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(v) => formatRupeesCompact(v)}
                    width={70}
                  />
                  <Tooltip
                    content={<SortedCustomTooltip formatter={(val) => formatRupeesCompact(val)} />}
                    cursor={{ stroke: '#475569', strokeDasharray: '3 3' }}
                  />
                  <Area type="monotone" dataKey="buy_amt" stroke="#10b981" strokeWidth={1.5} fill="url(#colorBuy)" name="Buy Amount" />
                  <Area type="monotone" dataKey="sell_amt" stroke="#f43f5e" strokeWidth={1.5} fill="url(#colorSell)" name="Sell Amount" />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Open Interest Valuation Trend */}
        <motion.div variants={itemVariants} className="bg-[#0D121D]/90 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 shadow-terminal">
          <ChartHeaderHUD
            title="Open Interest Valuation Trend"
            subtitle={`Gross outstanding contract amount (${selectedInstrument})`}
            tag="OI VALUATION"
            timeframe={oiTimeframe}
            onTimeframeChange={setOiTimeframe}
            hoveredData={hoveredOiSession}
          />

          <div className="h-[280px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={filteredOiData}
                margin={{ top: 10, right: 10, left: -5, bottom: 0 }}
                onMouseMove={(state) => {
                  if (state && state.activePayload && state.activePayload.length > 0) {
                    const payload = state.activePayload[0].payload
                    setHoveredOiSession({
                      date: payload.date,
                      values: [
                        { label: 'OI Amount', value: formatRupeesCompact(payload.oi_amt), color: '#06B6D4' },
                      ],
                    })
                  }
                }}
                onMouseLeave={() => setHoveredOiSession(null)}
              >
                <defs>
                  <linearGradient id="oiGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#64748B"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={formatAxisDate}
                  interval={getAxisInterval(filteredOiData.length)}
                />
                <YAxis
                  stroke="#64748B"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(v) => formatRupeesCompact(v)}
                  width={70}
                />
                <Tooltip
                  content={<SortedCustomTooltip formatter={(val) => formatRupeesCompact(val)} />}
                  cursor={{ stroke: '#475569', strokeDasharray: '3 3' }}
                />
                <Area type="monotone" dataKey="oi_amt" stroke="#06B6D4" strokeWidth={2} fill="url(#oiGrad)" name="Open Interest Amount" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Instrument Distribution Pie Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants} className="bg-[#0D121D]/90 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 shadow-terminal">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Index Futures OI Distribution</h3>
              <p className="text-xs text-slate-400 font-mono">Contract weighting on selected date: {selectedDate}</p>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-semibold text-emerald-400">
              FUTURES
            </span>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mainFuturesOIData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {mainFuturesOIData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.3)" />
                  ))}
                </Pie>
                <Tooltip content={<SortedCustomTooltip formatter={(val) => formatRupeesCompact(val)} />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-[#0D121D]/90 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 shadow-terminal">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Index Options OI Distribution</h3>
              <p className="text-xs text-slate-400 font-mono">Option premium distribution across indices on: {selectedDate}</p>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-semibold text-cyan-400">
              OPTIONS
            </span>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mainOptionsOIData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {mainOptionsOIData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.3)" />
                  ))}
                </Pie>
                <Tooltip content={<SortedCustomTooltip formatter={(val) => formatRupeesCompact(val)} />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Deep Data Section */}
      <motion.div variants={itemVariants} className="bg-[#0D121D]/90 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 shadow-terminal space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <Eye className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">Index Strikes & Positioning Drilldown</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  DEEP DESK
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">Granular strike activity and day-over-day changes</p>
            </div>
          </div>
          
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

        {/* Strike Activity Cards */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-4 w-4 text-emerald-400" />
            <h4 className="text-sm font-mono uppercase tracking-wider font-semibold text-slate-300">
              Strike Activity Analysis ({selectedDate})
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {latestOptionsData.map(({ instrument, data }) => {
              if (!data) return null
              const instrumentName = instrument.replace(' OPTIONS', '')
              const buyStrike = roundToFifty(data.buy_str_act || 0)
              const sellStrike = roundToFifty(data.sell_str_act || 0)

              return (
                <div
                  key={instrument}
                  className="bg-[#111726]/70 border border-white/[0.08] hover:border-white/[0.16] rounded-xl p-4 transition-all"
                >
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/[0.06]">
                    <span className="text-sm font-bold text-white font-mono">{instrumentName}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      ACTIVE
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-[#161D2B]/80 p-2.5 rounded-lg border border-white/[0.04]">
                      <span className="text-[10px] text-slate-400 font-mono block uppercase">Buy Activity</span>
                      <span className="text-emerald-400 font-mono font-bold text-sm">
                        {formatIndianNumber(Math.round(data.buy_str_act || 0))}
                      </span>
                    </div>
                    <div className="bg-[#161D2B]/80 p-2.5 rounded-lg border border-white/[0.04]">
                      <span className="text-[10px] text-slate-400 font-mono block uppercase">Sell Activity</span>
                      <span className="text-rose-400 font-mono font-bold text-sm">
                        {formatIndianNumber(Math.round(data.sell_str_act || 0))}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 mb-3 text-xs font-mono">
                    <div className="flex justify-between items-center bg-emerald-500/5 px-2.5 py-1.5 rounded border border-emerald-500/10">
                      <span className="text-emerald-400 text-[11px] font-semibold">BUY LEVEL</span>
                      <span className="text-emerald-300 font-bold">{formatIndianNumber(buyStrike)}</span>
                    </div>
                    <div className="flex justify-between items-center bg-rose-500/5 px-2.5 py-1.5 rounded border border-rose-500/10">
                      <span className="text-rose-400 text-[11px] font-semibold">SELL LEVEL</span>
                      <span className="text-rose-300 font-bold">{formatIndianNumber(sellStrike)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1 pt-2 border-t border-white/[0.04] text-center font-mono">
                    <div>
                      <span className="text-slate-500 text-[9px] block uppercase">Buy Amt</span>
                      <span className="text-emerald-400 text-[11px] font-semibold">{formatAmountInCrores(data.buy_amt_adj || 0)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[9px] block uppercase">Sell Amt</span>
                      <span className="text-rose-400 text-[11px] font-semibold">{formatAmountInCrores(data.sell_amt_adj || 0)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[9px] block uppercase">OI Amt</span>
                      <span className="text-cyan-400 text-[11px] font-semibold">{formatAmountInCrores(data.oi_amt_adj || 0)}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Day-over-day sentiment comparison */}
        <div className="pt-4 border-t border-white/[0.08]">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4 text-cyan-400" />
            <h4 className="text-sm font-mono uppercase tracking-wider font-semibold text-slate-300">
              Session-Over-Session Comparison ({selectedDate} vs {previousDate})
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {indexOptions.map(option => {
              const latestData = data.find(item => item.date === selectedDate && item.instrument === option)
              const prevData = data.find(item => item.date === previousDate && item.instrument === option)
              if (!latestData || !prevData) return null

              const buyDiff = (latestData.buy_amt_adj || 0) - (prevData.buy_amt_adj || 0)
              const sellDiff = (latestData.sell_amt_adj || 0) - (prevData.sell_amt_adj || 0)
              const oiDiff = (latestData.oi_amt_adj || 0) - (prevData.oi_amt_adj || 0)
              const instName = option.replace(' OPTIONS', '')

              return (
                <div key={option} className="bg-[#111726]/70 border border-white/[0.08] rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                    <span className="text-sm font-bold text-white font-mono">{instName}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${buyDiff > sellDiff ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                      {buyDiff > sellDiff ? 'NET BUYER' : 'NET SELLER'}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Buy Turnover Change:</span>
                      <span className={buyDiff >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {buyDiff >= 0 ? '+' : ''}{formatAmountInCrores(buyDiff)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Sell Turnover Change:</span>
                      <span className={sellDiff >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {sellDiff >= 0 ? '+' : ''}{formatAmountInCrores(sellDiff)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">OI Valuation Change:</span>
                      <span className={oiDiff >= 0 ? 'text-cyan-400 font-bold' : 'text-rose-400 font-bold'}>
                        {oiDiff >= 0 ? '+' : ''}{formatAmountInCrores(oiDiff)}
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#161D2B] border border-white/[0.04]">
                    <p className="text-[11px] font-mono text-slate-300 leading-relaxed">
                      {generateInsight(latestData, prevData)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </motion.div>

      {/* Data Table */}
      <motion.div variants={itemVariants}>
        <DataTable
          data={data}
          columns={columns}
          title="FII Derivatives Master Records"
          defaultSortKey="date"
          defaultSortDirection="desc"
        />
      </motion.div>
    </motion.div>
  )
}

export default FIIDerivStatsPage