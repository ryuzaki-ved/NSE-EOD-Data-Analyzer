import React, { useState } from 'react'
import { ChevronUp, ChevronDown, Search, ArrowUpDown, X } from 'lucide-react'

const DataTable = ({ data, columns, title, defaultSortKey = null, defaultSortDirection = 'asc' }) => {
  const [sortConfig, setSortConfig] = useState({ 
    key: defaultSortKey, 
    direction: defaultSortDirection 
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const parseDateString = (dateStr) => {
    if (typeof dateStr !== 'string') return new Date(0)
    const [day, month, year] = dateStr.split('-')
    const monthMap = {
      'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
      'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    }
    return new Date(parseInt(year), monthMap[month] || 0, parseInt(day))
  }

  const handleSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const sortedData = React.useMemo(() => {
    let sortableData = [...data]
    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        let aVal = a[sortConfig.key]
        let bVal = b[sortConfig.key]
        
        if (sortConfig.key === 'date') {
          aVal = parseDateString(aVal)
          bVal = parseDateString(bVal)
        }
        
        if (aVal < bVal) {
          return sortConfig.direction === 'asc' ? -1 : 1
        }
        if (aVal > bVal) {
          return sortConfig.direction === 'asc' ? 1 : -1
        }
        return 0
      })
    }
    return sortableData
  }, [data, sortConfig])

  const filteredData = sortedData.filter(item =>
    Object.values(item).some(value =>
      value !== null && value !== undefined && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage)

  const formatValue = (value, key) => {
    if (typeof value === 'number') {
      if (key.includes('amt') || key.includes('amount')) {
        return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value)
      }
      return new Intl.NumberFormat('en-IN').format(value)
    }
    return value
  }

  return (
    <div className="bg-[#0D121D]/90 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 shadow-terminal">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Total records: {filteredData.length}
          </p>
        </div>
        
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full pl-9 pr-8 py-1.5 bg-[#161D2B] border border-white/[0.08] rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-colors"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#111726] border-b border-white/[0.08]">
              {columns.map((column) => {
                const isSorted = sortConfig.key === column.key
                return (
                  <th
                    key={column.key}
                    className="py-3 px-4 text-xs font-semibold font-mono uppercase tracking-wider text-slate-300 cursor-pointer hover:text-white transition-colors select-none"
                    onClick={() => handleSort(column.key)}
                  >
                    <div className="flex items-center space-x-1.5">
                      <span>{column.label}</span>
                      <span className="text-slate-500">
                        {isSorted ? (
                          sortConfig.direction === 'asc' ? (
                            <ChevronUp className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5 text-emerald-400" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-30 hover:opacity-100" />
                        )}
                      </span>
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, index) => (
                <tr
                  key={index}
                  className="hover:bg-white/[0.02] transition-colors group"
                >
                  {columns.map((column) => (
                    <td key={column.key} className="py-3 px-4 text-xs font-mono text-slate-300 tabular-nums">
                      {formatValue(row[column.key], column.key)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="py-8 text-center text-xs text-slate-400 font-mono">
                  No matching data entries found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4 pt-3 border-t border-white/[0.06]">
        <div className="text-xs font-mono text-slate-400">
          Showing <span className="text-slate-200">{filteredData.length ? startIndex + 1 : 0}</span> to <span className="text-slate-200">{Math.min(startIndex + itemsPerPage, filteredData.length)}</span> of <span className="text-slate-200">{filteredData.length}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-[#161D2B] border border-white/[0.08] rounded-lg text-xs font-medium text-slate-300 disabled:opacity-40 hover:bg-white/[0.06] hover:text-white transition-colors"
          >
            Previous
          </button>
          
          <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {currentPage} / {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-3 py-1 bg-[#161D2B] border border-white/[0.08] rounded-lg text-xs font-medium text-slate-300 disabled:opacity-40 hover:bg-white/[0.06] hover:text-white transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}

export default DataTable