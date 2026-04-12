/**
 * Chart formatting, timeframe slicing, and decluttering utilities
 */

// Month abbreviation map
const MONTH_MAP = {
  '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr',
  '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Aug',
  '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec',
  'JAN': 'Jan', 'FEB': 'Feb', 'MAR': 'Mar', 'APR': 'Apr',
  'MAY': 'May', 'JUN': 'Jun', 'JUL': 'Jul', 'AUG': 'Aug',
  'SEP': 'Sep', 'OCT': 'Oct', 'NOV': 'Nov', 'DEC': 'Dec'
}

/**
 * Formats full date string (DD-MM-YYYY or DD-MMM-YYYY) to compact axis label (e.g. '24 Jul')
 */
export const formatAxisDate = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return ''
  
  const parts = dateStr.split('-')
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      // YYYY-MM-DD
      const [year, month, day] = parts
      const monthName = MONTH_MAP[month] || month
      return `${parseInt(day, 10)} ${monthName}`
    } else {
      // DD-MM-YYYY or DD-MMM-YYYY
      const [day, month, year] = parts
      const monthUpper = month.toUpperCase()
      const monthName = MONTH_MAP[month] || MONTH_MAP[monthUpper] || month.slice(0, 3)
      return `${parseInt(day, 10)} ${monthName}`
    }
  }
  return dateStr
}

/**
 * Filter time-series array based on selected timeframe
 * Timeframe options: '5D', '10D', '1M', '3M', '6M', 'ALL'
 */
export const filterByTimeframe = (data, timeframe = 'ALL') => {
  if (!Array.isArray(data) || data.length === 0) return []
  
  const total = data.length
  switch (timeframe) {
    case '5D':
      return data.slice(Math.max(0, total - 5))
    case '10D':
      return data.slice(Math.max(0, total - 10))
    case '1M':
      return data.slice(Math.max(0, total - 22)) // ~22 trading days
    case '3M':
      return data.slice(Math.max(0, total - 66)) // ~66 trading days
    case '6M':
      return data.slice(Math.max(0, total - 132))
    case 'ALL':
    default:
      return data
  }
}

/**
 * Calculate optimal X-axis interval to ensure labels never collide
 */
export const getAxisInterval = (dataLength) => {
  if (dataLength <= 7) return 0
  if (dataLength <= 15) return 1
  if (dataLength <= 30) return Math.floor(dataLength / 6)
  if (dataLength <= 60) return Math.floor(dataLength / 8)
  return Math.floor(dataLength / 10)
}

/**
 * Compact Indian number formatting (e.g. 1.2L, 45k, 3.4Cr)
 */
export const formatIndianCompact = (val, isCurrency = false) => {
  if (val === null || val === undefined || isNaN(val)) return '0'
  
  const absVal = Math.abs(val)
  const prefix = val < 0 ? '-' : ''
  const curr = isCurrency ? '₹' : ''
  
  if (absVal >= 1e7) {
    return `${prefix}${curr}${(absVal / 1e7).toFixed(1)}Cr`
  }
  if (absVal >= 1e5) {
    return `${prefix}${curr}${(absVal / 1e5).toFixed(1)}L`
  }
  if (absVal >= 1e3) {
    return `${prefix}${curr}${(absVal / 1e3).toFixed(1)}k`
  }
  return `${prefix}${curr}${absVal.toLocaleString('en-IN')}`
}

/**
 * Signed compact number formatting (e.g. +45.2k, -12.1L)
 */
export const formatSignedCompact = (val, isCurrency = false) => {
  if (val === null || val === undefined || isNaN(val)) return '0'
  if (val === 0) return isCurrency ? '₹0' : '0'
  const sign = val > 0 ? '+' : ''
  return `${sign}${formatIndianCompact(val, isCurrency)}`
}

/**
 * Specialized Rupee turnover formatting for derivatives turnover values (amount in ₹, where 1 Cr = 1e7)
 * Handles small amounts (₹84 Cr), standard amounts (₹24.5k Cr), and massive notional option turnover (₹22.7L Cr)
 */
export const formatRupeesCompact = (amountInRupees) => {
  if (amountInRupees === null || amountInRupees === undefined || isNaN(amountInRupees)) return '₹0'
  const crores = amountInRupees / 1e7
  const absCrores = Math.abs(crores)
  const sign = crores < 0 ? '-' : ''

  if (absCrores >= 100000) {
    // 1 Lakh Crores and above
    return `${sign}₹${(absCrores / 100000).toFixed(2)}L Cr`
  }
  if (absCrores >= 1000) {
    // 1,000 Crores to 99,999 Crores
    return `${sign}₹${(absCrores / 1000).toFixed(1)}k Cr`
  }
  if (absCrores >= 1) {
    // 1 Crore to 999 Crores
    return `${sign}₹${absCrores.toFixed(1)} Cr`
  }
  return `${sign}₹${absCrores.toFixed(2)} Cr`
}

/**
 * Signed version of formatRupeesCompact (e.g. +₹2.4k Cr, -₹540 Cr)
 */
export const formatSignedRupeesCompact = (amountInRupees) => {
  if (amountInRupees === null || amountInRupees === undefined || isNaN(amountInRupees)) return '₹0'
  if (amountInRupees === 0) return '₹0'
  const sign = amountInRupees > 0 ? '+' : ''
  return `${sign}${formatRupeesCompact(amountInRupees)}`
}
