// Advanced Mathematical Analysis Utilities for EOD Data
// Complex statistical features for deeper market insights

// ============================================================================
// TIME SERIES ANALYSIS & FORECASTING
// ============================================================================

// Calculate Hurst Exponent for trend persistence analysis
export const calculateHurstExponent = (data, maxLag = 20) => {
  if (data.length < 50) return null
  
  const lags = []
  const rsValues = []
  
  for (let lag = 2; lag <= maxLag; lag++) {
    const rs = calculateRSStatistic(data, lag)
    if (rs > 0) {
      lags.push(Math.log(lag))
      rsValues.push(Math.log(rs))
    }
  }
  
  if (lags.length < 3) return null
  
  // Linear regression of log(R/S) vs log(lag)
  const slope = calculateLinearRegressionSlope(lags, rsValues)
  return slope
}

// Calculate R/S statistic for Hurst exponent
const calculateRSStatistic = (data, lag) => {
  const segments = Math.floor(data.length / lag)
  if (segments === 0) return 0
  
  let totalRS = 0
  
  for (let i = 0; i < segments; i++) {
    const segment = data.slice(i * lag, (i + 1) * lag)
    const mean = segment.reduce((sum, val) => sum + val, 0) / lag
    const deviations = segment.map(val => val - mean)
    
    // Calculate cumulative deviations
    const cumulative = []
    let sum = 0
    for (let j = 0; j < deviations.length; j++) {
      sum += deviations[j]
      cumulative.push(sum)
    }
    
    // Calculate R (range)
    const min = Math.min(...cumulative)
    const max = Math.max(...cumulative)
    const R = max - min
    
    // Calculate S (standard deviation)
    const S = Math.sqrt(deviations.reduce((sum, dev) => sum + dev * dev, 0) / lag)
    
    if (S > 0) {
      totalRS += R / S
    }
  }
  
  return totalRS / segments
}

// Calculate linear regression slope
const calculateLinearRegressionSlope = (x, y) => {
  const n = x.length
  const sumX = x.reduce((a, b) => a + b, 0)
  const sumY = y.reduce((a, b) => a + b, 0)
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0)
  
  return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
}

// Fast Fourier Transform for cyclical pattern detection
export const performFFT = (data) => {
  if (data.length === 0) return { frequencies: [], amplitudes: [] }
  
  // Simple FFT implementation (for production, use a library like fft-js)
  const n = data.length
  const frequencies = []
  const amplitudes = []
  
  for (let k = 0; k < n; k++) {
    let real = 0
    let imag = 0
    
    for (let j = 0; j < n; j++) {
      const angle = -2 * Math.PI * k * j / n
      real += data[j] * Math.cos(angle)
      imag += data[j] * Math.sin(angle)
    }
    
    frequencies.push(k / n)
    amplitudes.push(Math.sqrt(real * real + imag * imag))
  }
  
  return { frequencies, amplitudes }
}

// Detect dominant cycles in data
export const detectCycles = (data, minCycleLength = 3, maxCycleLength = 50) => {
  const { frequencies, amplitudes } = performFFT(data)
  const cycles = []
  
  for (let i = minCycleLength; i < Math.min(maxCycleLength, frequencies.length / 2); i++) {
    if (amplitudes[i] > Math.max(...amplitudes) * 0.1) { // 10% of max amplitude
      cycles.push({
        period: 1 / frequencies[i],
        amplitude: amplitudes[i],
        frequency: frequencies[i]
      })
    }
  }
  
  return cycles.sort((a, b) => b.amplitude - a.amplitude)
}

// ============================================================================
// MACHINE LEARNING & CLUSTERING
// ============================================================================

// K-means clustering for participant behavior analysis
export const performKMeansClustering = (data, k = 3, maxIterations = 100) => {
  if (data.length < k) return null
  
  // Initialize centroids randomly
  let centroids = []
  for (let i = 0; i < k; i++) {
    const randomIndex = Math.floor(Math.random() * data.length)
    centroids.push([...data[randomIndex]])
  }
  
  let clusters = new Array(data.length).fill(0)
  let iterations = 0
  
  while (iterations < maxIterations) {
    let changed = false
    
    // Assign points to nearest centroid
    for (let i = 0; i < data.length; i++) {
      let minDistance = Infinity
      let nearestCluster = 0
      
      for (let j = 0; j < k; j++) {
        const distance = calculateEuclideanDistance(data[i], centroids[j])
        if (distance < minDistance) {
          minDistance = distance
          nearestCluster = j
        }
      }
      
      if (clusters[i] !== nearestCluster) {
        clusters[i] = nearestCluster
        changed = true
      }
    }
    
    if (!changed) break
    
    // Update centroids
    for (let j = 0; j < k; j++) {
      const clusterPoints = data.filter((_, index) => clusters[index] === j)
      if (clusterPoints.length > 0) {
        centroids[j] = clusterPoints[0].map((_, dim) => 
          clusterPoints.reduce((sum, point) => sum + point[dim], 0) / clusterPoints.length
        )
      }
    }
    
    iterations++
  }
  
  return { clusters, centroids, iterations }
}

