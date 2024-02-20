// Advanced statistical analysis utilities for EOD data

// Calculate simple moving average
export const calculateSMA = (data, period) => {
  if (data.length < period) return []
  
  const sma = []
  for (let i = period - 1; i < data.length; i++) {
    const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0)
    sma.push(sum / period)
  }
  return sma
}

// Calculate exponential moving average
export const calculateEMA = (data, period) => {
  if (data.length < period) return []
  
  const ema = []
  const multiplier = 2 / (period + 1)
  
  // First EMA is SMA
  let sum = data.slice(0, period).reduce((a, b) => a + b, 0)
  let currentEMA = sum / period
  ema.push(currentEMA)
  
  for (let i = period; i < data.length; i++) {
    currentEMA = (data[i] * multiplier) + (currentEMA * (1 - multiplier))
    ema.push(currentEMA)
  }
  
  return ema
}

// Calculate standard deviation
export const calculateStandardDeviation = (data) => {
  if (data.length === 0) return 0
  
  const mean = data.reduce((a, b) => a + b, 0) / data.length
  const squaredDiffs = data.map(value => Math.pow(value - mean, 2))
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / data.length
  
  return Math.sqrt(variance)
}

// Calculate volatility (rolling standard deviation)
export const calculateVolatility = (data, period = 20) => {
  if (data.length < period) return []
  
  const volatility = []
  for (let i = period - 1; i < data.length; i++) {
    const window = data.slice(i - period + 1, i + 1)
    const stdDev = calculateStandardDeviation(window)
    volatility.push(stdDev)
  }
  
  return volatility
}

// Calculate Z-score
export const calculateZScore = (value, mean, stdDev) => {
  if (stdDev === 0) return 0
  return (value - mean) / stdDev
}

// Calculate rolling Z-scores
export const calculateRollingZScore = (data, period = 20) => {
  if (data.length < period) return []
  
  const zScores = []
  for (let i = period - 1; i < data.length; i++) {
    const window = data.slice(i - period + 1, i + 1)
    const mean = window.reduce((a, b) => a + b, 0) / window.length
    const stdDev = calculateStandardDeviation(window)
    const zScore = calculateZScore(data[i], mean, stdDev)
    zScores.push(zScore)
  }
  
  return zScores
}

// Calculate RSI (Relative Strength Index)
export const calculateRSI = (data, period = 14) => {
  if (data.length < period + 1) return []
  
  const gains = []
  const losses = []
  
  // Calculate price changes
  for (let i = 1; i < data.length; i++) {
    const change = data[i] - data[i - 1]
    gains.push(change > 0 ? change : 0)
    losses.push(change < 0 ? Math.abs(change) : 0)
  }
  
  const rsi = []
  
  // Calculate initial average gain and loss
  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period
  
  // Calculate first RSI
  const rs = avgGain / avgLoss
  const firstRSI = 100 - (100 / (1 + rs))
  rsi.push(firstRSI)
  
  // Calculate subsequent RSI values
  for (let i = period; i < gains.length; i++) {
    avgGain = ((avgGain * (period - 1)) + gains[i]) / period
    avgLoss = ((avgLoss * (period - 1)) + losses[i]) / period
    
    const rs = avgGain / avgLoss
    const rsiValue = 100 - (100 / (1 + rs))
    rsi.push(rsiValue)
  }
  
  return rsi
}

// Calculate MACD (Moving Average Convergence Divergence)
export const calculateMACD = (data, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) => {
  if (data.length < slowPeriod) return { macd: [], signal: [], histogram: [] }
  
  const fastEMA = calculateEMA(data, fastPeriod)
  const slowEMA = calculateEMA(data, slowPeriod)
  
  // Calculate MACD line
  const macdLine = []
  const startIndex = slowPeriod - fastPeriod
  
  for (let i = 0; i < fastEMA.length; i++) {
    const macdValue = fastEMA[i] - slowEMA[i + startIndex]
    macdLine.push(macdValue)
  }
  
  // Calculate signal line
  const signalLine = calculateEMA(macdLine, signalPeriod)
  
  // Calculate histogram
  const histogram = []
  for (let i = 0; i < signalLine.length; i++) {
    histogram.push(macdLine[i + signalPeriod - 1] - signalLine[i])
  }
  
  return {
    macd: macdLine,
    signal: signalLine,
    histogram: histogram
  }
}

