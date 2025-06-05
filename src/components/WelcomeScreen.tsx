
import { MessageCircle, Sparkles, Shield, Zap, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const WelcomeScreen = () => {
  const features = [
    { 
      icon: <MessageCircle className="h-5 w-5" />, 
      title: "Smart Conversations", 
      description: "Natural, context-aware discussions"
    },
    { 
      icon: <Sparkles className="h-5 w-5" />, 
      title: "Multiple Models", 
      description: "Access different AI capabilities"
    },
    { 
      icon: <Shield className="h-5 w-5" />, 
      title: "Private & Secure", 
      description: "Your conversations stay protected"
    },
    { 
      icon: <Zap className="h-5 w-5" />, 
      title: "Lightning Fast", 
      description: "Instant responses with streaming"
    }
  ];

  const suggestions = [
    "Explain quantum computing simply",
    "Write a creative story",
    "Help with meal planning",
    "Debug JavaScript code"
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 min-h-full">
      <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col items-center justify-center">
        
        {/* Main Header */}
        <motion.div 
          className="text-center mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {/* Brand Name */}
          <motion.h1 
            className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4 sm:mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span className="bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent">
              OPEN
            </span>
            <span className="ml-2 sm:ml-3 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
              MIND
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            className="text-lg sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 font-medium mb-4 sm:mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Open access to intelligence for{' '}
            <span className="text-blue-600 dark:text-blue-400 font-semibold">
              everyone
            </span>
          </motion.p>

          {/* Description */}
          <motion.p 
            className="text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Experience the power of AI with multiple models, secure conversations, and lightning-fast responses.
          </motion.p>
        </motion.div>
        
        {/* Feature Cards Grid */}
        <motion.div 
          className="w-full max-w-4xl grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          {features.map((feature, index) => (
            <motion.div 
              key={feature.title}
              className="relative p-4 sm:p-6 rounded-xl border border-gray-200/60 dark:border-gray-700/60 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 group cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + (index * 0.1), duration: 0.5 }}
              whileHover={{ y: -2, scale: 1.02 }}
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3 sm:mb-4 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base mb-1 sm:mb-2">
                {feature.title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Start Suggestions */}
        <motion.div 
          className="w-full max-w-3xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <h3 className="text-xl sm:text-2xl font-semibold text-center text-gray-800 dark:text-gray-200 mb-4 sm:mb-6">
            Try asking about...
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {suggestions.map((suggestion, index) => (
              <motion.div
                key={suggestion}
                className="group p-3 sm:p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 cursor-pointer"
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + (index * 0.1), duration: 0.5 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 font-medium">
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
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
            Ready to start? Type your message below
          </p>
        </motion.div>
      </div>
    </div>
  );
};
