import React from 'react'

const SortedCustomTooltip = ({ active, payload, label, formatter }) => {
  if (active && payload && payload.length) {
    const sortedPayload = [...payload].sort((a, b) => b.value - a.value);

    return (
      <div className="bg-[#0D121D]/95 border border-white/[0.12] rounded-xl p-3.5 shadow-2xl backdrop-blur-xl min-w-[200px]">
        <p className="text-xs font-mono font-semibold text-slate-300 mb-2.5 pb-1.5 border-b border-white/[0.08] tracking-wide">
          {label}
        </p>
        <div className="space-y-1.5">
          {sortedPayload.map((entry, index) => {
            const entryColor = entry.color || entry.fill || entry.stroke || '#10b981'
            return (
              <div key={`item-${index}`} className="flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full shadow-sm"
                    style={{ backgroundColor: entryColor, boxShadow: `0 0 6px ${entryColor}80` }}
                  />
                  <span className="text-slate-300 font-medium truncate max-w-[120px]">
                    {entry.name}
                  </span>
                </div>
                <span className="font-mono font-semibold text-slate-100 tabular-nums">
                  {formatter ? formatter(entry.value) : new Intl.NumberFormat('en-IN').format(entry.value)}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return null
}

export default SortedCustomTooltip
