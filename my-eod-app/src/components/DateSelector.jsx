import React from 'react'
import { Calendar } from 'lucide-react'

const DateSelector = ({ 
  selectedDate, 
  previousDate, 
  availableDates = [], 
  onDateChange, 
  onPrevDateChange 
}) => {
  return (
    <div className="inline-flex items-center gap-3 bg-[#0D121D]/90 border border-white/[0.08] rounded-xl px-3 py-1.5 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Calendar className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-slate-300">Date</span>
        </div>
        <select
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="px-2.5 py-1 bg-[#161D2B] border border-white/[0.08] rounded-lg text-xs font-mono font-medium focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none text-slate-200 cursor-pointer hover:border-white/[0.15] transition-colors"
        >
          {availableDates.map(date => (
            <option key={date} value={date}>{date}</option>
          ))}
        </select>
      </div>

      {(previousDate !== undefined && onPrevDateChange) && (
        <>
          <div className="w-px h-4 bg-white/10" />
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-slate-400">Compare</span>
            <select
              value={previousDate}
              onChange={(e) => onPrevDateChange(e.target.value)}
              className="px-2.5 py-1 bg-[#161D2B] border border-white/[0.08] rounded-lg text-xs font-mono font-medium focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none text-slate-300 cursor-pointer hover:border-white/[0.15] transition-colors"
            >
              {availableDates.map(date => (
                <option key={date} value={date}>{date}</option>
              ))}
            </select>
          </div>
        </>
      )}
    </div>
  )
}

export default DateSelector
