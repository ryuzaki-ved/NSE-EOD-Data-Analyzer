import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import DataTable from '../components/DataTable'
import MetricCard from '../components/MetricCard'
import { Users, TrendingUp, PieChart as PieChartIcon, Activity, Eye, Target, Calendar } from 'lucide-react'
import DeepInsights from '../components/DeepInsightsPartOI'
import { calculateRatio, getRatioClass, formatRatio, formatIndianNumber, formatDifference } from '../utils/partOIHelpers'
import LongVsShortTrendChart from '../components/partOI/LongVsShortTrendChart'
import ClientTypeDistributionPie from '../components/partOI/ClientTypeDistributionPie'
import OptionsLongVsShortChart from '../components/partOI/OptionsLongVsShortChart'
import WeeklyOptionsCumulativeChart from '../components/partOI/WeeklyOptionsCumulativeChart'
import FutureIndexOIBarChart from '../components/partOI/FutureIndexOIBarChart'
import OptionIndexOIBarChart from '../components/partOI/OptionIndexOIBarChart'
import DailyFutureChangeChart from '../components/partOI/DailyFutureChangeChart'
import MonthlyFutureCumulativeChart from '../components/partOI/MonthlyFutureCumulativeChart'
import CorrelationInsights from '../components/CorrelationInsights'

