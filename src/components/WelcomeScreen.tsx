
import { MessageCircle, Sparkles, Shield, Zap, ArrowRight, Brain, Globe, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export const WelcomeScreen = () => {
  const features = [
    { 
      icon: <Brain className="h-6 w-6" />, 
      title: "AI-Powered", 
      description: "Advanced language models at your fingertips"
    },
    { 
      icon: <Globe className="h-6 w-6" />, 
      title: "Global Access", 
      description: "Available anywhere, anytime"
    },
    { 
      icon: <Shield className="h-6 w-6" />, 
      title: "Secure & Private", 
      description: "Your data stays protected"
    },
    { 
      icon: <Zap className="h-6 w-6" />, 
      title: "Lightning Fast", 
      description: "Instant responses with real-time streaming"
    }
  ];

  const useCases = [
    {
      category: "Creative",
      items: ["Write a story about time travel", "Create a marketing campaign", "Design a poem about nature"]
    },
    {
      category: "Technical", 
      items: ["Debug my JavaScript code", "Explain quantum computing", "Help with API documentation"]
    },
    {
      category: "Learning",
      items: ["Teach me Spanish basics", "Explain machine learning", "History of Renaissance art"]
    },
    {
      category: "Business",
      items: ["Draft a business proposal", "Analyze market trends", "Create a project timeline"]
    }
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 min-h-full bg-gradient-to-br from-blue-50/50 via-white to-purple-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950/20">
      <div className="w-full max-w-6xl mx-auto flex-1 flex flex-col items-center justify-center">
        
        {/* Hero Section */}
        <motion.div 
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {/* Logo/Brand */}
          <motion.div
            className="mb-8"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative mx-auto w-20 h-20 mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl rotate-3 opacity-20"></div>
              <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-4 shadow-xl">
                <Brain className="h-12 w-12 text-white" />
              </div>
            </div>
          </motion.div>

          {/* Main Title */}
          <motion.h1 
            className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 sm:mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 dark:from-white dark:via-blue-200 dark:to-white bg-clip-text text-transparent">
              OPEN
            </span>
            <span className="ml-3 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              MIND
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            className="text-xl sm:text-2xl lg:text-3xl text-gray-700 dark:text-gray-200 font-semibold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Unlock the power of{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Artificial Intelligence
            </span>
          </motion.p>

          {/* Description */}
          <motion.p 
            className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            Experience next-generation AI with multiple cutting-edge models, secure conversations, 
            and lightning-fast responses. Your gateway to unlimited possibilities.
          </motion.p>
        </motion.div>
        
        {/* Feature Cards */}
        <motion.div 
          className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          {features.map((feature, index) => (
            <motion.div 
              key={feature.title}
              className="group relative p-6 sm:p-8 rounded-2xl border border-gray-200/60 dark:border-gray-700/60 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md hover:bg-white dark:hover:bg-gray-800 transition-all duration-500 hover:shadow-xl hover:shadow-blue-500/10 dark:hover:shadow-blue-400/10"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + (index * 0.1), duration: 0.6 }}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Use Cases Section */}
        <motion.div 
          className="w-full max-w-6xl"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.8 }}
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4">
              What can you create today?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Explore endless possibilities across different domains
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {useCases.map((category, categoryIndex) => (
              <motion.div
                key={category.category}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/60 dark:border-gray-700/60 hover:shadow-lg transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 + (categoryIndex * 0.1), duration: 0.6 }}
              >
                <h4 className="font-semibold text-lg text-gray-800 dark:text-gray-200 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                  {category.category}
                </h4>
                <div className="space-y-3">
                  {category.items.map((item, itemIndex) => (
                    <motion.div
                      key={item}
                      className="group flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-300 cursor-pointer"
                      whileHover={{ scale: 1.02, x: 4 }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.2 + (categoryIndex * 0.1) + (itemIndex * 0.05), duration: 0.4 }}
                    >
                      <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 font-medium">
                        {item}
                      </span>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-300 opacity-0 group-hover:opacity-100" />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div 
          className="mt-12 sm:mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.8 }}
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-2xl">
            <h4 className="text-xl sm:text-2xl font-bold mb-3">
              Ready to get started?
            </h4>
            <p className="text-blue-100 mb-6 text-lg">
              Type your first message below and experience the future of AI
            </p>
            <div className="flex items-center justify-center space-x-2 text-blue-200">
              <MessageCircle className="h-5 w-5" />
              <span className="text-sm font-medium">Start your conversation now</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