// Calculate Euclidean distance
const calculateEuclideanDistance = (point1, point2) => {
  return Math.sqrt(point1.reduce((sum, val, i) => sum + Math.pow(val - point2[i], 2), 0))
}

// Principal Component Analysis for dimensionality reduction
export const performPCA = (data, numComponents = 2) => {
  if (data.length === 0 || data[0].length === 0) return null
  
  const n = data.length
  const m = data[0].length
  
  // Center the data
  const mean = data[0].map((_, j) => data.reduce((sum, row) => sum + row[j], 0) / n)
  const centeredData = data.map(row => row.map((val, j) => val - mean[j]))
  
  // Calculate covariance matrix
  const covariance = []
  for (let i = 0; i < m; i++) {
    covariance[i] = []
    for (let j = 0; j < m; j++) {
      covariance[i][j] = centeredData.reduce((sum, row) => sum + row[i] * row[j], 0) / (n - 1)
    }
  }
  
  // Simple eigenvalue decomposition (for production, use a library)
  const eigenvalues = calculateEigenvalues(covariance)
  const eigenvectors = calculateEigenvectors(covariance, eigenvalues)
  
  // Sort by eigenvalues and take top components
  const sortedIndices = eigenvalues.map((val, index) => ({ val, index }))
    .sort((a, b) => b.val - a.val)
    .slice(0, numComponents)
    .map(item => item.index)
  
  const principalComponents = sortedIndices.map(index => eigenvectors[index])
  
  // Project data onto principal components
  const projectedData = centeredData.map(row => 
    principalComponents.map(pc => 
      row.reduce((sum, val, j) => sum + val * pc[j], 0)
    )
  )
  
  return {
    projectedData,
    principalComponents,
    eigenvalues: sortedIndices.map(index => eigenvalues[index]),
    explainedVariance: sortedIndices.map(index => eigenvalues[index] / eigenvalues.reduce((a, b) => a + b, 0))
  }
}

// Simple eigenvalue calculation (simplified)
const calculateEigenvalues = (matrix) => {
  // For 2x2 matrix
  if (matrix.length === 2) {
    const a = matrix[0][0]
    const b = matrix[0][1]
    const c = matrix[1][0]
    const d = matrix[1][1]
    
    const trace = a + d
    const det = a * d - b * c
    const discriminant = trace * trace - 4 * det
    
    if (discriminant >= 0) {
      const sqrtDisc = Math.sqrt(discriminant)
      return [(trace + sqrtDisc) / 2, (trace - sqrtDisc) / 2]
    }
  }
  
  // Fallback: return diagonal elements
  return matrix.map((row, i) => row[i])
}

// Simple eigenvector calculation (simplified)
const calculateEigenvectors = (matrix, eigenvalues) => {
  // Simplified implementation - for production use a proper library
  return eigenvalues.map((eigenvalue, i) => {
    const eigenvector = new Array(matrix.length).fill(0)
    eigenvector[i] = 1
    return eigenvector
  })
}

// ============================================================================
// ADVANCED RISK METRICS
// ============================================================================

// Calculate Conditional Value at Risk (CVaR)
export const calculateCVaR = (returns, confidenceLevel = 0.05) => {
  if (returns.length === 0) return 0
  
  const sortedReturns = [...returns].sort((a, b) => a - b)
  const cutoffIndex = Math.floor(confidenceLevel * sortedReturns.length)
  const tailReturns = sortedReturns.slice(0, cutoffIndex)
  
  return Math.abs(tailReturns.reduce((sum, ret) => sum + ret, 0) / tailReturns.length)
}