const PartOIPage = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedClientType, setSelectedClientType] = useState('ALL')
  const [deepInsightsLatestDate, setDeepInsightsLatestDate] = useState('')
  const [deepInsightsPreviousDate, setDeepInsightsPreviousDate] = useState('')

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

  // Initialize Deep Insights dates when data is loaded
  useEffect(() => {
    if (data.length > 0 && !deepInsightsLatestDate) {
      const dates = [...new Set(data.map(item => item.date))].sort((a, b) => {
        const [dayA, monthA, yearA] = a.split('-')
        const [dayB, monthB, yearB] = b.split('-')
        const dateA = new Date(`${yearA}-${monthA}-${dayA}`)
        const dateB = new Date(`${yearB}-${monthB}-${dayB}`)
        return dateB - dateA
      })

      if (dates.length > 0) {
        setDeepInsightsLatestDate(dates[0])
        setDeepInsightsPreviousDate(dates[1] || dates[0])
      }
    }
  }, [data, deepInsightsLatestDate])

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
        // Add option index data for the new chart
        existingDate[item.client_type + '_option_index_call_long'] = item.option_index_call_long
        existingDate[item.client_type + '_option_index_put_long'] = item.option_index_put_long
        existingDate[item.client_type + '_option_index_call_short'] = item.option_index_call_short
        existingDate[item.client_type + '_option_index_put_short'] = item.option_index_put_short
        // Add future index data for new charts
        existingDate[item.client_type + '_future_index_long'] = item.future_index_long
        existingDate[item.client_type + '_future_index_short'] = item.future_index_short
      } else {
        const dateEntry = { date: item.date }
        dateEntry[item.client_type + '_long'] = item.total_long_contracts
        dateEntry[item.client_type + '_short'] = item.total_short_contracts
        // Add option index data for the new chart
        dateEntry[item.client_type + '_option_index_call_long'] = item.option_index_call_long
        dateEntry[item.client_type + '_option_index_put_long'] = item.option_index_put_long
        dateEntry[item.client_type + '_option_index_call_short'] = item.option_index_call_short
        dateEntry[item.client_type + '_option_index_put_short'] = item.option_index_put_short
        // Add future index data for new charts
        dateEntry[item.client_type + '_future_index_long'] = item.future_index_long
        dateEntry[item.client_type + '_future_index_short'] = item.future_index_short
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

  // Prepare ratio data for Deep Insights (using local Deep Insights state dates)
  const deepInsightsLatestData = data.filter(item => item.date === deepInsightsLatestDate && item.client_type !== 'TOTAL')

  // Get previous date data for daily changes (using local Deep Insights state dates)
  const availableDates = [...new Set(data.map(item => item.date))].sort((a, b) => {
    // Convert DD-MM-YYYY to YYYY-MM-DD for proper date comparison
    const [dayA, monthA, yearA] = a.split('-')
    const [dayB, monthB, yearB] = b.split('-')
    const dateA = new Date(`${yearA}-${monthA}-${dayA}`)
    const dateB = new Date(`${yearB}-${monthB}-${dayB}`)
    return dateB - dateA
  })

  const deepInsightsPreviousData = data.filter(item => item.date === deepInsightsPreviousDate && item.client_type !== 'TOTAL')

  const ratioData = deepInsightsLatestData.map(item => {
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

  // Prepare daily change data
  const dailyChangeData = deepInsightsLatestData.map(item => {
    const prevItem = deepInsightsPreviousData.find(prev => prev.client_type === item.client_type) || {
      option_index_call_long: 0,
      option_index_put_long: 0,
      option_index_call_short: 0,
      option_index_put_short: 0
    }

    const callLongDiff = item.option_index_call_long - prevItem.option_index_call_long
    const putLongDiff = item.option_index_put_long - prevItem.option_index_put_long
    const callShortDiff = item.option_index_call_short - prevItem.option_index_call_short
    const putShortDiff = item.option_index_put_short - prevItem.option_index_put_short

    const callBuyPutBuy = calculateRatio(callLongDiff, putLongDiff)
    const callBuyCallSell = calculateRatio(callLongDiff, callShortDiff)
    const putSellPutBuy = calculateRatio(putShortDiff, putLongDiff)
    const putSellCallSell = calculateRatio(putShortDiff, callShortDiff)

    return {
      clientType: item.client_type,
      callLongDiff,
      putLongDiff,
      callShortDiff,
      putShortDiff,
      callBuyPutBuy,
      callBuyCallSell,
      putSellPutBuy,
      putSellCallSell
    }
  })

  // Generate insights based on ratios with rich formatting
  const generateInsights = () => {
    const insights = []

    ratioData.forEach(({ clientType, callBuyPutBuy, callBuyCallSell, putSellPutBuy, putSellCallSell }) => {
      // Skip insights for 0.00 ratios
      if (callBuyPutBuy === 0 || callBuyCallSell === 0 || putSellPutBuy === 0 || putSellCallSell === 0) return

      // Call Buy/Put Buy insights (Bullish vs Bearish bias)
      if (callBuyPutBuy > 1.5) {
        insights.push(
          <div key={`${clientType}-bullish`} className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0 animate-pulse"></div>
            <p className="text-gray-300 text-sm leading-relaxed">
              <span className="text-green-400 font-bold underline">{clientType}</span> shows{' '}
              <span className="text-green-400 font-bold">strong bullish bias</span> with Call Buy/Put Buy ratio of{' '}
              <span className="text-green-400 font-bold">{formatRatio(callBuyPutBuy)}</span>
            </p>
          </div>
        )
      } else if (callBuyPutBuy < 0.7) {
        insights.push(
          <div key={`${clientType}-bearish`} className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0 animate-pulse"></div>
            <p className="text-gray-300 text-sm leading-relaxed">
              <span className="text-red-400 font-bold underline">{clientType}</span> shows{' '}
              <span className="text-red-400 font-bold">strong bearish bias</span> with Call Buy/Put Buy ratio of{' '}
              <span className="text-red-400 font-bold">{formatRatio(callBuyPutBuy)}</span>
            </p>
          </div>
        )
      }

      // Call Buy/Call Sell insights (Long vs Short positioning)
      if (callBuyCallSell > 1.5) {
        insights.push(
          <div key={`${clientType}-long-calls`} className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0 animate-pulse"></div>
            <p className="text-gray-300 text-sm leading-relaxed">
              <span className="text-blue-400 font-bold underline">{clientType}</span> has{' '}
              <span className="text-blue-400 font-bold">aggressive long call positioning</span> with ratio{' '}
              <span className="text-blue-400 font-bold">{formatRatio(callBuyCallSell)}</span>
            </p>
          </div>
        )
      } else if (callBuyCallSell < 0.7) {
        insights.push(
          <div key={`${clientType}-short-calls`} className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0 animate-pulse"></div>
            <p className="text-gray-300 text-sm leading-relaxed">
              <span className="text-orange-400 font-bold underline">{clientType}</span> is{' '}
              <span className="text-orange-400 font-bold">heavily short on calls</span> with ratio{' '}
              <span className="text-orange-400 font-bold">{formatRatio(callBuyCallSell)}</span>
            </p>
          </div>
        )
      }

      // Put Sell/Put Buy insights (Put writing vs Put buying)
      if (putSellPutBuy > 1.5) {
        insights.push(
          <div key={`${clientType}-put-writing`} className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0 animate-pulse"></div>
            <p className="text-gray-300 text-sm leading-relaxed">
              <span className="text-purple-400 font-bold underline">{clientType}</span> is{' '}
              <span className="text-purple-400 font-bold">aggressively writing puts</span>{' '}
              <span className="text-green-400 font-bold">(bullish)</span> with ratio{' '}
              <span className="text-purple-400 font-bold">{formatRatio(putSellPutBuy)}</span>
            </p>
          </div>
        )
      } else if (putSellPutBuy < 0.7) {
        insights.push(
          <div key={`${clientType}-put-buying`} className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-pink-400 rounded-full mt-2 flex-shrink-0 animate-pulse"></div>
            <p className="text-gray-300 text-sm leading-relaxed">
              <span className="text-pink-400 font-bold underline">{clientType}</span> is{' '}
              <span className="text-pink-400 font-bold">heavily buying puts</span>{' '}
              <span className="text-red-400 font-bold">(bearish)</span> with ratio{' '}
              <span className="text-pink-400 font-bold">{formatRatio(putSellPutBuy)}</span>
            </p>
          </div>
        )
      }

      // Put Sell/Call Sell insights (Put vs Call writing preference)
      if (putSellCallSell > 1.2) {
        insights.push(
          <div key={`${clientType}-prefer-puts`} className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-gray-300 text-sm leading-relaxed">
              <span className="text-cyan-400 font-bold underline">{clientType}</span>{' '}
              <span className="text-cyan-400 font-bold">prefers put writing</span> over call writing with ratio{' '}
              <span className="text-cyan-400 font-bold">{formatRatio(putSellCallSell)}</span>
            </p>
          </div>
        )
      } else if (putSellCallSell < 0.8) {
        insights.push(
          <div key={`${clientType}-prefer-calls`} className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-gray-300 text-sm leading-relaxed">
              <span className="text-yellow-400 font-bold underline">{clientType}</span>{' '}
              <span className="text-yellow-400 font-bold">prefers call writing</span> over put writing with ratio{' '}
              <span className="text-yellow-400 font-bold">{formatRatio(putSellCallSell)}</span>
            </p>
          </div>
        )
      }
    })

    return insights.length > 0 ? insights : [
      <div key="balanced" className="flex items-start space-x-3">
        <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
        <p className="text-gray-300 text-sm leading-relaxed">
          Market positioning appears <span className="text-gray-400 font-bold">balanced</span> across all participant categories
        </p>
      </div>
    ]
  }

  // Generate daily change insights with rich formatting
  const generateDailyChangeInsights = () => {
    const insights = []

    dailyChangeData.forEach(({ clientType, callBuyPutBuy, callBuyCallSell, putSellPutBuy, putSellCallSell, callLongDiff, putLongDiff, callShortDiff, putShortDiff }) => {
      // Skip insights for 0.00 ratios
      if (callBuyPutBuy === 0 || callBuyCallSell === 0 || putSellPutBuy === 0 || putSellCallSell === 0) return

      // Detailed analysis for Call Buy / Put Buy (Negative Values)
      if (callLongDiff < 0 && putLongDiff >= 0) {
        // Numerator Negative (Call Buy Negative): Bearish
        insights.push(
          <div key={`${clientType}-call-buy-negative`} className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-gray-300 text-sm leading-relaxed">
              <span className="text-red-400 font-bold underline">{clientType}</span> shows{' '}
              <span className="text-red-400 font-bold">bearish sentiment</span> - declining call buying ({formatDifference(callLongDiff)}) signals{' '}
              <span className="text-red-400 font-bold">weakening bullish sentiment</span>
            </p>
          </div>
        )
      } else if (callLongDiff >= 0 && putLongDiff < 0) {
        // Denominator Negative (Put Buy Negative): Bullish
        insights.push(
          <div key={`${clientType}-put-buy-negative`} className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-gray-300 text-sm leading-relaxed">
              <span className="text-green-400 font-bold underline">{clientType}</span> shows{' '}
              <span className="text-green-400 font-bold">bullish sentiment</span> - less put buying ({formatDifference(putLongDiff)}) suggests{' '}
              <span className="text-green-400 font-bold">reduced bearish sentiment</span>
            </p>
          </div>
        )
      } else if (callLongDiff < 0 && putLongDiff < 0) {
        // Both Negative: Analyze magnitudes
        if (Math.abs(callLongDiff) > Math.abs(putLongDiff)) {
          // Numerator Negative > Denominator Negative: Moderately Bearish
          insights.push(
            <div key={`${clientType}-call-put-both-neg-mod-bear`} className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0 animate-pulse"></div>
              <p className="text-gray-300 text-sm leading-relaxed">
                <span className="text-red-400 font-bold underline">{clientType}</span> shows{' '}
                <span className="text-red-400 font-bold animate-pulse">moderately bearish</span> sentiment - stronger decline in call buying ({formatDifference(callLongDiff)}) vs put buying ({formatDifference(putLongDiff)}) indicates{' '}
                <span className="text-red-400 font-bold">deeper bearishness</span>
              </p>
            </div>
          )
        } else if (Math.abs(callLongDiff) < Math.abs(putLongDiff)) {
          // Numerator Negative < Denominator Negative: Mildly Bearish
          insights.push(
            <div key={`${clientType}-call-put-both-neg-mild-bear`} className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-gray-300 text-sm leading-relaxed">
                <span className="text-orange-400 font-bold underline">{clientType}</span> shows{' '}
                <span className="text-orange-400 font-bold">mildly bearish</span> sentiment - call buying decline ({formatDifference(callLongDiff)}) less than put buying decline ({formatDifference(putLongDiff)}), suggesting{' '}
                <span className="text-orange-400 font-bold">mild bearishness</span>
              </p>
            </div>
          )
        } else {
          // Both Negative: Equal magnitudes
          insights.push(
            <div key={`${clientType}-call-put-both-neg-equal`} className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-gray-300 text-sm leading-relaxed">
                <span className="text-red-400 font-bold underline">{clientType}</span> shows{' '}
                <span className="text-red-400 font-bold">moderately bearish</span> sentiment - both call and put buying decreasing equally, indicating{' '}
                <span className="text-red-400 font-bold">weaker market interest</span>
              </p>
            </div>
          )
        }
      }

      // Detailed analysis for Call Buy / Call Sell (Negative Values)
      if (callLongDiff < 0 && callShortDiff >= 0) {
        // Numerator Negative (Call Buy Negative): Bearish
        insights.push(
          <div key={`${clientType}-call-buy-sell-neg`} className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-gray-300 text-sm leading-relaxed">
              <span className="text-red-400 font-bold underline">{clientType}</span> shows{' '}
              <span className="text-red-400 font-bold">bearish activity</span> - declining call buying ({formatDifference(callLongDiff)}) reflects{' '}
              <span className="text-red-400 font-bold">reduced bullish activity</span>
            </p>
          </div>
        )
      } else if (callLongDiff >= 0 && callShortDiff < 0) {
        // Denominator Negative (Call Sell Negative): Bullish
        insights.push(
          <div key={`${clientType}-call-sell-neg`} className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-gray-300 text-sm leading-relaxed">
              <span className="text-green-400 font-bold underline">{clientType}</span> shows{' '}
              <span className="text-green-400 font-bold">bullish sentiment</span> - less call selling ({formatDifference(callShortDiff)}) signals{' '}
              <span className="text-green-400 font-bold">reduced bearish sentiment</span>
            </p>
          </div>
        )
      } else if (callLongDiff < 0 && callShortDiff < 0) {
        // Both Negative: Analyze magnitudes
        if (Math.abs(callLongDiff) > Math.abs(callShortDiff)) {
          // Numerator Negative > Denominator Negative: Strongly Bearish
          insights.push(
            <div key={`${clientType}-call-both-neg-strong-bear`} className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0 animate-pulse"></div>
              <p className="text-gray-300 text-sm leading-relaxed">
                <span className="text-red-400 font-bold underline">{clientType}</span> shows{' '}
                <span className="text-red-400 font-bold animate-pulse">strongly bearish</span> sentiment - significant drop in call buying ({formatDifference(callLongDiff)}) vs call selling ({formatDifference(callShortDiff)}) shows{' '}
                <span className="text-red-400 font-bold">stronger bearish sentiment</span>
              </p>
            </div>
          )
        } else if (Math.abs(callLongDiff) < Math.abs(callShortDiff)) {
          // Numerator Negative < Denominator Negative: Mildly Bearish
          insights.push(
            <div key={`${clientType}-call-both-neg-mild-bear`} className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-gray-300 text-sm leading-relaxed">
                <span className="text-orange-400 font-bold underline">{clientType}</span> shows{' '}
                <span className="text-orange-400 font-bold">mildly bearish</span> sentiment - call buying decline ({formatDifference(callLongDiff)}) less than call selling decline ({formatDifference(callShortDiff)}), showing{' '}
                <span className="text-orange-400 font-bold">some remaining bullishness</span>
              </p>
            </div>
          )
        } else {
          // Both Negative: Equal magnitudes
          insights.push(
            <div key={`${clientType}-call-both-neg-equal`} className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-gray-300 text-sm leading-relaxed">
                <span className="text-red-400 font-bold underline">{clientType}</span> shows{' '}
                <span className="text-red-400 font-bold">moderately bearish</span> sentiment - both call buying and selling decrease equally, signaling{' '}
                <span className="text-red-400 font-bold">market indecisiveness</span>
              </p>
            </div>
          )
        }
      }

      // Detailed analysis for Put Sell / Put Buy (Negative Values)
      if (putShortDiff < 0 && putLongDiff >= 0) {
        // Numerator Negative (Put Sell Negative): Bullish
        insights.push(
          <div key={`${clientType}-put-sell-neg`} className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-gray-300 text-sm leading-relaxed">
              <span className="text-green-400 font-bold underline">{clientType}</span> shows{' '}
              <span className="text-green-400 font-bold">bullish sentiment</span> - fewer puts being sold ({formatDifference(putShortDiff)}) suggests{' '}
              <span className="text-green-400 font-bold">less bearish market sentiment</span>
            </p>
          </div>
        )
      } else if (putShortDiff >= 0 && putLongDiff < 0) {
        // Denominator Negative (Put Buy Negative): Bearish
        insights.push(
          <div key={`${clientType}-put-buy-sell-neg`} className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-gray-300 text-sm leading-relaxed">
              <span className="text-red-400 font-bold underline">{clientType}</span> shows{' '}
              <span className="text-red-400 font-bold">bearish sentiment</span> - reduced put buying ({formatDifference(putLongDiff)}) signals{' '}
              <span className="text-red-400 font-bold">reduced hedging activity</span>
            </p>
          </div>
        )
      } else if (putShortDiff < 0 && putLongDiff < 0) {
        // Both Negative: Analyze magnitudes (Note: Both Negative is Moderately Bullish for Put Sell/Put Buy)
        if (Math.abs(putShortDiff) > Math.abs(putLongDiff)) {
          // Numerator Negative > Denominator Negative: Moderately Bullish
          insights.push(
            <div key={`${clientType}-put-both-neg-mod-bull`} className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0 animate-pulse"></div>
              <p className="text-gray-300 text-sm leading-relaxed">
                <span className="text-green-400 font-bold underline">{clientType}</span> shows{' '}
                <span className="text-green-400 font-bold animate-pulse">moderately bullish</span> sentiment - put selling falls more ({formatDifference(putShortDiff)}) than put buying ({formatDifference(putLongDiff)}), indicating{' '}
                <span className="text-green-400 font-bold">stronger bullish reversal</span>
              </p>
            </div>
          )
        } else if (Math.abs(putShortDiff) < Math.abs(putLongDiff)) {
          // Numerator Negative < Denominator Negative: Mildly Bullish
          insights.push(
            <div key={`${clientType}-put-both-neg-mild-bull`} className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-gray-300 text-sm leading-relaxed">
                <span className="text-cyan-400 font-bold underline">{clientType}</span> shows{' '}
                <span className="text-cyan-400 font-bold">mildly bullish</span> sentiment - put selling declines less ({formatDifference(putShortDiff)}) than put buying ({formatDifference(putLongDiff)}), signaling{' '}
                <span className="text-cyan-400 font-bold">weaker bullish shift</span>
              </p>
            </div>
          )
        } else {
          // Both Negative: Equal magnitudes - Moderately Bullish
          insights.push(
            <div key={`${clientType}-put-both-neg-equal-bull`} className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-gray-300 text-sm leading-relaxed">
                <span className="text-green-400 font-bold underline">{clientType}</span> shows{' '}
                <span className="text-green-400 font-bold">moderately bullish</span> sentiment - both put selling and buying decreasing equally, showing{' '}
                <span className="text-green-400 font-bold">less bearish activity and potential upside</span>
              </p>
            </div>
          )
        }
      }

      // Detailed analysis for Put Sell / Call Sell (Negative Values)
      if (putShortDiff < 0 && callShortDiff >= 0) {
        // Numerator Negative (Put Sell Negative): Bullish
        insights.push(
          <div key={`${clientType}-put-call-sell-neg`} className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-gray-300 text-sm leading-relaxed">
              <span className="text-green-400 font-bold underline">{clientType}</span> shows{' '}
              <span className="text-green-400 font-bold">bullish sentiment</span> - less put selling ({formatDifference(putShortDiff)}) shows{' '}
              <span className="text-green-400 font-bold">reduced bearish sentiment</span>
            </p>
          </div>
        )
      } else if (putShortDiff >= 0 && callShortDiff < 0) {
        // Denominator Negative (Call Sell Negative): Bearish
        insights.push(
          <div key={`${clientType}-call-sell-put-neg`} className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-gray-300 text-sm leading-relaxed">
              <span className="text-red-400 font-bold underline">{clientType}</span> shows{' '}
              <span className="text-red-400 font-bold">bearish sentiment</span> - fewer calls being sold ({formatDifference(callShortDiff)}) signals{' '}
              <span className="text-red-400 font-bold">reduced bearish sentiment in market</span>
            </p>
          </div>
        )
      } else if (putShortDiff < 0 && callShortDiff < 0) {
        // Both Negative: Analyze magnitudes (Note: Both Negative is Moderately Bullish for Put Sell/Call Sell)
        if (Math.abs(putShortDiff) > Math.abs(callShortDiff)) {
          // Numerator Negative > Denominator Negative: Moderately Bullish
          insights.push(
            <div key={`${clientType}-put-call-sell-both-neg-mod-bull`} className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0 animate-pulse"></div>
              <p className="text-gray-300 text-sm leading-relaxed">
                <span className="text-green-400 font-bold underline">{clientType}</span> shows{' '}
                <span className="text-green-400 font-bold animate-pulse">moderately bullish</span> sentiment - put selling declines more ({formatDifference(putShortDiff)}) than call selling ({formatDifference(callShortDiff)}), signaling{' '}
                <span className="text-green-400 font-bold">greater bullish pressure</span>
              </p>
            </div>
          )
        } else if (Math.abs(putShortDiff) < Math.abs(callShortDiff)) {
          // Numerator Negative < Denominator Negative: Mildly Bullish
          insights.push(
            <div key={`${clientType}-put-call-sell-both-neg-mild-bull`} className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-gray-300 text-sm leading-relaxed">
                <span className="text-cyan-400 font-bold underline">{clientType}</span> shows{' '}
                <span className="text-cyan-400 font-bold">mildly bullish</span> sentiment - put selling drops less ({formatDifference(putShortDiff)}) than call selling ({formatDifference(callShortDiff)}), indicating{' '}
                <span className="text-cyan-400 font-bold">weak bullish sentiment</span>
              </p>
            </div>
          )
        } else {
          // Both Negative: Equal magnitudes - Moderately Bullish
          insights.push(
            <div key={`${clientType}-put-call-sell-both-neg-equal-bull`} className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-gray-300 text-sm leading-relaxed">
                <span className="text-green-400 font-bold underline">{clientType}</span> shows{' '}
                <span className="text-green-400 font-bold">moderately bullish</span> sentiment - both put and call selling decrease equally, signaling{' '}
                <span className="text-green-400 font-bold">less bearish activity and potential upside</span>
              </p>
            </div>
          )
        }
      }

      // Daily Call Buy/Put Buy insights
      if (callBuyPutBuy > 1.5) {
        insights.push(
          <div key={`${clientType}-daily-bullish`} className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0 animate-pulse"></div>
            <p className="text-gray-300 text-sm leading-relaxed">
              <span className="text-green-400 font-bold underline">{clientType}</span> added{' '}
              <span className="text-green-400 font-bold">strong bullish positions</span> today with Call/Put ratio of{' '}
              <span className="text-green-400 font-bold">{formatRatio(callBuyPutBuy)}</span>
            </p>
          </div>
        )
      } else if (callBuyPutBuy < 0.7) {
        insights.push(
          <div key={`${clientType}-daily-bearish`} className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0 animate-pulse"></div>
            <p className="text-gray-300 text-sm leading-relaxed">
              <span className="text-red-400 font-bold underline">{clientType}</span> added{' '}
              <span className="text-red-400 font-bold">strong bearish positions</span> today with Call/Put ratio of{' '}
              <span className="text-red-400 font-bold">{formatRatio(callBuyPutBuy)}</span>
            </p>
          </div>
        )
      }

      // Daily position building/unwinding insights
      if (callLongDiff > 0 && putLongDiff < 0) {
        insights.push(
          <div key={`${clientType}-bullish-shift`} className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-gray-300 text-sm leading-relaxed">
              <span className="text-blue-400 font-bold underline">{clientType}</span> showed{' '}
              <span className="text-blue-400 font-bold">bullish shift</span> - added calls ({formatDifference(callLongDiff)}) and reduced puts ({formatDifference(putLongDiff)})
            </p>
          </div>
        )
      } else if (callLongDiff < 0 && putLongDiff > 0) {
        insights.push(
          <div key={`${clientType}-bearish-shift`} className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-gray-300 text-sm leading-relaxed">
              <span className="text-orange-400 font-bold underline">{clientType}</span> showed{' '}
              <span className="text-orange-400 font-bold">bearish shift</span> - reduced calls ({formatDifference(callLongDiff)}) and added puts ({formatDifference(putLongDiff)})
            </p>
          </div>
        )
      }

      // Aggressive position changes
      if (Math.abs(callLongDiff) > 100000 || Math.abs(putLongDiff) > 100000) {
        insights.push(
          <div key={`${clientType}-aggressive`} className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0 animate-pulse"></div>
            <p className="text-gray-300 text-sm leading-relaxed">
              <span className="text-purple-400 font-bold underline">{clientType}</span> made{' '}
              <span className="text-purple-400 font-bold">aggressive position changes</span> today with significant OI movements
            </p>
          </div>
        )
      }

      // Unwinding insights
      if (callShortDiff < 0 && putShortDiff < 0) {
        insights.push(
          <div key={`${clientType}-unwinding`} className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-gray-300 text-sm leading-relaxed">
              <span className="text-yellow-400 font-bold underline">{clientType}</span> showed{' '}
              <span className="text-yellow-400 font-bold">position unwinding</span> - reduced both call and put shorts
            </p>
          </div>
        )
      }
    })

    return insights.length > 0 ? insights : [
      <div key="minimal-changes" className="flex items-start space-x-3">
        <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
        <p className="text-gray-300 text-sm leading-relaxed">
          <span className="text-gray-400 font-bold">Minimal position changes</span> observed across participant categories today
        </p>
      </div>
    ]
  }

  // Grouped insights by participant
  const generateGroupedInsights = () => {
    const grouped = {};
    ratioData.forEach(({ clientType, callBuyPutBuy, callBuyCallSell, putSellPutBuy, putSellCallSell }) => {
      const insights = [];
      if (callBuyPutBuy === 0 || callBuyCallSell === 0 || putSellPutBuy === 0 || putSellCallSell === 0) return;
      if (callBuyPutBuy > 1.5) {
        insights.push(
          <div key={`${clientType}-bullish`} className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0 animate-pulse"></div>
            <p className="text-gray-300 text-sm leading-relaxed">
              <span className="text-green-400 font-bold underline">{clientType}</span> shows{' '}
              <span className="text-green-400 font-bold">strong bullish bias</span> with Call Buy/Put Buy ratio of{' '}
              <span className="text-green-400 font-bold">{formatRatio(callBuyPutBuy)}</span>
            </p>
          </div>
        );
      } else if (callBuyPutBuy < 0.7) {
        insights.push(
          <div key={`${clientType}-bearish`} className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0 animate-pulse"></div>
            <p className="text-gray-300 text-sm leading-relaxed">
              <span className="text-red-400 font-bold underline">{clientType}</span> shows{' '}
              <span className="text-red-400 font-bold">strong bearish bias</span> with Call Buy/Put Buy ratio of{' '}
              <span className="text-red-400 font-bold">{formatRatio(callBuyPutBuy)}</span>
            </p>
          </div>
        );
      }
      if (callBuyCallSell > 1.5) {
        insights.push(
          <div key={`${clientType}-long-calls`} className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0 animate-pulse"></div>
            <p className="text-gray-300 text-sm leading-relaxed">
              <span className="text-blue-400 font-bold underline">{clientType}</span> has{' '}
              <span className="text-blue-400 font-bold">aggressive long call positioning</span> with ratio{' '}
              <span className="text-blue-400 font-bold">{formatRatio(callBuyCallSell)}</span>
            </p>
          </div>
        );
      } else if (callBuyCallSell < 0.7) {
        insights.push(
          <div key={`${clientType}-short-calls`} className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0 animate-pulse"></div>
            <p className="text-gray-300 text-sm leading-relaxed">
              <span className="text-orange-400 font-bold underline">{clientType}</span> is{' '}
              <span className="text-orange-400 font-bold">heavily short on calls</span> with ratio{' '}
              <span className="text-orange-400 font-bold">{formatRatio(callBuyCallSell)}</span>
            </p>
          </div>
        );
      }
      if (putSellPutBuy > 1.5) {
        insights.push(
          <div key={`${clientType}-put-writing`} className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0 animate-pulse"></div>
            <p className="text-gray-300 text-sm leading-relaxed">
              <span className="text-purple-400 font-bold underline">{clientType}</span> is{' '}
              <span className="text-purple-400 font-bold">aggressively writing puts</span>{' '}
              <span className="text-green-400 font-bold">(bullish)</span> with ratio{' '}
              <span className="text-purple-400 font-bold">{formatRatio(putSellPutBuy)}</span>
            </p>
          </div>
        );
      } else if (putSellPutBuy < 0.7) {
        insights.push(
          <div key={`${clientType}-put-buying`} className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-pink-400 rounded-full mt-2 flex-shrink-0 animate-pulse"></div>
            <p className="text-gray-300 text-sm leading-relaxed">
              <span className="text-pink-400 font-bold underline">{clientType}</span> is{' '}
              <span className="text-pink-400 font-bold">heavily buying puts</span>{' '}
              <span className="text-red-400 font-bold">(bearish)</span> with ratio{' '}
              <span className="text-pink-400 font-bold">{formatRatio(putSellPutBuy)}</span>
            </p>
          </div>
        );
      }
      if (putSellCallSell > 1.2) {
        insights.push(
          <div key={`${clientType}-prefer-puts`} className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-gray-300 text-sm leading-relaxed">
              <span className="text-cyan-400 font-bold underline">{clientType}</span>{' '}
              <span className="text-cyan-400 font-bold">prefers put writing</span> over call writing with ratio{' '}
              <span className="text-cyan-400 font-bold">{formatRatio(putSellCallSell)}</span>
            </p>
          </div>
        );
      } else if (putSellCallSell < 0.8) {
        insights.push(
          <div key={`${clientType}-prefer-calls`} className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-gray-300 text-sm leading-relaxed">
              <span className="text-yellow-400 font-bold underline">{clientType}</span>{' '}
              <span className="text-yellow-400 font-bold">prefers call writing</span> over put writing with ratio{' '}
              <span className="text-yellow-400 font-bold">{formatRatio(putSellCallSell)}</span>
            </p>
          </div>
        );
      }
      if (insights.length > 0) {
        grouped[clientType] = insights;
      }
    });
    return grouped;
  };

  const generateGroupedDailyChangeInsights = () => {
    const grouped = {};
    dailyChangeData.forEach(({ clientType, callBuyPutBuy, callBuyCallSell, putSellPutBuy, putSellCallSell, callLongDiff, putLongDiff, callShortDiff, putShortDiff }) => {
      const insights = [];
      if (callBuyPutBuy === 0 || callBuyCallSell === 0 || putSellPutBuy === 0 || putSellCallSell === 0) return;
      // Detailed analysis for Call Buy / Put Buy (Negative Values)
      if (callLongDiff < 0 && putLongDiff >= 0) {
        insights.push(
          <div key={`${clientType}-call-buy-negative`} className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-gray-300 text-sm leading-relaxed">
              <span className="text-red-400 font-bold underline">{clientType}</span> shows{' '}
              <span className="text-red-400 font-bold">bearish sentiment</span> - declining call buying ({formatDifference(callLongDiff)}) signals{' '}
              <span className="text-red-400 font-bold">weakening bullish sentiment</span>
            </p>
          </div>
        );
      } else if (callLongDiff >= 0 && putLongDiff < 0) {
        insights.push(
          <div key={`${clientType}-put-buy-negative`} className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-gray-300 text-sm leading-relaxed">
              <span className="text-green-400 font-bold underline">{clientType}</span> shows{' '}
              <span className="text-green-400 font-bold">bullish sentiment</span> - less put buying ({formatDifference(putLongDiff)}) suggests{' '}
              <span className="text-green-400 font-bold">reduced bearish sentiment</span>
            </p>
          </div>
        );
      } else if (callLongDiff < 0 && putLongDiff < 0) {
        if (Math.abs(callLongDiff) > Math.abs(putLongDiff)) {
          insights.push(
            <div key={`${clientType}-call-put-both-neg-mod-bear`} className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0 animate-pulse"></div>
              <p className="text-gray-300 text-sm leading-relaxed">
                <span className="text-red-400 font-bold underline">{clientType}</span> shows{' '}
                <span className="text-red-400 font-bold animate-pulse">moderately bearish</span> sentiment - stronger decline in call buying ({formatDifference(callLongDiff)}) vs put buying ({formatDifference(putLongDiff)}) indicates{' '}
                <span className="text-red-400 font-bold">deeper bearishness</span>
              </p>
            </div>
          );
        } else if (Math.abs(callLongDiff) < Math.abs(putLongDiff)) {
          insights.push(
            <div key={`${clientType}-call-put-both-neg-mild-bear`} className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-gray-300 text-sm leading-relaxed">
                <span className="text-orange-400 font-bold underline">{clientType}</span> shows{' '}
                <span className="text-orange-400 font-bold">mildly bearish</span> sentiment - call buying decline ({formatDifference(callLongDiff)}) less than put buying decline ({formatDifference(putLongDiff)}), suggesting{' '}
                <span className="text-orange-400 font-bold">mild bearishness</span>
              </p>
            </div>
          );
        } else {
          insights.push(
            <div key={`${clientType}-call-put-both-neg-equal`} className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-gray-300 text-sm leading-relaxed">
                <span className="text-red-400 font-bold underline">{clientType}</span> shows{' '}
                <span className="text-red-400 font-bold">moderately bearish</span> sentiment - both call and put buying decreasing equally, indicating{' '}
                <span className="text-red-400 font-bold">weaker market interest</span>
              </p>
            </div>
          );
        }
      }
      // Call Buy / Call Sell
      if (callLongDiff < 0 && callShortDiff >= 0) {
        insights.push(
          <div key={`${clientType}-call-buy-sell-neg`} className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-gray-300 text-sm leading-relaxed">
              <span className="text-red-400 font-bold underline">{clientType}</span> shows{' '}
              <span className="text-red-400 font-bold">bearish activity</span> - declining call buying ({formatDifference(callLongDiff)}) reflects{' '}
              <span className="text-red-400 font-bold">reduced bullish activity</span>
            </p>
          </div>
        );
      } else if (callLongDiff >= 0 && callShortDiff < 0) {
        insights.push(
          <div key={`${clientType}-call-sell-neg`} className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-gray-300 text-sm leading-relaxed">
              <span className="text-green-400 font-bold underline">{clientType}</span> shows{' '}
              <span className="text-green-400 font-bold">bullish sentiment</span> - less call selling ({formatDifference(callShortDiff)}) signals{' '}
              <span className="text-green-400 font-bold">reduced bearish sentiment</span>
            </p>
          </div>
        );
      } else if (callLongDiff < 0 && callShortDiff < 0) {
        if (Math.abs(callLongDiff) > Math.abs(callShortDiff)) {
          insights.push(
            <div key={`${clientType}-call-both-neg-strong-bear`} className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0 animate-pulse"></div>
              <p className="text-gray-300 text-sm leading-relaxed">
                <span className="text-red-400 font-bold underline">{clientType}</span> shows{' '}
                <span className="text-red-400 font-bold animate-pulse">strongly bearish</span> sentiment - significant drop in call buying ({formatDifference(callLongDiff)}) vs call selling ({formatDifference(callShortDiff)}) shows{' '}
                <span className="text-red-400 font-bold">stronger bearish sentiment</span>
              </p>
            </div>
          );
        } else if (Math.abs(callLongDiff) < Math.abs(callShortDiff)) {
          insights.push(
            <div key={`${clientType}-call-both-neg-mild-bear`} className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-gray-300 text-sm leading-relaxed">
                <span className="text-orange-400 font-bold underline">{clientType}</span> shows{' '}
                <span className="text-orange-400 font-bold">mildly bearish</span> sentiment - call buying decline ({formatDifference(callLongDiff)}) less than call selling decline ({formatDifference(callShortDiff)}), showing{' '}
                <span className="text-orange-400 font-bold">some remaining bullishness</span>
              </p>
            </div>
          );
        } else {
          insights.push(
            <div key={`${clientType}-call-both-neg-equal`} className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-gray-300 text-sm leading-relaxed">
                <span className="text-red-400 font-bold underline">{clientType}</span> shows{' '}
                <span className="text-red-400 font-bold">moderately bearish</span> sentiment - both call buying and selling decrease equally, signaling{' '}
                <span className="text-red-400 font-bold">market indecisiveness</span>
              </p>
            </div>
          );
        }
      }
      // Put Sell / Put Buy
      if (putShortDiff < 0 && putLongDiff >= 0) {
        insights.push(
          <div key={`${clientType}-put-sell-neg`} className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-gray-300 text-sm leading-relaxed">
              <span className="text-green-400 font-bold underline">{clientType}</span> shows{' '}
              <span className="text-green-400 font-bold">bullish sentiment</span> - fewer puts being sold ({formatDifference(putShortDiff)}) suggests{' '}
              <span className="text-green-400 font-bold">less bearish market sentiment</span>
            </p>
          </div>
        );
      } else if (putShortDiff >= 0 && putLongDiff < 0) {
        insights.push(
          <div key={`${clientType}-put-buy-sell-neg`} className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-gray-300 text-sm leading-relaxed">
              <span className="text-red-400 font-bold underline">{clientType}</span> shows{' '}
              <span className="text-red-400 font-bold">bearish sentiment</span> - reduced put buying ({formatDifference(putLongDiff)}) signals{' '}
              <span className="text-red-400 font-bold">reduced hedging activity</span>
            </p>
          </div>
        );
      } else if (putShortDiff < 0 && putLongDiff < 0) {
        if (Math.abs(putShortDiff) > Math.abs(putLongDiff)) {
          insights.push(
            <div key={`${clientType}-put-both-neg-mod-bull`} className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0 animate-pulse"></div>
              <p className="text-gray-300 text-sm leading-relaxed">
                <span className="text-green-400 font-bold underline">{clientType}</span> shows{' '}
                <span className="text-green-400 font-bold animate-pulse">moderately bullish</span> sentiment - put selling falls more ({formatDifference(putShortDiff)}) than put buying ({formatDifference(putLongDiff)}), indicating{' '}
                <span className="text-green-400 font-bold">stronger bullish reversal</span>
              </p>
            </div>
          );
        } else if (Math.abs(putShortDiff) < Math.abs(putLongDiff)) {
          insights.push(
            <div key={`${clientType}-put-both-neg-mild-bull`} className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-gray-300 text-sm leading-relaxed">
                <span className="text-cyan-400 font-bold underline">{clientType}</span> shows{' '}
                <span className="text-cyan-400 font-bold">mildly bullish</span> sentiment - put selling declines less ({formatDifference(putShortDiff)}) than put buying ({formatDifference(putLongDiff)}), signaling{' '}
                <span className="text-cyan-400 font-bold">weaker bullish shift</span>
              </p>
            </div>
          );
        } else {
          insights.push(
            <div key={`${clientType}-put-both-neg-equal-bull`} className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-gray-300 text-sm leading-relaxed">
                <span className="text-green-400 font-bold underline">{clientType}</span> shows{' '}
                <span className="text-green-400 font-bold">moderately bullish</span> sentiment - both put selling and buying decreasing equally, showing{' '}
                <span className="text-green-400 font-bold">less bearish activity and potential upside</span>
              </p>
            </div>
          );
        }
      }
      // Put Sell / Call Sell
      if (putShortDiff < 0 && callShortDiff >= 0) {
        insights.push(
          <div key={`${clientType}-put-call-sell-neg`} className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-gray-300 text-sm leading-relaxed">
              <span className="text-green-400 font-bold underline">{clientType}</span> shows{' '}
              <span className="text-green-400 font-bold">bullish sentiment</span> - less put selling ({formatDifference(putShortDiff)}) shows{' '}
              <span className="text-green-400 font-bold">reduced bearish sentiment</span>
            </p>
          </div>
        );
      } else if (putShortDiff >= 0 && callShortDiff < 0) {
        insights.push(
          <div key={`${clientType}-call-sell-put-neg`} className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-gray-300 text-sm leading-relaxed">
              <span className="text-red-400 font-bold underline">{clientType}</span> shows{' '}
              <span className="text-red-400 font-bold">bearish sentiment</span> - fewer calls being sold ({formatDifference(callShortDiff)}) signals{' '}
              <span className="text-red-400 font-bold">reduced bearish sentiment in market</span>
            </p>
          </div>
        );
      } else if (putShortDiff < 0 && callShortDiff < 0) {
        if (Math.abs(putShortDiff) > Math.abs(callShortDiff)) {
          insights.push(
            <div key={`${clientType}-put-call-sell-both-neg-mod-bull`} className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0 animate-pulse"></div>
              <p className="text-gray-300 text-sm leading-relaxed">
                <span className="text-green-400 font-bold underline">{clientType}</span> shows{' '}
                <span className="text-green-400 font-bold animate-pulse">moderately bullish</span> sentiment - put selling declines more ({formatDifference(putShortDiff)}) than call selling ({formatDifference(callShortDiff)}), signaling{' '}
                <span className="text-green-400 font-bold">greater bullish pressure</span>
              </p>
            </div>
          );
        } else if (Math.abs(putShortDiff) < Math.abs(callShortDiff)) {
          insights.push(
            <div key={`${clientType}-put-call-sell-both-neg-mild-bull`} className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-gray-300 text-sm leading-relaxed">
                <span className="text-cyan-400 font-bold underline">{clientType}</span> shows{' '}
                <span className="text-cyan-400 font-bold">mildly bullish</span> sentiment - put selling drops less ({formatDifference(putShortDiff)}) than call selling ({formatDifference(callShortDiff)}), indicating{' '}
                <span className="text-cyan-400 font-bold">weak bullish sentiment</span>
              </p>
            </div>
          );
        } else {
          insights.push(
            <div key={`${clientType}-put-call-sell-both-neg-equal-bull`} className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-gray-300 text-sm leading-relaxed">
                <span className="text-green-400 font-bold underline">{clientType}</span> shows{' '}
                <span className="text-green-400 font-bold">moderately bullish</span> sentiment - both put and call selling decrease equally, signaling{' '}
                <span className="text-green-400 font-bold">less bearish activity and potential upside</span>
              </p>
            </div>
          );
        }
      }
      // Daily Call Buy/Put Buy insights
      if (callBuyPutBuy > 1.5) {
        insights.push(
          <div key={`${clientType}-daily-bullish`} className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0 animate-pulse"></div>
            <p className="text-gray-300 text-sm leading-relaxed">
              <span className="text-green-400 font-bold underline">{clientType}</span> added{' '}
              <span className="text-green-400 font-bold">strong bullish positions</span> today with Call/Put ratio of{' '}
              <span className="text-green-400 font-bold">{formatRatio(callBuyPutBuy)}</span>
            </p>
          </div>
        );
      } else if (callBuyPutBuy < 0.7) {
        insights.push(
          <div key={`${clientType}-daily-bearish`} className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0 animate-pulse"></div>
            <p className="text-gray-300 text-sm leading-relaxed">
              <span className="text-red-400 font-bold underline">{clientType}</span> added{' '}
              <span className="text-red-400 font-bold">strong bearish positions</span> today with Call/Put ratio of{' '}
              <span className="text-red-400 font-bold">{formatRatio(callBuyPutBuy)}</span>
            </p>
          </div>
        );
      }
      // Daily position building/unwinding insights
      if (callLongDiff > 0 && putLongDiff < 0) {
        insights.push(
          <div key={`${clientType}-bullish-shift`} className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-gray-300 text-sm leading-relaxed">
              <span className="text-blue-400 font-bold underline">{clientType}</span> showed{' '}
              <span className="text-blue-400 font-bold">bullish shift</span> - added calls ({formatDifference(callLongDiff)}) and reduced puts ({formatDifference(putLongDiff)})
            </p>
          </div>
        );
      } else if (callLongDiff < 0 && putLongDiff > 0) {
        insights.push(
          <div key={`${clientType}-bearish-shift`} className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-gray-300 text-sm leading-relaxed">
              <span className="text-orange-400 font-bold underline">{clientType}</span> showed{' '}
              <span className="text-orange-400 font-bold">bearish shift</span> - reduced calls ({formatDifference(callLongDiff)}) and added puts ({formatDifference(putLongDiff)})
            </p>
          </div>
        );
      }
      // Aggressive position changes
      if (Math.abs(callLongDiff) > 100000 || Math.abs(putLongDiff) > 100000) {
        insights.push(
          <div key={`${clientType}-aggressive`} className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0 animate-pulse"></div>
            <p className="text-gray-300 text-sm leading-relaxed">
              <span className="text-purple-400 font-bold underline">{clientType}</span> made{' '}
              <span className="text-purple-400 font-bold">aggressive position changes</span> today with significant OI movements
            </p>
          </div>
        );
      }
      // Unwinding insights
      if (callShortDiff < 0 && putShortDiff < 0) {
        insights.push(
          <div key={`${clientType}-unwinding`} className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-gray-300 text-sm leading-relaxed">
              <span className="text-yellow-400 font-bold underline">{clientType}</span> showed{' '}
              <span className="text-yellow-400 font-bold">position unwinding</span> - reduced both call and put shorts
            </p>
          </div>
        );
      }
      if (insights.length > 0) {
        grouped[clientType] = insights;
      }
    });
    return grouped;
  };

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
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center"
        variants={itemVariants}
      >
        <h1 className="text-3xl font-bold gradient-text mb-4 sm:mb-0">Participant Open Interest</h1>
        <select
          value={selectedClientType}
          onChange={(e) => setSelectedClientType(e.target.value)}
          className="px-4 py-2 bg-dark-800/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-200 backdrop-blur-sm"
        >
          {clientTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </motion.div>

      {/* Metrics Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}
      >
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
      </motion.div>

      {/* Charts */}
      <motion.div
        className="grid lg:grid-cols-2 gap-8"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="glass-card p-6 rounded-xl border border-white/5">
          <LongVsShortTrendChart chartData={chartData} />
        </motion.div>
        <motion.div variants={itemVariants} className="glass-card p-6 rounded-xl border border-white/5">
          <ClientTypeDistributionPie clientDistribution={clientDistribution} COLORS={COLORS} />
        </motion.div>
      </motion.div>

      {/* Participant Comparison Charts */}
      <motion.div
        className="grid lg:grid-cols-2 gap-8"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="glass-card p-6 rounded-xl border border-white/5">
          <FutureIndexOIBarChart clientDistribution={clientDistribution} data={data} latestDate={latestDate} />
        </motion.div>
        <motion.div variants={itemVariants} className="glass-card p-6 rounded-xl border border-white/5">
          <OptionIndexOIBarChart clientDistribution={clientDistribution} data={data} latestDate={latestDate} />
        </motion.div>
      </motion.div>

      {/* Future Change Charts */}
      <motion.div
        className="grid lg:grid-cols-2 gap-8"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="glass-card p-6 rounded-xl border border-white/5">
          <DailyFutureChangeChart chartData={chartData} />
        </motion.div>
        <motion.div variants={itemVariants} className="glass-card p-6 rounded-xl border border-white/5">
          <MonthlyFutureCumulativeChart chartData={chartData} />
        </motion.div>
      </motion.div>

      <motion.div
        className="grid lg:grid-cols-2 gap-8"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="glass-card p-6 rounded-xl border border-white/5">
          <OptionsLongVsShortChart chartData={chartData} />
        </motion.div>
        <motion.div variants={itemVariants} className="glass-card p-6 rounded-xl border border-white/5">
          <WeeklyOptionsCumulativeChart chartData={chartData} />
        </motion.div>
      </motion.div>

      {/* Deep Insights Section */}
      <motion.div variants={itemVariants}>
        <DeepInsights
          latestDate={deepInsightsLatestDate}
          previousDate={deepInsightsPreviousDate}
          ratioData={ratioData}
          dailyChangeData={dailyChangeData}
          generateInsights={generateInsights}
          generateDailyChangeInsights={generateDailyChangeInsights}
          groupedInsights={generateGroupedInsights()}
          groupedDailyChangeInsights={generateGroupedDailyChangeInsights()}
          data={data}
          availableDates={availableDates}
          onDateChange={(date) => {
            setDeepInsightsLatestDate(date)
            // Auto-update previous date to be the one immediately following the selected latest date
            const currentIndex = availableDates.indexOf(date)
            const nextDate = availableDates[currentIndex + 1] || availableDates[currentIndex]
            setDeepInsightsPreviousDate(nextDate)
          }}
          onPrevDateChange={setDeepInsightsPreviousDate}
        />
      </motion.div>

      {/* Correlation Insights */}
      <motion.div
        className="grid lg:grid-cols-3 gap-8"
        variants={containerVariants}
      >
        <motion.div className="lg:col-span-2" variants={itemVariants}>
          <CorrelationInsights participantData={data} />
        </motion.div>
        <motion.div className="lg:col-span-1" variants={itemVariants}>
          <div className="glass-card p-6 border border-blue-500/20 rounded-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <h3 className="text-lg font-semibold mb-4 text-blue-400 relative z-10">Correlation Analysis</h3>
            <p className="text-sm text-gray-400 mb-4 relative z-10">
              Discover relationships between different market participants and their trading patterns.
            </p>
            <a
              href="/correlation"
              className="inline-flex items-center px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors relative z-10"
            >
              View Full Analysis
            </a>
          </div>
        </motion.div>
      </motion.div>

      {/* Data Table */}
      <motion.div variants={itemVariants} className="glass-card rounded-xl border border-white/5 overflow-hidden">
        <DataTable
          data={filteredData}
          columns={columns}
          title="Participant Open Interest Data"
          defaultSortKey="date"
          defaultSortDirection="desc"
        />
      </motion.div>
    </motion.div>
  )
}

export default PartOIPage