import React from 'react'
import { Link } from 'react-router-dom'
import { BarChart3, PieChart, Activity, TrendingUp, ArrowRight, BarChart } from 'lucide-react'

const HomePage = () => {
  const features = [
    {
      title: 'FII Derivatives Statistics',
      description: 'Comprehensive analysis of Foreign Institutional Investor derivatives trading data with buy/sell patterns and open interest trends.',
      icon: BarChart3,
      path: '/fii-deriv-stats',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Participant Open Interest',
      description: 'Track open interest positions across different participant categories including Client, DII, FII, and Proprietary traders.',
      icon: PieChart,
      path: '/part-oi',
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Participant Volume',
      description: 'Analyze trading volume patterns and trends across various market participants and instrument categories.',
      icon: Activity,
      path: '/part-vol',
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Correlation Analysis',
      description: 'Advanced statistical analysis of relationships between market participants, including rolling correlations and time-lagged analysis.',
      icon: BarChart,
      path: '/correlation',
      color: 'from-orange-500 to-red-500'
    }
  ]

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          <span className="gradient-text">EOD Analytics</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
          Advanced visualization and analysis platform for End-of-Day derivatives market data
        </p>
        <div className="flex items-center justify-center space-x-4">
          <div className="flex items-center space-x-2 text-primary-400">
            <TrendingUp className="h-5 w-5" />
            <span>Real-time Insights</span>
          </div>
          <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
          <div className="flex items-center space-x-2 text-primary-400">
            <BarChart3 className="h-5 w-5" />
            <span>Interactive Charts</span>
          </div>
          <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
          <div className="flex items-center space-x-2 text-primary-400">
            <Activity className="h-5 w-5" />
            <span>Market Analytics</span>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        {features.map((feature, index) => (
          <Link
            key={feature.path}
            to={feature.path}
            className="group data-card animate-slide-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
              <feature.icon className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-3 group-hover:text-primary-400 transition-colors">
              {feature.title}
            </h3>
            <p className="text-gray-400 mb-4 leading-relaxed">
              {feature.description}
            </p>
            <div className="flex items-center text-primary-400 group-hover:translate-x-2 transition-transform duration-300">
              <span className="text-sm font-medium">Explore Data</span>
              <ArrowRight className="h-4 w-4 ml-2" />
            </div>
          </Link>
        ))}
      </div>

      {/* Stats Section */}
      <div className="glass-card p-8 text-center">
        <h2 className="text-3xl font-bold mb-8 gradient-text">Market Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="metric-card">
            <div className="text-3xl font-bold text-primary-400 mb-2">9</div>
            <div className="text-sm text-gray-400">Trading Days</div>
          </div>
          <div className="metric-card">
            <div className="text-3xl font-bold text-green-400 mb-2">4</div>
            <div className="text-sm text-gray-400">Data Categories</div>
          </div>
          <div className="metric-card">
            <div className="text-3xl font-bold text-purple-400 mb-2">15+</div>
            <div className="text-sm text-gray-400">Instruments</div>
          </div>
          <div className="metric-card">
            <div className="text-3xl font-bold text-cyan-400 mb-2">Real-time</div>
            <div className="text-sm text-gray-400">Analytics</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage