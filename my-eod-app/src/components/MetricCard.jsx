import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

const MetricCard = ({ title, value, change, icon: Icon, color = 'emerald', subtitle }) => {
  const colorMap = {
    primary: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', dot: 'bg-emerald-400' },
    emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', dot: 'bg-emerald-400' },
    green: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', dot: 'bg-emerald-400' },
    rose: { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', dot: 'bg-rose-400' },
    red: { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', dot: 'bg-rose-400' },
    cyan: { text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', dot: 'bg-cyan-400' },
    amber: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', dot: 'bg-amber-400' },
    purple: { text: 'text-slate-300', bg: 'bg-slate-800/40', border: 'border-white/10', dot: 'bg-slate-400' },
    slate: { text: 'text-slate-300', bg: 'bg-slate-800/40', border: 'border-white/10', dot: 'bg-slate-400' },
  }

  const activeTheme = colorMap[color] || colorMap.emerald

  const formatValue = (val) => {
    if (typeof val === 'number') {
      if (Math.abs(val) >= 1e7) return `₹${(val / 1e7).toFixed(2)} Cr`
      if (Math.abs(val) >= 1e5) return `₹${(val / 1e5).toFixed(2)} L`
      return new Intl.NumberFormat('en-IN').format(val)
    }
    return val
  }

  return (
    <div className="bg-[#0D121D]/90 backdrop-blur-xl border border-white/[0.08] hover:border-white/[0.16] rounded-2xl p-5 shadow-terminal hover:shadow-[0_8px_24px_rgba(0,0,0,0.5)] transition-all duration-200 flex flex-col justify-between group">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${activeTheme.bg} border ${activeTheme.border} transition-transform group-hover:scale-105 duration-200`}>
          {Icon && <Icon className={`h-4 w-4 ${activeTheme.text}`} />}
        </div>
        {change !== undefined && change !== null && (
          <span className={`inline-flex items-center gap-1 text-xs font-mono font-medium px-2 py-0.5 rounded-md ${
            Number(change) > 0 
              ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' 
              : Number(change) < 0 
              ? 'text-rose-400 bg-rose-500/10 border border-rose-500/20' 
              : 'text-slate-400 bg-slate-800/60 border border-white/5'
          }`}>
            {Number(change) > 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : Number(change) < 0 ? (
              <TrendingDown className="h-3 w-3" />
            ) : (
              <Minus className="h-3 w-3" />
            )}
            {Number(change) > 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
      <div>
        <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-white tabular-nums mb-1">
          {formatValue(value)}
        </div>
        <div className="text-xs font-medium text-slate-400 tracking-tight flex items-center justify-between">
          <span>{title}</span>
          {subtitle && <span className="text-[10px] text-slate-400 font-mono">{subtitle}</span>}
        </div>
      </div>
    </div>
  )
}

export default MetricCard