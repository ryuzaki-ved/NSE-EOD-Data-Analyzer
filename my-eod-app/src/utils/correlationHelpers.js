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

// Calculate cross-correlation between participant types for a single date
export const calculateParticipantCorrelations = (data, selectedDate = null) => {
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
  
  // If no date selected, use the latest date
  if (!selectedDate) {
    const dates = [...new Set(data.map(item => item.date))].sort()
    selectedDate = dates[dates.length - 1]
  }
  
  // Filter data for the selected date
  const dateData = data.filter(item => item.date === selectedDate)
  
  const correlations = {}
  
  participants.forEach(participant1 => {
    correlations[participant1] = {}
    participants.forEach(participant2 => {
      if (participant1 === participant2) {
        correlations[participant1][participant2] = { overall: 1 }
      } else {
        const participant1Record = dateData.find(item => item.client_type === participant1)
        const participant2Record = dateData.find(item => item.client_type === participant2)
        
        if (participant1Record && participant2Record) {
          const metricCorrelations = {}
          metrics.forEach(metric => {
            const value1 = participant1Record[metric] || 0
            const value2 = participant2Record[metric] || 0
            // For single day, we can't calculate correlation, so we'll use ratio comparison
            metricCorrelations[metric] = calculateValueSimilarity(value1, value2)
          })
          
          // Calculate overall similarity as average of all metrics
          const validSimilarities = Object.values(metricCorrelations).filter(sim => sim !== null)
          const overallSimilarity = validSimilarities.length > 0 
            ? validSimilarities.reduce((a, b) => a + b, 0) / validSimilarities.length 
            : null
          
          correlations[participant1][participant2] = {
            overall: overallSimilarity,
            metrics: metricCorrelations
          }
        } else {
          correlations[participant1][participant2] = {
            overall: null,
            metrics: {}
          }
        }
      }
    })
  })
  
  return correlations
}

// Calculate similarity between two values (alternative to correlation for single day)
const calculateValueSimilarity = (value1, value2) => {
  if (value1 === 0 && value2 === 0) return 1 // Both zero = perfect similarity
  if (value1 === 0 || value2 === 0) return 0 // One zero, one non-zero = no similarity
  
  const maxValue = Math.max(value1, value2)
  const minValue = Math.min(value1, value2)
  const ratio = minValue / maxValue
  
  // Convert ratio to similarity score (0 to 1)
  return ratio
}

// Get available dates from the data
export const getAvailableDates = (data) => {
  return [...new Set(data.map(item => item.date))].sort()
}

// Get latest date from the data
export const getLatestDate = (data) => {
  const dates = getAvailableDates(data)
  return dates[dates.length - 1]
}

