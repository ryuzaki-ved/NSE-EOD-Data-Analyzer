import React from 'react'

const DateSelector = ({ 
  selectedDate, 
  previousDate, 
  availableDates, 
  onDateChange, 
  onPrevDateChange 
}) => {
  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <label className="text-xs text-slate-400 uppercase font-bold">Latest</label>
        <select
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="px-2 py-1 bg-dark-800 border border-white/10 rounded-lg text-sm focus:ring-1 focus:ring-primary-500 outline-none text-slate-300"
        >
          {availableDates.map(date => (
            <option key={date} value={date}>{date}</option>
          ))}
        </select>
      </div>
      {(previousDate !== undefined && onPrevDateChange) && (
        <>
          <div className="w-px h-4 bg-white/10"></div>
          <div className="flex items-center space-x-2">
            <label className="text-xs text-slate-400 uppercase font-bold">Prev</label>
            <select
              value={previousDate}
              onChange={(e) => onPrevDateChange(e.target.value)}
              className="px-2 py-1 bg-dark-800 border border-white/10 rounded-lg text-sm focus:ring-1 focus:ring-primary-500 outline-none text-slate-300"
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
