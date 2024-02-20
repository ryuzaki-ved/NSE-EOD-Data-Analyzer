// Correlation analysis utilities for EOD data

// Calculate Pearson correlation coefficient
export const calculatePearsonCorrelation = (x, y) => {
  if (x.length !== y.length || x.length === 0) return null
  
  const n = x.length
  const sumX = x.reduce((a, b) => a + b, 0)
  const sumY = y.reduce((a, b) => a + b, 0)
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0)
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0)
  
  const numerator = n * sumXY - sumX * sumY
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))
  
  if (denominator === 0) return 0
  return numerator / denominator
}

// Calculate Spearman rank correlation
export const calculateSpearmanCorrelation = (x, y) => {
  if (x.length !== y.length || x.length === 0) return null
  
  // Create rank arrays
  const rankX = getRanks(x)
  const rankY = getRanks(y)
  
  return calculatePearsonCorrelation(rankX, rankY)
}

// Helper function to get ranks for Spearman correlation
const getRanks = (arr) => {
  const indexed = arr.map((value, index) => ({ value, index }))
  indexed.sort((a, b) => a.value - b.value)
  
  const ranks = new Array(arr.length)
  for (let i = 0; i < indexed.length; i++) {
    ranks[indexed[i].index] = i + 1
  }
  
  return ranks
}

// Calculate rolling correlation over a window
export const calculateRollingCorrelation = (x, y, window = 5) => {
  if (x.length !== y.length || x.length < window) return []
  
  const correlations = []
  for (let i = window - 1; i < x.length; i++) {
    const xWindow = x.slice(i - window + 1, i + 1)
    const yWindow = y.slice(i - window + 1, i + 1)
    correlations.push(calculatePearsonCorrelation(xWindow, yWindow))
  }
  
  return correlations
}

// Calculate correlation matrix for multiple variables
export const calculateCorrelationMatrix = (data, variables) => {
  const matrix = {}
  
  variables.forEach(var1 => {
    matrix[var1] = {}
    variables.forEach(var2 => {
      if (var1 === var2) {
        matrix[var1][var2] = 1
      } else {
        const values1 = data.map(row => row[var1]).filter(val => val !== null && val !== undefined)
        const values2 = data.map(row => row[var2]).filter(val => val !== null && val !== undefined)
        
        // Ensure both arrays have the same length
        const minLength = Math.min(values1.length, values2.length)
        const corr = calculatePearsonCorrelation(
          values1.slice(0, minLength),
          values2.slice(0, minLength)
        )
        matrix[var1][var2] = corr
      }
    })
  })
  
  return matrix
}

// Get correlation strength description
export const getCorrelationStrength = (correlation) => {
  if (correlation === null || isNaN(correlation)) return 'No correlation'
  
  const absCorr = Math.abs(correlation)
  if (absCorr >= 0.9) return 'Very Strong'
  if (absCorr >= 0.7) return 'Strong'
  if (absCorr >= 0.5) return 'Moderate'
  if (absCorr >= 0.3) return 'Weak'
  if (absCorr >= 0.1) return 'Very Weak'
  return 'Negligible'
}

// Get correlation direction
export const getCorrelationDirection = (correlation) => {
  if (correlation === null || isNaN(correlation)) return 'None'
  if (correlation > 0) return 'Positive'
  if (correlation < 0) return 'Negative'
  return 'None'
}

// Format correlation value for display
export const formatCorrelation = (correlation) => {
  if (correlation === null || isNaN(correlation)) return 'N/A'
  return correlation.toFixed(3)
}

// Get correlation color class
export const getCorrelationColorClass = (correlation) => {
  if (correlation === null || isNaN(correlation)) return 'text-gray-400'
  
  const absCorr = Math.abs(correlation)
  if (absCorr >= 0.7) return 'text-green-400 font-bold'
  if (absCorr >= 0.5) return 'text-green-400 font-semibold'
  if (absCorr >= 0.3) return 'text-yellow-400 font-semibold'
  if (absCorr >= 0.1) return 'text-orange-400'
  return 'text-gray-400'
}