// Calculate Omega Ratio
export const calculateOmegaRatio = (returns, threshold = 0) => {
  if (returns.length === 0) return 0
  
  const gains = returns.filter(ret => ret > threshold)
  const losses = returns.filter(ret => ret < threshold)
  
  const expectedGain = gains.length > 0 ? gains.reduce((sum, gain) => sum + gain, 0) / gains.length : 0
  const expectedLoss = losses.length > 0 ? Math.abs(losses.reduce((sum, loss) => sum + loss, 0) / losses.length) : 0
  
  return expectedLoss > 0 ? expectedGain / expectedLoss : 0
}

// Calculate Calmar Ratio
export const calculateCalmarRatio = (returns, maxDrawdown) => {
  if (returns.length === 0 || maxDrawdown === 0) return 0
  
  const meanReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length
  const annualizedReturn = meanReturn * 252 // Assuming daily returns
  
  return Math.abs(annualizedReturn / maxDrawdown)
}

// Calculate Sortino Ratio
export const calculateSortinoRatio = (returns, riskFreeRate = 0, targetReturn = 0) => {
  if (returns.length === 0) return 0
  
  const excessReturns = returns.map(ret => ret - riskFreeRate / 252)
  const downsideReturns = excessReturns.filter(ret => ret < targetReturn)
  
  if (downsideReturns.length === 0) return 0
  
  const meanExcessReturn = excessReturns.reduce((sum, ret) => sum + ret, 0) / returns.length
  const downsideDeviation = Math.sqrt(
    downsideReturns.reduce((sum, ret) => sum + Math.pow(ret - targetReturn, 2), 0) / downsideReturns.length
  )
  
  return downsideDeviation > 0 ? meanExcessReturn / downsideDeviation : 0
}

// Calculate Maximum Drawdown Duration
export const calculateMaxDrawdownDuration = (data) => {
  if (data.length < 2) return 0
  
  let maxDrawdown = 0
  let maxDrawdownDuration = 0
  let currentDrawdownDuration = 0
  let peak = data[0]
  let peakIndex = 0
  
  for (let i = 1; i < data.length; i++) {
    if (data[i] > peak) {
      peak = data[i]
      peakIndex = i
      currentDrawdownDuration = 0
    } else {
      currentDrawdownDuration++
      const drawdown = (peak - data[i]) / peak
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown
        maxDrawdownDuration = currentDrawdownDuration
      }
    }
  }
  
  return maxDrawdownDuration
}

// ============================================================================
// ADVANCED CORRELATION & DEPENDENCE
// ============================================================================

// Calculate Granger Causality (simplified version)
export const calculateGrangerCausality = (x, y, maxLag = 5) => {
  if (x.length !== y.length || x.length < maxLag * 2) return null
  
  // Calculate unrestricted model (y regressed on lagged y and lagged x)
  const unrestrictedSSR = calculateRestrictedSSR(y, x, maxLag)
  
  // Calculate restricted model (y regressed only on lagged y)
  const restrictedSSR = calculateRestrictedSSR(y, [], maxLag)
  
  // Calculate F-statistic
  const n = x.length - maxLag
  const fStat = ((restrictedSSR - unrestrictedSSR) / maxLag) / (unrestrictedSSR / (n - 2 * maxLag))
  
  return {
    fStatistic: fStat,
    pValue: calculatePValue(fStat, maxLag, n - 2 * maxLag),
    causality: fStat > 3.84 ? 'x causes y' : 'no causality' // 95% confidence level
  }
}

// Calculate sum of squared residuals for regression
const calculateRestrictedSSR = (y, x, maxLag) => {
  const n = y.length - maxLag
  let ssr = 0
  
  for (let i = maxLag; i < y.length; i++) {
    let predicted = 0
    
    // Add lagged y terms
    for (let lag = 1; lag <= maxLag; lag++) {
      predicted += y[i - lag] * 0.1 // Simplified coefficient
    }
    
    // Add lagged x terms if available
    if (x.length > 0) {
      for (let lag = 1; lag <= maxLag; lag++) {
        predicted += x[i - lag] * 0.05 // Simplified coefficient
      }
    }
    
    ssr += Math.pow(y[i] - predicted, 2)
  }
  
  return ssr
}

// Calculate p-value for F-statistic (approximation)
const calculatePValue = (fStat, df1, df2) => {
  // Simplified p-value calculation
  if (fStat > 10) return 0.001
  if (fStat > 5) return 0.01
  if (fStat > 3) return 0.05
  return 0.1
}