// Calculate Bollinger Bands
export const calculateBollingerBands = (data, period = 20, stdDevMultiplier = 2) => {
  if (data.length < period) return { upper: [], middle: [], lower: [] }
  
  const upper = []
  const middle = []
  const lower = []
  
  for (let i = period - 1; i < data.length; i++) {
    const window = data.slice(i - period + 1, i + 1)
    const sma = window.reduce((a, b) => a + b, 0) / period
    const stdDev = calculateStandardDeviation(window)
    
    middle.push(sma)
    upper.push(sma + (stdDev * stdDevMultiplier))
    lower.push(sma - (stdDev * stdDevMultiplier))
  }
  
  return { upper, middle, lower }
}

// Calculate percentage change
export const calculatePercentageChange = (current, previous) => {
  if (previous === 0) return 0
  return ((current - previous) / previous) * 100
}

// Calculate cumulative returns
export const calculateCumulativeReturns = (data) => {
  if (data.length < 2) return []
  
  const returns = []
  for (let i = 1; i < data.length; i++) {
    const returnValue = calculatePercentageChange(data[i], data[i - 1])
    returns.push(returnValue)
  }
  
  const cumulativeReturns = []
  let cumulative = 0
  
  returns.forEach(returnValue => {
    cumulative += returnValue
    cumulativeReturns.push(cumulative)
  })
  
  return cumulativeReturns
}

// Calculate maximum drawdown
export const calculateMaxDrawdown = (data) => {
  if (data.length < 2) return 0
  
  let maxDrawdown = 0
  let peak = data[0]
  
  for (let i = 1; i < data.length; i++) {
    if (data[i] > peak) {
      peak = data[i]
    } else {
      const drawdown = (peak - data[i]) / peak
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown
      }
    }
  }
  
  return maxDrawdown * 100 // Return as percentage
}

// Calculate Sharpe ratio
export const calculateSharpeRatio = (returns, riskFreeRate = 0) => {
  if (returns.length === 0) return 0
  
  const meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length
  const stdDev = calculateStandardDeviation(returns)
  
  if (stdDev === 0) return 0
  
  return (meanReturn - riskFreeRate) / stdDev
}

// Calculate Value at Risk (VaR)
export const calculateVaR = (returns, confidenceLevel = 0.05) => {
  if (returns.length === 0) return 0
  
  const sortedReturns = [...returns].sort((a, b) => a - b)
  const index = Math.floor(confidenceLevel * sortedReturns.length)
  
  return Math.abs(sortedReturns[index])
}

// Calculate skewness
export const calculateSkewness = (data) => {
  if (data.length < 3) return 0
  
  const mean = data.reduce((a, b) => a + b, 0) / data.length
  const stdDev = calculateStandardDeviation(data)
  
  if (stdDev === 0) return 0
  
  const cubedDiffs = data.map(value => Math.pow((value - mean) / stdDev, 3))
  const skewness = cubedDiffs.reduce((a, b) => a + b, 0) / data.length
  
  return skewness
}

// Calculate kurtosis
export const calculateKurtosis = (data) => {
  if (data.length < 4) return 0
  
  const mean = data.reduce((a, b) => a + b, 0) / data.length
  const stdDev = calculateStandardDeviation(data)
  
  if (stdDev === 0) return 0
  
  const fourthPowerDiffs = data.map(value => Math.pow((value - mean) / stdDev, 4))
  const kurtosis = fourthPowerDiffs.reduce((a, b) => a + b, 0) / data.length - 3
  
  return kurtosis
}

// Detect outliers using IQR method
export const detectOutliers = (data) => {
  if (data.length < 4) return []
  
  const sortedData = [...data].sort((a, b) => a - b)
  const q1Index = Math.floor(0.25 * sortedData.length)
  const q3Index = Math.floor(0.75 * sortedData.length)
  
  const q1 = sortedData[q1Index]
  const q3 = sortedData[q3Index]
  const iqr = q3 - q1
  
  const lowerBound = q1 - (1.5 * iqr)
  const upperBound = q3 + (1.5 * iqr)
  
  return data.filter(value => value < lowerBound || value > upperBound)
}

// Calculate trend strength using linear regression
export const calculateTrendStrength = (data) => {
  if (data.length < 2) return { slope: 0, rSquared: 0 }
  
  const n = data.length
  const x = Array.from({ length: n }, (_, i) => i)
  
  const sumX = x.reduce((a, b) => a + b, 0)
  const sumY = data.reduce((a, b) => a + b, 0)
  const sumXY = x.reduce((sum, xi, i) => sum + xi * data[i], 0)
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0)
  const sumY2 = data.reduce((sum, yi) => sum + yi * yi, 0)
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const rSquared = Math.pow((n * sumXY - sumX * sumY) / Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY)), 2)
  
  return { slope, rSquared }
} 