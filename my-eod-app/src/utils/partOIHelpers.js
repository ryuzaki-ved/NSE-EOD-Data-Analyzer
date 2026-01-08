// Helper functions for PartOIPage and DeepInsights

export const calculateRatio = (numerator, denominator) => {
  if (denominator === 0 || denominator === null || denominator === undefined) {
    return numerator > 0 ? 'Inf' : 'N/A'
  }
  return numerator / denominator
}

export const getRatioClass = (ratio) => {
  if (ratio === 'N/A' || ratio === 'Inf') return 'text-gray-400'
  if (ratio > 1.5) return 'flaming-text-green'
  if (ratio > 1) return 'text-green-400 font-semibold'
  if (ratio < 0.7) return 'flaming-text-red'
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

export const getPreviousExpiryDate = (currentDateStr) => {
  if (!currentDateStr) return null

  const [day, month, year] = currentDateStr.split('-')
  const currentDate = new Date(`${year}-${month}-${day}`)

  // Cutoff date for expiry change: Aug 28, 2025
  // Before or on Aug 28, 2025: Expiry is THURSDAY (4)
  // After Aug 28, 2025: Expiry is TUESDAY (2)
  const cutoffDate = new Date('2025-08-28')

  // Start checking from the previous day
  const testDate = new Date(currentDate)
  testDate.setDate(currentDate.getDate() - 1)

  // Look back up to 14 days to be safe (usually just need < 7 days)
  for (let i = 0; i < 14; i++) {
    const dayOfWeek = testDate.getDay() // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat

    // Determine target expiry day based on the test date itself
    // Actually, the expiry logic is global based on time. 
    // If the testDate is <= cutoff, target is Thursday.
    // If testDate > cutoff, target is Tuesday.

    // However, cycle transition is tricky. 
    // Let's use the logic: If the date found is <= cutoff, checking for Thursday.
    // If date found is > cutoff, checking for Tuesday.

    let targetDay = 2 // Default Tuesday
    if (testDate <= cutoffDate) {
      targetDay = 4 // Thursday
    }

    if (dayOfWeek === targetDay) {
      // Found the expiry day
      const d = testDate.getDate().toString().padStart(2, '0')
      const m = testDate.toLocaleDateString('en-US', { month: 'short' })
      const y = testDate.getFullYear()
      return `${d}-${m}-${y}`
    }

    testDate.setDate(testDate.getDate() - 1)
  }

  return null
}