// Calculate Copula-based dependence (simplified)
export const calculateCopulaDependence = (x, y) => {
  if (x.length !== y.length || x.length === 0) return null
  
  // Convert to uniform distribution using empirical CDF
  const u = x.map(val => {
    const rank = x.filter(v => v <= val).length
    return rank / x.length
  })
  
  const v = y.map(val => {
    const rank = y.filter(v => v <= val).length
    return rank / y.length
  })
  
  // Calculate empirical copula
  let copulaSum = 0
  for (let i = 0; i < u.length; i++) {
    copulaSum += Math.min(u[i], v[i])
  }
  
  const copulaValue = copulaSum / u.length
  
  return {
    copulaValue,
    dependence: copulaValue > 0.6 ? 'strong positive' : 
                copulaValue < 0.4 ? 'strong negative' : 'weak'
  }
}

// ============================================================================
// MARKET MICROSTRUCTURE ANALYSIS
// ============================================================================

// Calculate Order Flow Imbalance
export const calculateOrderFlowImbalance = (buyVolume, sellVolume) => {
  if (buyVolume + sellVolume === 0) return 0
  
  return (buyVolume - sellVolume) / (buyVolume + sellVolume)
}

// Calculate Amihud Illiquidity Measure
export const calculateAmihudIlliquidity = (returns, volumes) => {
  if (returns.length !== volumes.length || returns.length === 0) return []
  
  return returns.map((ret, i) => {
    const volume = volumes[i]
    return volume > 0 ? Math.abs(ret) / volume : 0
  })
}

// Calculate Kyle's Lambda (price impact)
export const calculateKyleLambda = (priceChanges, signedVolumes) => {
  if (priceChanges.length !== signedVolumes.length || priceChanges.length === 0) return null
  
  // Simple linear regression of price changes on signed volumes
  const n = priceChanges.length
  const sumVolume = signedVolumes.reduce((sum, vol) => sum + vol, 0)
  const sumPrice = priceChanges.reduce((sum, price) => sum + price, 0)
  const sumVolumePrice = signedVolumes.reduce((sum, vol, i) => sum + vol * priceChanges[i], 0)
  const sumVolume2 = signedVolumes.reduce((sum, vol) => sum + vol * vol, 0)
  
  const lambda = (n * sumVolumePrice - sumVolume * sumPrice) / (n * sumVolume2 - sumVolume * sumVolume)
  
  return lambda
}

// ============================================================================
// STRUCTURAL BREAK DETECTION
// ============================================================================

// Chow Test for structural breaks
export const performChowTest = (data, breakPoint) => {
  if (data.length < 10 || breakPoint < 5 || breakPoint > data.length - 5) return null
  
  // Split data into two periods
  const period1 = data.slice(0, breakPoint)
  const period2 = data.slice(breakPoint)
  
  // Calculate RSS for each period
  const rss1 = calculateRSS(period1)
  const rss2 = calculateRSS(period2)
  const rssFull = calculateRSS(data)
  
  // Calculate Chow test statistic
  const n = data.length
  const k = 2 // number of parameters (intercept and slope)
  const chowStat = ((rssFull - (rss1 + rss2)) / k) / ((rss1 + rss2) / (n - 2 * k))
  
  return {
    chowStatistic: chowStat,
    pValue: calculatePValue(chowStat, k, n - 2 * k),
    hasBreak: chowStat > 3.84 // 95% confidence level
  }
}

// Calculate Residual Sum of Squares
const calculateRSS = (data) => {
  if (data.length < 2) return 0
  
  const x = Array.from({ length: data.length }, (_, i) => i)
  const { slope, intercept } = calculateLinearRegression(x, data)
  
  return data.reduce((sum, y, i) => {
    const predicted = slope * x[i] + intercept
    return sum + Math.pow(y - predicted, 2)
  }, 0)
}

// Calculate linear regression parameters
const calculateLinearRegression = (x, y) => {
  const n = x.length
  const sumX = x.reduce((a, b) => a + b, 0)
  const sumY = y.reduce((a, b) => a + b, 0)
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0)
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n
  
  return { slope, intercept }
}

// CUSUM Test for structural breaks
export const performCUSUMTest = (data, windowSize = 10) => {
  if (data.length < windowSize * 2) return null
  
  const cusum = []
  const mean = data.reduce((sum, val) => sum + val, 0) / data.length
  const std = Math.sqrt(data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length)
  
  let cumulative = 0
  for (let i = 0; i < data.length; i++) {
    cumulative += (data[i] - mean) / std
    cusum.push(cumulative)
  }
  
  // Find maximum deviation
  const maxDeviation = Math.max(...cusum.map(Math.abs))
  const criticalValue = 1.358 * Math.sqrt(data.length) // 95% confidence level
  
  return {
    cusumValues: cusum,
    maxDeviation,
    criticalValue,
    hasBreak: maxDeviation > criticalValue,
    breakPoint: cusum.findIndex(val => Math.abs(val) === maxDeviation)
  }
}