// Get participant data for a specific date
export const getParticipantDataForDate = (data, date) => {
  return data.filter(item => item.date === date && item.client_type !== 'TOTAL')
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

// Calculate position changes (day-over-day differences)
export const calculatePositionChanges = (data, selectedDate = null) => {
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
  
  // If no date selected, use the latest date
  if (!selectedDate) {
    const dates = [...new Set(data.map(item => item.date))].sort()
    selectedDate = dates[dates.length - 1]
  }
  
  // Get available dates and find previous date
  const dates = [...new Set(data.map(item => item.date))].sort()
  const currentDateIndex = dates.indexOf(selectedDate)
  const previousDate = currentDateIndex > 0 ? dates[currentDateIndex - 1] : null
  
  if (!previousDate) {
    return { changes: {}, currentDate: selectedDate, previousDate: null }
  }
  
  const changes = {}
  
  participants.forEach(participant => {
    const currentRecord = data.find(item => item.date === selectedDate && item.client_type === participant)
    const previousRecord = data.find(item => item.date === previousDate && item.client_type === participant)
    
    if (currentRecord && previousRecord) {
      changes[participant] = {}
      metrics.forEach(metric => {
        const currentValue = currentRecord[metric] || 0
        const previousValue = previousRecord[metric] || 0
        const change = currentValue - previousValue
        const changePercent = previousValue !== 0 ? (change / previousValue) * 100 : 0
        
        changes[participant][metric] = {
          current: currentValue,
          previous: previousValue,
          change: change,
          changePercent: changePercent,
          direction: change > 0 ? 'increase' : change < 0 ? 'decrease' : 'no_change'
        }
      })
    }
  })
  
  return { changes, currentDate: selectedDate, previousDate }
}

// Calculate advanced correlations including position changes
export const calculateAdvancedCorrelations = (data, selectedDate = null) => {
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
  
  // Get position changes
  const { changes, currentDate, previousDate } = calculatePositionChanges(data, selectedDate)
  
  // Calculate current position similarities
  const currentSimilarities = calculateParticipantCorrelations(data, selectedDate)
  
  // Calculate change similarities
  const changeSimilarities = {}
  
  participants.forEach(participant1 => {
    changeSimilarities[participant1] = {}
    participants.forEach(participant2 => {
      if (participant1 === participant2) {
        changeSimilarities[participant1][participant2] = { overall: 1 }
      } else {
        const participant1Changes = changes[participant1]
        const participant2Changes = changes[participant2]
        
        if (participant1Changes && participant2Changes) {
          const metricSimilarities = {}
          metrics.forEach(metric => {
            const change1 = participant1Changes[metric]?.change || 0
            const change2 = participant2Changes[metric]?.change || 0
            metricSimilarities[metric] = calculateValueSimilarity(change1, change2)
          })
          
          const validSimilarities = Object.values(metricSimilarities).filter(sim => sim !== null)
          const overallSimilarity = validSimilarities.length > 0 
            ? validSimilarities.reduce((a, b) => a + b, 0) / validSimilarities.length 
            : null
          
          changeSimilarities[participant1][participant2] = {
            overall: overallSimilarity,
            metrics: metricSimilarities
          }
        } else {
          changeSimilarities[participant1][participant2] = {
            overall: null,
            metrics: {}
          }
        }
      }
    })
  })
  
  return {
    currentSimilarities,
    changeSimilarities,
    positionChanges: changes,
    currentDate,
    previousDate
  }
}

// Calculate momentum indicators based on position changes
export const calculateMomentumIndicators = (data, selectedDate = null) => {
  const { changes } = calculatePositionChanges(data, selectedDate)
  const participants = ['Client', 'DII', 'FII', 'Pro']
  
  const momentum = {}
  
  participants.forEach(participant => {
    const participantChanges = changes[participant]
    if (participantChanges) {
      const totalLongChange = participantChanges['total_long_contracts']?.change || 0
      const totalShortChange = participantChanges['total_short_contracts']?.change || 0
      const netPositionChange = totalLongChange - totalShortChange
      
      // Calculate momentum score (-100 to +100)
      const totalPositions = participantChanges['total_long_contracts']?.current + participantChanges['total_short_contracts']?.current
      const momentumScore = totalPositions > 0 ? (netPositionChange / totalPositions) * 100 : 0
      
      momentum[participant] = {
        netPositionChange,
        momentumScore,
        longMomentum: totalLongChange,
        shortMomentum: totalShortChange,
        overallDirection: netPositionChange > 0 ? 'bullish' : netPositionChange < 0 ? 'bearish' : 'neutral',
        strength: Math.abs(momentumScore) > 10 ? 'strong' : Math.abs(momentumScore) > 5 ? 'moderate' : 'weak'
      }
    }
  })
  
  return momentum
}

// Get position change summary for display
export const getPositionChangeSummary = (changes, participant) => {
  const participantChanges = changes[participant]
  if (!participantChanges) return null
  
  const totalLongChange = participantChanges['total_long_contracts']?.change || 0
  const totalShortChange = participantChanges['total_short_contracts']?.change || 0
  const netChange = totalLongChange - totalShortChange
  
  return {
    netChange,
    longChange: totalLongChange,
    shortChange: totalShortChange,
    direction: netChange > 0 ? 'bullish' : netChange < 0 ? 'bearish' : 'neutral',
    magnitude: Math.abs(netChange)
  }
}

// Format position change for display
export const formatPositionChange = (change) => {
  if (change === null || change === undefined) return 'N/A'
  
  const sign = change > 0 ? '+' : ''
  const formatted = Math.abs(change).toLocaleString()
  return `${sign}${formatted}`
}

// Get position change color class
export const getPositionChangeColorClass = (change) => {
  if (change === null || change === undefined) return 'text-gray-500'
  if (change > 0) return 'text-green-400'
  if (change < 0) return 'text-red-400'
  return 'text-gray-400'
} 