// Calculate cross-correlation between participant types
export const calculateParticipantCorrelations = (data) => {
  const participants = ['Client', 'DII', 'FII', 'Pro']
  const metrics = [
    'total_long_contracts',
    'total_short_contracts',
    'future_index_long',
    'future_index_short',
    'option_index_call_long',
    'option_index_put_long',
    'option_index_call_short',
    'option_index_put_short'
  ]
  
  const correlations = {}
  
  participants.forEach(participant1 => {
    correlations[participant1] = {}
    participants.forEach(participant2 => {
      if (participant1 === participant2) {
        correlations[participant1][participant2] = { overall: 1 }
      } else {
        const participant1Data = data.filter(item => item.client_type === participant1)
        const participant2Data = data.filter(item => item.client_type === participant2)
        
        // Align data by date
        const alignedData = alignDataByDate(participant1Data, participant2Data)
        
        const metricCorrelations = {}
        metrics.forEach(metric => {
          const values1 = alignedData.map(item => item[participant1]?.[metric] || 0)
          const values2 = alignedData.map(item => item[participant2]?.[metric] || 0)
          metricCorrelations[metric] = calculatePearsonCorrelation(values1, values2)
        })
        
        // Calculate overall correlation as average of all metrics
        const validCorrelations = Object.values(metricCorrelations).filter(corr => corr !== null)
        const overallCorrelation = validCorrelations.length > 0 
          ? validCorrelations.reduce((a, b) => a + b, 0) / validCorrelations.length 
          : null
        
        correlations[participant1][participant2] = {
          overall: overallCorrelation,
          metrics: metricCorrelations
        }
      }
    })
  })
  
  return correlations
}

// Helper function to align data by date
const alignDataByDate = (data1, data2) => {
  const dateMap = new Map()
  
  // Add data1
  data1.forEach(item => {
    if (!dateMap.has(item.date)) {
      dateMap.set(item.date, {})
    }
    dateMap.get(item.date)[Object.keys(data1[0]).find(key => key !== 'date' && key !== 'client_type')] = item
  })
  
  // Add data2
  data2.forEach(item => {
    if (!dateMap.has(item.date)) {
      dateMap.set(item.date, {})
    }
    dateMap.get(item.date)[Object.keys(data2[0]).find(key => key !== 'date' && key !== 'client_type')] = item
  })
  
  return Array.from(dateMap.entries()).map(([date, data]) => ({ date, ...data }))
}

// Calculate time-lagged correlations
export const calculateLaggedCorrelations = (x, y, maxLag = 5) => {
  const correlations = []
  
  for (let lag = 0; lag <= maxLag; lag++) {
    const xLagged = x.slice(lag)
    const yLagged = y.slice(0, x.length - lag)
    
    if (xLagged.length > 0 && yLagged.length > 0) {
      const correlation = calculatePearsonCorrelation(xLagged, yLagged)
      correlations.push({ lag, correlation })
    }
  }
  
  return correlations
}

// Calculate correlation with market indicators
export const calculateMarketCorrelations = (participantData, fiiData) => {
  const marketIndicators = {
    'FII_Net_Flow': fiiData.map(item => (item.buy_amt_adj || 0) - (item.sell_amt_adj || 0)),
    'FII_Buy_Amount': fiiData.map(item => item.buy_amt_adj || 0),
    'FII_Sell_Amount': fiiData.map(item => item.sell_amt_adj || 0),
    'FII_OI_Amount': fiiData.map(item => item.oi_amt_adj || 0)
  }
  
  const participants = ['Client', 'DII', 'FII', 'Pro']
  const metrics = ['total_long_contracts', 'total_short_contracts']
  
  const correlations = {}
  
  participants.forEach(participant => {
    correlations[participant] = {}
    Object.keys(marketIndicators).forEach(indicator => {
      correlations[participant][indicator] = {}
      
      metrics.forEach(metric => {
        const participantValues = participantData
          .filter(item => item.client_type === participant)
          .map(item => item[metric] || 0)
        
        // Align data lengths
        const minLength = Math.min(participantValues.length, marketIndicators[indicator].length)
        const correlation = calculatePearsonCorrelation(
          participantValues.slice(0, minLength),
          marketIndicators[indicator].slice(0, minLength)
        )
        
        correlations[participant][indicator][metric] = correlation
      })
    })
  })
  
  return correlations
} 