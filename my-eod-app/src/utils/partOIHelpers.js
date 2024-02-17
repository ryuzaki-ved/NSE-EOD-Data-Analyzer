// Helper functions for PartOIPage and DeepInsights

export const calculateRatio = (numerator, denominator) => {
  if (denominator === 0 || denominator === null || denominator === undefined) {
    return numerator > 0 ? 'Inf' : 'N/A'
  }
  return numerator / denominator
}

export const getRatioClass = (ratio) => {
  if (ratio === 'N/A' || ratio === 'Inf') return 'text-gray-400'
  if (ratio > 1.5) return 'text-green-400 font-bold animate-pulse'
  if (ratio > 1) return 'text-green-400 font-semibold'
  if (ratio < 0.7) return 'text-red-400 font-bold animate-pulse'
  if (ratio < 1) return 'text-red-400 font-semibold'
  return 'text-gray-300'
}

export const formatRatio = (ratio) => {
  if (ratio === 'N/A' || ratio === 'Inf') return ratio
  return ratio.toFixed(2)
}

export const formatIndianNumber = (num) => {
  if (typeof num !== 'number') return num
  return num.toLocaleString('en-IN')
}

export const formatDifference = (diff) => {
  if (typeof diff !== 'number') return diff
  const formatted = Math.abs(diff).toLocaleString('en-IN')
  return diff >= 0 ? `+${formatted}` : `-${formatted}`
} 