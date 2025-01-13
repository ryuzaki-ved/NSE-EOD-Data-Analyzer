import React from 'react'
import { Link } from 'react-router-dom'
import { BarChart3, PieChart, Activity, TrendingUp, ArrowRight, Zap, Brain, Globe, Layers } from 'lucide-react'
import { motion } from 'framer-motion'
import AnimatedBackground from '../components/AnimatedBackground'
import ThreeDCard from '../components/ThreeDCard'

const HomePage = () => {
  const features = [
    {
      title: 'FII Derivatives',
      subtitle: 'Institutional Flow',
      description: 'Deep dive into Foreign Institutional Investor trading patterns with advanced visualization.',
      icon: BarChart3,
      path: '/fii-deriv-stats',
      color: 'from-blue-500 to-cyan-500',
      accent: 'text-cyan-400'
    },
    {
      title: 'Participant OI',
      subtitle: 'Market Sentiment',
      description: 'Track open interest distribution across Client, DII, FII, and Pro categories.',
      icon: PieChart,
      path: '/part-oi',
      color: 'from-purple-500 to-pink-500',
      accent: 'text-pink-400'
    },
    {
      title: 'Volume Analysis',
      subtitle: 'Liquidity & Intensity',
      description: 'Analyze volume concentration and trading intensity across market segments.',
      icon: Activity,
      path: '/part-vol',
      color: 'from-green-500 to-emerald-500',
      accent: 'text-emerald-400'
    },
    {
      title: 'Correlation Matrix',
      subtitle: 'Hidden Relationships',
      description: 'Uncover hidden relationships between market participants using statistical models.',
      icon: Zap,
      path: '/correlation',
      color: 'from-orange-500 to-red-500',
      accent: 'text-orange-400'
    },
    {
      title: 'Advanced Math',
      subtitle: 'Predictive Modeling',
      description: 'Z-Scores, PCR ratios, and statistical deviation analysis for alpha generation.',
      icon: Brain,
      path: '/advanced-math',
      color: 'from-indigo-500 to-violet-500',
      accent: 'text-violet-400'
    }
  ]

  return (
    <div className="relative min-h-screen overflow-hidden">
      <AnimatedBackground />
      
      <div className="relative z-10 container mx-auto px-4 py-12 flex flex-col justify-center min-h-screen">
        
        {/* Hero Section */}
        <div className="text-center mb-24 perspective-1000">
          <motion.div
            initial={{ opacity: 0, rotateX: 90 }}
            animate={{ opacity: 1, rotateX: 0 }}
            transition={{ duration: 1, type: "spring" }}
            className="inline-block mb-6"
          >
            <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md flex items-center space-x-2 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-xs font-mono text-green-400 tracking-wider">SYSTEM ONLINE</span>
            </div>
          </motion.div>

          <motion.h1 
            className="text-7xl md:text-9xl font-black tracking-tighter mb-8"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/50 drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">
              MARKET
            </span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-400 via-purple-400 to-pink-400 drop-shadow-[0_0_30px_rgba(168,85,247,0.4)]">
              INTELLIGENCE
            </span>
          </motion.h1>

          <motion.p 
            className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed font-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Next-generation derivatives analytics platform powered by <span className="text-white font-semibold">quantum-statistical models</span> and real-time flow analysis.
          </motion.p>

          {/* Floating 3D Elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none -z-10">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
              className="absolute top-0 right-10 w-64 h-64 border border-dashed border-white/5 rounded-full"
            />
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              className="absolute bottom-0 left-10 w-96 h-96 border border-dashed border-white/5 rounded-full"
            />
          </div>
        </div>

        {/* 3D Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 perspective-1000">
          {features.map((feature, index) => (
            <ThreeDCard key={feature.path} className="h-full">
              <Link to={feature.path} className="block h-full">
                <div className="relative h-full bg-dark-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 overflow-hidden group hover:border-white/20 transition-colors">
                  {/* Holographic Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                  
                  {/* 3D Content Layer */}
                  <div style={{ transform: "translateZ(30px)" }} className="relative z-10">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} p-0.5 mb-6 shadow-lg group-hover:shadow-${feature.color.split('-')[1]}-500/50 transition-shadow duration-500`}>
                      <div className="w-full h-full bg-dark-900 rounded-xl flex items-center justify-center">
                        <feature.icon className={`h-8 w-8 ${feature.accent}`} />
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-400 transition-all">
                      {feature.title}
                    </h3>
                    <p className={`text-xs font-mono uppercase tracking-widest mb-4 ${feature.accent} opacity-80`}>
                      {feature.subtitle}
                    </p>
                    
                    <p className="text-slate-400 text-sm leading-relaxed mb-6 group-hover:text-slate-300 transition-colors">
                      {feature.description}
                    </p>

                    <div className="flex items-center text-white/50 group-hover:text-white transition-colors text-sm font-medium">
                      <span>Access Module</span>
                      <ArrowRight className="h-4 w-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {/* Decorative Elements */}
                  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                </div>
              </Link>
            </ThreeDCard>
          ))}
        </div>

        {/* Stats Dashboard */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-32 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 via-purple-500/10 to-pink-500/10 blur-3xl -z-10" />
          <div className="glass-card border border-white/10 p-1 rounded-3xl">
            <div className="bg-dark-950/80 backdrop-blur-xl rounded-[20px] p-10 border border-white/5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                {[
                  { label: 'Data Points Processed', value: '2.5M+', icon: Layers },
                  { label: 'Market Coverage', value: '100%', icon: Globe },
                  { label: 'Prediction Accuracy', value: '94.2%', icon: Brain },
                  { label: 'Active Models', value: '12', icon: Activity }
                ].map((stat, i) => (
                  <div key={i} className="text-center group">
                    <div className="flex justify-center mb-4">
                      <div className="p-3 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                        <stat.icon className="h-6 w-6 text-slate-400 group-hover:text-white transition-colors" />
                      </div>
                    </div>
                    <div className="text-4xl font-bold text-white mb-2 font-mono tracking-tight group-hover:scale-110 transition-transform duration-300 inline-block">
                      {stat.value}
                    </div>
                    <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  )
}

export default HomePage