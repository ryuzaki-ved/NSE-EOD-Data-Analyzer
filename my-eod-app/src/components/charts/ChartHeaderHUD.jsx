import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatSignedCompact, formatIndianCompact } from '../../utils/chartHelpers'

const TIMEFRAME_OPTIONS = ['5D', '10D', '1M', '3M', 'ALL']

const ChartHeaderHUD = ({
  title,
  subtitle,
  tag,
  timeframe,
  onTimeframeChange,
  viewMode,
  viewOptions,
  onViewModeChange,
  seriesChips,
  onToggleSeries,
  hoveredData,
}) => {
  return (
    <div className="flex flex-col space-y-3 mb-3">
      {/* Top Row: Title, Tag, Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
            {tag && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-semibold text-emerald-400">
                {tag}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>

        {/* Action Controls: View Mode & Timeframe */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Segmented Toggle */}
          {viewOptions && viewOptions.length > 0 && (
            <div className="flex items-center p-0.5 bg-[#0B0F19] border border-white/[0.08] rounded-lg">
              {viewOptions.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => onViewModeChange && onViewModeChange(opt.key)}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all duration-150 ${
                    viewMode === opt.key
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {/* Timeframe Slicer */}
          {onTimeframeChange && (
            <div className="flex items-center p-0.5 bg-[#0B0F19] border border-white/[0.08] rounded-lg">
              {TIMEFRAME_OPTIONS.map((tf) => (
                <button
                  key={tf}
                  onClick={() => onTimeframeChange(tf)}
                  className={`px-2 py-0.5 text-[10px] font-mono font-medium rounded-md transition-all duration-150 ${
                    timeframe === tf
                      ? 'bg-white/[0.12] text-white border border-white/[0.15]'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Series Filter Chips (if any) */}
      {seriesChips && seriesChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] font-mono uppercase text-slate-400 mr-1">DESK:</span>
          {seriesChips.map((chip) => (
            <button
              key={chip.key}
              onClick={() => onToggleSeries && onToggleSeries(chip.key)}
              className={`flex items-center space-x-1.5 px-2 py-0.5 rounded-md text-[11px] font-mono transition-all border ${
                chip.active
                  ? 'bg-white/[0.06] text-white border-white/[0.15]'
                  : 'bg-transparent text-slate-400 border-white/[0.04] opacity-40 hover:opacity-75'
              }`}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: chip.color }}
              />
              <span>{chip.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Live Monospace Crosshair HUD Bar */}
      <div className="min-h-8 px-3 py-1.5 bg-[#090D16] border border-white/[0.05] rounded-lg flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        {hoveredData ? (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 w-full justify-between">
            <div className="flex items-center space-x-2 text-slate-400">
              <span className="text-[10px] text-slate-400 uppercase">SESSION:</span>
              <span className="text-white font-bold">{hoveredData.date}</span>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              {hoveredData.values &&
                hoveredData.values.map((v, i) => (
                  <div key={i} className="flex items-center space-x-1">
                    <span className="text-[10px] text-slate-400">{v.label}:</span>
                    <span className="font-semibold" style={{ color: v.color || '#E2E8F0' }}>
                      {typeof v.value === 'number' ? formatSignedCompact(v.value) : v.value}
                    </span>
                  </div>
                ))}
            </div>

            {hoveredData.bias && (
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  hoveredData.bias.includes('BUY') || hoveredData.bias.includes('BULL')
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : hoveredData.bias.includes('SELL') || hoveredData.bias.includes('BEAR')
                    ? 'bg-rose-500/15 text-rose-400'
                    : 'bg-slate-500/15 text-slate-400'
                }`}
              >
                {hoveredData.bias}
              </span>
            )}
          </div>
        ) : (
          <div className="text-[11px] text-slate-400 flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Hover across chart to inspect live contract deltas & flow metrics</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChartHeaderHUD
