import React from 'react'
import { Link } from 'react-router-dom'
import { BarChart3, PieChart, Activity, TrendingUp, ArrowRight, BarChart, Zap, Brain } from 'lucide-react'
import { motion } from 'framer-motion'

const HomePage = () => {
  const features = [
    {
      title: 'FII Derivatives Stats',
      description: 'Deep dive into Foreign Institutional Investor trading patterns with advanced visualization of buy/sell trends.',
      icon: BarChart3,
      path: '/fii-deriv-stats',
      color: 'from-blue-500 to-cyan-500',
      delay: 0.1
    },
    {
      title: 'Participant OI',
      description: 'Track open interest distribution across Client, DII, FII, and Pro categories to understand market sentiment.',
      icon: PieChart,
      path: '/part-oi',
      color: 'from-purple-500 to-pink-500',
      delay: 0.2
    },
    {
      title: 'Participant Volume',
      description: 'Analyze volume concentration and trading intensity across different market segments and participants.',
      icon: Activity,
      path: '/part-vol',
      color: 'from-green-500 to-emerald-500',
      delay: 0.3
    },
    {
      title: 'Correlation Matrix',
      description: 'Uncover hidden relationships between market participants using advanced statistical correlation models.',
      icon: Zap,
      path: '/correlation',
      color: 'from-orange-500 to-red-500',
      delay: 0.4
    },
    {
      title: 'Advanced Math',
      description: 'Predictive modeling using Z-Scores, PCR ratios, and statistical deviation analysis.',
      icon: Brain,
      path: '/advanced-math',
      color: 'from-indigo-500 to-violet-500',
      delay: 0.5
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  }

  return (
    <motion.div 
      className="min-h-[80vh] flex flex-col justify-center"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center mb-20 relative"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-500/20 rounded-full blur-[100px] -z-10"></div>
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="inline-block mb-4 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-300 text-sm font-medium"
        >
          Next-Gen Market Intelligence
        </motion.div>

        <h1 className="text-6xl md:text-8xl font-bold mb-8 tracking-tight">
          <span className="bg-gradient-to-r from-white via-primary-100 to-primary-300 bg-clip-text text-transparent">
            Market Data
          </span>
          <br />
          <span className="bg-gradient-to-r from-primary-400 via-accent-purple to-accent-pink bg-clip-text text-transparent">
            Reimagined
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-slate-400 mb-10 max-w-3xl mx-auto leading-relaxed">
          Advanced visualization and statistical analysis platform for End-of-Day derivatives market data.
        </p>

        <motion.div 
          className="flex flex-wrap items-center justify-center gap-8"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="flex items-center space-x-3 text-slate-300 bg-dark-800/50 px-6 py-3 rounded-2xl border border-white/5 backdrop-blur-sm">
            <div className="p-2 bg-primary-500/20 rounded-lg">
              <TrendingUp className="h-5 w-5 text-primary-400" />
            </div>
            <span className="font-medium">Smart Insights</span>
          </motion.div>
          <motion.div variants={itemVariants} className="flex items-center space-x-3 text-slate-300 bg-dark-800/50 px-6 py-3 rounded-2xl border border-white/5 backdrop-blur-sm">
            <div className="p-2 bg-accent-purple/20 rounded-lg">
              <BarChart3 className="h-5 w-5 text-accent-purple" />
            </div>
            <span className="font-medium">Interactive Charts</span>
          </motion.div>
          <motion.div variants={itemVariants} className="flex items-center space-x-3 text-slate-300 bg-dark-800/50 px-6 py-3 rounded-2xl border border-white/5 backdrop-blur-sm">
            <div className="p-2 bg-accent-pink/20 rounded-lg">
              <Activity className="h-5 w-5 text-accent-pink" />
            </div>
            <span className="font-medium">Real-time Analytics</span>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Features Grid */}
      <motion.div 
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20"
        variants={containerVariants}
      >
        {features.map((feature, index) => (
          <motion.div key={feature.path} variants={itemVariants}>
            <Link
              to={feature.path}
              className="group relative block h-full"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-accent-purple/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative h-full glass-card p-8 hover:border-primary-500/30 transition-all duration-300 group-hover:-translate-y-2">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-primary-300 transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-slate-400 mb-6 leading-relaxed">
                  {feature.description}
                </p>
                
                <div className="flex items-center text-primary-400 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                  <span>Explore Data</span>
                  <ArrowRight className="h-4 w-4 ml-2" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Stats Section */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="glass-card p-10 text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary-500/5 to-transparent pointer-events-none"></div>
        <h2 className="text-4xl font-bold mb-12 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Market Overview</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'Trading Days', value: '9', color: 'text-primary-400' },
            { label: 'Data Points', value: '50K+', color: 'text-accent-purple' },
            { label: 'Participants', value: '4', color: 'text-accent-pink' },
            { label: 'Accuracy', value: '99.9%', color: 'text-accent-emerald' }
          ].map((stat, index) => (
            <motion.div 
              key={index}
              whileHover={{ scale: 1.05 }}
              className="p-6 rounded-2xl bg-dark-800/30 border border-white/5"
            >
              <div className={`text-4xl font-bold ${stat.color} mb-2`}>{stat.value}</div>
              <div className="text-sm text-slate-400 font-medium uppercase tracking-wider">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default HomePage