// ============================================================================
// MONTE CARLO SIMULATIONS
// ============================================================================

// Monte Carlo simulation for scenario analysis
export const performMonteCarloSimulation = (returns, numSimulations = 1000, timeHorizon = 252) => {
  if (returns.length === 0) return null
  
  const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length
  const std = Math.sqrt(returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length)
  
  const simulations = []
  
  for (let sim = 0; sim < numSimulations; sim++) {
    const path = []
    let currentValue = 1 // Starting value
    
    for (let t = 0; t < timeHorizon; t++) {
      const randomReturn = mean + std * (Math.random() + Math.random() + Math.random() + Math.random() + Math.random() + Math.random() - 3) / Math.sqrt(3)
      currentValue *= (1 + randomReturn)
      path.push(currentValue)
    }
    
    simulations.push(path)
  }
  
  // Calculate percentiles
  const finalValues = simulations.map(path => path[path.length - 1]).sort((a, b) => a - b)
  const percentiles = {
    p5: finalValues[Math.floor(0.05 * numSimulations)],
    p25: finalValues[Math.floor(0.25 * numSimulations)],
    p50: finalValues[Math.floor(0.50 * numSimulations)],
    p75: finalValues[Math.floor(0.75 * numSimulations)],
    p95: finalValues[Math.floor(0.95 * numSimulations)]
  }
  
  return {
    simulations,
    percentiles,
    meanFinalValue: finalValues.reduce((sum, val) => sum + val, 0) / numSimulations
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Calculate rolling statistics with custom window
export const calculateRollingStatistics = (data, window, statistic = 'mean') => {
  if (data.length < window) return []
  
  const results = []
  for (let i = window - 1; i < data.length; i++) {
    const windowData = data.slice(i - window + 1, i + 1)
    
    switch (statistic) {
      case 'mean':
        results.push(windowData.reduce((sum, val) => sum + val, 0) / window)
        break
      case 'std':
        const mean = windowData.reduce((sum, val) => sum + val, 0) / window
        const variance = windowData.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / window
        results.push(Math.sqrt(variance))
        break
      case 'skewness':
        results.push(calculateSkewness(windowData))
        break
      case 'kurtosis':
        results.push(calculateKurtosis(windowData))
        break
      default:
        results.push(windowData.reduce((sum, val) => sum + val, 0) / window)
    }
  }
  
  return results
}

// Calculate skewness
const calculateSkewness = (data) => {
  if (data.length < 3) return 0
  
  const mean = data.reduce((sum, val) => sum + val, 0) / data.length
  const std = Math.sqrt(data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length)
  
  if (std === 0) return 0
  
  const cubedDiffs = data.map(val => Math.pow((val - mean) / std, 3))
  return cubedDiffs.reduce((sum, val) => sum + val, 0) / data.length
}

// Calculate kurtosis
const calculateKurtosis = (data) => {
  if (data.length < 4) return 0
  
  const mean = data.reduce((sum, val) => sum + val, 0) / data.length
  const std = Math.sqrt(data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length)
  
  if (std === 0) return 0
  
  const fourthPowerDiffs = data.map(val => Math.pow((val - mean) / std, 4))
  return fourthPowerDiffs.reduce((sum, val) => sum + val, 0) / data.length - 3
}

// Format complex numbers for display
export const formatComplexNumber = (real, imag) => {
  if (Math.abs(imag) < 1e-10) return real.toFixed(4)
  if (Math.abs(real) < 1e-10) return `${imag.toFixed(4)}i`
  return `${real.toFixed(4)} ${imag >= 0 ? '+' : ''}${imag.toFixed(4)}i`
}

// Calculate confidence intervals
export const calculateConfidenceInterval = (data, confidenceLevel = 0.95) => {
  if (data.length === 0) return null
  
  const mean = data.reduce((sum, val) => sum + val, 0) / data.length
  const std = Math.sqrt(data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length)
  const standardError = std / Math.sqrt(data.length)
  
  // Z-score for confidence level (simplified)
  const zScore = confidenceLevel === 0.95 ? 1.96 : confidenceLevel === 0.99 ? 2.58 : 1.645
  
  return {
    mean,
    lowerBound: mean - zScore * standardError,
    upperBound: mean + zScore * standardError,
    confidenceLevel
  }
}