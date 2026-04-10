import React from 'react'
import { Link } from 'react-router-dom'
import { BarChart3, PieChart, Activity, GitBranch, Brain, ArrowRight, ShieldCheck, Database, Layers, ArrowUpRight, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import InnovationBackground from '../components/InnovationBackground'
import ThreeDCard from '../components/ThreeDCard'

const HomePage = () => {
  const modules = [
    {
      id: 'fii-stats',
      title: 'FII Derivatives Statistics',
      subtitle: 'INSTITUTIONAL POSITIONING',
      description: 'Granular tracking of Foreign Institutional Investor contract flows, net buy/sell turnover (₹ Cr), and historical open interest in Index & Stock derivatives.',
      icon: BarChart3,
      path: '/fii-deriv-stats',
      tags: ['Futures OI', 'Options Turnover', 'Net Flow Dynamics'],
      accentColor: 'text-rose-400',
      badgeBg: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
      hoverBorder: 'group-hover:border-rose-500/40'
    },
    {
      id: 'part-oi',
      title: 'Participant Open Interest',
      subtitle: 'CROSS-DESK POSITIONING',
      description: 'Comprehensive breakdown of open interest across Client (Retail/HNI), DII, FII, and Pro desks with Long/Short ratios and cumulative buildup.',
      icon: PieChart,
      path: '/part-oi',
      tags: ['Client vs Pro', 'PCR Metrics', 'Weekly Options Buildup'],
      accentColor: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
      hoverBorder: 'group-hover:border-emerald-500/40'
    },
    {
      id: 'part-vol',
      title: 'Participant Trading Volume',
      subtitle: 'LIQUIDITY & FLOW SHIFTS',
      description: 'Segmented turnover distribution, trading intensity, and intraday volume adjustments comparing open and closed positions across all market participants.',
      icon: Activity,
      path: '/part-vol',
      tags: ['Intraday Volume', 'OI Adjustments', 'Desk Market Share'],
      accentColor: 'text-cyan-400',
      badgeBg: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
      hoverBorder: 'group-hover:border-cyan-500/40'
    },
    {
      id: 'correlation',
      title: 'Cross-Participant Correlation',
      subtitle: 'STATISTICAL CO-MOVEMENT',
      description: 'Pearson correlation matrices, rolling historical correlation windows, participant sentiment divergence, and counterparty positioning patterns.',
      icon: GitBranch,
      path: '/correlation',
      tags: ['Pearson Matrix', 'Rolling Windows', 'Desk Divergence'],
      accentColor: 'text-amber-400',
      badgeBg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
      hoverBorder: 'group-hover:border-amber-500/40'
    },
    {
      id: 'advanced-math',
      title: 'Statistical Models & Analytics',
      subtitle: 'QUANTITATIVE INSIGHTS',
      description: 'Z-Score deviation models, Historical Volatility, Put-Call Ratio (PCR) dynamics, return distribution metrics, and statistical risk statistics.',
      icon: Brain,
      path: '/advanced-math',
      tags: ['Z-Scores', 'Volatility Bands', 'Risk Metrics'],
      accentColor: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
      hoverBorder: 'group-hover:border-emerald-500/40'
    }
  ]

  const capabilities = [
    { label: 'Data Source', value: 'Official NSE EOD Feeds', desc: 'Futures & Options Participant Bhavcopy' },
    { label: 'Tracked Desks', value: 'Client • DII • FII • Pro', desc: 'Complete market participant coverage' },
    { label: 'Contract Types', value: 'Index & Stock F&O', desc: 'Futures, Calls & Puts (Buy/Sell)' },
    { label: 'Analytics Engine', value: '100% Client-Side Fast', desc: 'Instant filtering, sorting & date comparison' }
  ]

  return (
    <div className="relative min-h-screen text-slate-100 selection:bg-emerald-500/20 selection:text-emerald-300">
      <InnovationBackground />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* Terminal Header & Status */}
        <div className="text-center max-w-4xl mx-auto mb-16 sm:mb-20">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0D121D]/90 border border-white/[0.08] shadow-sm mb-6"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-semibold">
              NSE EOD MARKET INTELLIGENCE TERMINAL
            </span>
          </motion.div>

          <motion.h1 
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Institutional Derivatives & Participant Intelligence
          </motion.h1>

          <motion.p 
            className="text-base sm:text-lg md:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed font-normal"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Comprehensive End-of-Day derivatives market intelligence. Deep-dive into institutional positioning, participant open interest, liquidity flows, and cross-desk correlation metrics.
          </motion.p>
        </div>

        {/* 5 Core Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {modules.map((mod, index) => (
            <ThreeDCard key={mod.id} className="h-full">
              <Link to={mod.path} className="block h-full group">
                <div className={`h-full bg-[#0D121D]/90 backdrop-blur-xl border border-white/[0.08] ${mod.hoverBorder} rounded-2xl p-6 flex flex-col justify-between shadow-terminal hover:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.6)] transition-all duration-300`}>
                  <div>
                    {/* Top Row: Icon & Subtitle */}
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] group-hover:bg-white/[0.06] transition-colors`}>
                        <mod.icon className={`h-5 w-5 ${mod.accentColor}`} />
                      </div>
                      <span className={`text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${mod.badgeBg}`}>
                        {mod.subtitle}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-white mb-2 tracking-tight group-hover:text-emerald-300 transition-colors flex items-center justify-between">
                      <span>{mod.title}</span>
                      <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                    </h3>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6 font-normal">
                      {mod.description}
                    </p>
                  </div>

                  {/* Tags & Action Link */}
                  <div className="pt-4 border-t border-white/[0.06]">
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {mod.tags.map((tag, i) => (
                        <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.03] text-slate-400 border border-white/[0.05]">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center text-xs font-semibold text-slate-300 group-hover:text-emerald-400 transition-colors">
                      <span>Open Workspace</span>
                      <ArrowRight className="h-3.5 w-3.5 ml-1.5 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            </ThreeDCard>
          ))}
        </div>

        {/* Data Architecture & Specifications */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-[#0D121D]/90 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 sm:p-8 shadow-terminal"
        >
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-white/[0.08]">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <Database className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white tracking-tight">Platform Specifications & Architecture</h4>
              <p className="text-xs text-slate-400 font-mono">Official NSE derivatives aggregation pipeline</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {capabilities.map((item, i) => (
              <div key={i} className="bg-[#111726]/60 border border-white/[0.06] rounded-xl p-4">
                <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1">
                  {item.label}
                </div>
                <div className="text-base font-bold text-white tracking-tight mb-1 font-mono">
                  {item.value}
                </div>
                <div className="text-xs text-slate-400">
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  )
}

export default HomePage