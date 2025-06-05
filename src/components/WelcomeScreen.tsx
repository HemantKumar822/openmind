
import { MessageCircle, Sparkles, Shield, Zap, ArrowRight, Bot } from 'lucide-react';
import { motion } from 'framer-motion';

export const WelcomeScreen = () => {
  const features = [
    { 
      icon: <MessageCircle className="h-6 w-6" />, 
      title: "Smart Conversations", 
      description: "Natural, context-aware discussions that understand you",
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50 dark:from-blue-950/50 to-cyan-950/50"
    },
    { 
      icon: <Sparkles className="h-6 w-6" />, 
      title: "Multiple AI Models", 
      description: "Access different AI capabilities for every need",
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50 dark:from-purple-950/50 to-pink-950/50"
    },
    { 
      icon: <Shield className="h-6 w-6" />, 
      title: "Private & Secure", 
      description: "Your conversations stay protected and confidential",
      gradient: "from-green-500 to-emerald-500",
      bgGradient: "from-green-50 to-emerald-50 dark:from-green-950/50 to-emerald-950/50"
    },
    { 
      icon: <Zap className="h-6 w-6" />, 
      title: "Lightning Fast", 
      description: "Instant responses with real-time streaming",
      gradient: "from-amber-500 to-orange-500",
      bgGradient: "from-amber-50 to-orange-50 dark:from-amber-950/50 to-orange-950/50"
    }
  ];

  const suggestions = [
    "Explain quantum computing in simple terms",
    "Write a creative story about time travel",
    "Help me plan a healthy meal prep",
    "Debug my JavaScript code"
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl dark:from-blue-600/10 dark:to-purple-600/10"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-400/20 to-orange-400/20 rounded-full blur-3xl dark:from-pink-600/10 dark:to-orange-600/10"></div>
      </div>

      <div className="w-full max-w-6xl mx-auto flex-1 flex flex-col items-center justify-center relative z-10">
        {/* Main Header */}
        <motion.div 
          className="text-center mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {/* Logo/Icon */}
          <motion.div 
            className="mb-6 flex justify-center"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl">
                <Bot className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur-xl opacity-30 animate-pulse"></div>
            </div>
          </motion.div>

          {/* Brand Name */}
          <motion.h1 
            className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              OPEN
            </span>
            <span className="ml-2 sm:ml-4 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
              MIND
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            className="text-xl sm:text-2xl lg:text-3xl text-gray-600 dark:text-gray-300 font-medium mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Open access to intelligence for{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold">
              everyone
            </span>
          </motion.p>

          {/* Description */}
          <motion.p 
            className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            Experience the power of AI with multiple models, secure conversations, and lightning-fast responses. 
            Start chatting below to explore endless possibilities.
          </motion.p>
        </motion.div>
        
        {/* Feature Cards Grid */}
        <motion.div 
          className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          {features.map((feature, index) => (
            <motion.div 
              key={feature.title}
              className={`relative p-6 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm bg-gradient-to-br ${feature.bgGradient} hover:scale-105 transition-all duration-300 group cursor-pointer shadow-lg hover:shadow-xl`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + (index * 0.1), duration: 0.6 }}
              whileHover={{ y: -5 }}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-gray-900 group-hover:to-gray-700 group-hover:bg-clip-text dark:group-hover:from-white dark:group-hover:to-gray-300 transition-all duration-300">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Start Suggestions */}
        <motion.div 
          className="w-full max-w-4xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.8 }}
        >
          <h3 className="text-xl sm:text-2xl font-bold text-center text-gray-800 dark:text-gray-200 mb-6">
            Try asking about...
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {suggestions.map((suggestion, index) => (
              <motion.div
                key={suggestion}
                className="group p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg transition-all duration-300 cursor-pointer"
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1 + (index * 0.1), duration: 0.6 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                    {suggestion}
                  </span>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div 
          className="mt-8 sm:mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.8 }}
        >
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Ready to start? Type your message in the input below ↓
          </p>
          <motion.div 
            className="w-8 h-8 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ArrowRight className="w-4 h-4 text-white rotate-90" />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
