
import { MessageCircle, Sparkles, Shield, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export const WelcomeScreen = () => {
  const features = [
    { 
      icon: <MessageCircle className="h-5 w-5 text-blue-500 dark:text-blue-400" />, 
      title: "Smart Conversations", 
      description: "Natural, context-aware discussions",
      bg: "bg-blue-500/10"
    },
    { 
      icon: <Sparkles className="h-5 w-5 text-purple-500 dark:text-purple-400" />, 
      title: "Multiple Models", 
      description: "Access different AI capabilities",
      bg: "bg-purple-500/10"
    },
    { 
      icon: <Shield className="h-5 w-5 text-green-500 dark:text-green-400" />, 
      title: "Private & Secure", 
      description: "Your data stays protected",
      bg: "bg-green-500/10"
    },
    { 
      icon: <Zap className="h-5 w-5 text-orange-500 dark:text-orange-400" />, 
      title: "Lightning Fast", 
      description: "Quick responses and interactions",
      bg: "bg-orange-500/10"
    }
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-between p-4 sm:p-6">
      <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col items-center justify-center">
        {/* Enhanced Branding Header */}
        <motion.div 
          className="mb-12 sm:mb-16 flex flex-col items-center w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <h1 
            className="text-7xl sm:text-8xl md:text-9xl font-black tracking-tight bg-gradient-to-r from-blue-500 via-purple-500 to-orange-400 bg-clip-text text-transparent drop-shadow-lg" 
            style={{
              backgroundSize: '200% auto',
              animation: 'gradient 8s ease infinite',
              lineHeight: '1',
              marginBottom: '0.5rem',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            LYRA
          </h1>
          <motion.div 
            className="w-full mt-3 px-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <p className="text-lg sm:text-2xl font-medium text-lumi-secondary/80 dark:text-lumi-secondary/70 tracking-normal font-sans text-center leading-tight">
              A constellation of models, unified through simplicity
            </p>
          </motion.div>
        </motion.div>
        
        {/* Feature Cards */}
        <motion.div 
          className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 py-4 sm:py-6 px-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {features.map((card, index) => (
            <motion.div 
              key={card.title}
              className="flex flex-col items-center p-4 sm:p-5 rounded-xl bg-white dark:bg-lumi-surface/80 border border-lumi-border/30 dark:border-lumi-border/20 shadow-sm hover:shadow-md dark:shadow-lumi-border/10 transition-all duration-300 hover:-translate-y-0.5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + (index * 0.1), duration: 0.4 }}
            >
              <div className={`w-10 h-10 rounded-lg ${card.bg} dark:bg-opacity-30 flex items-center justify-center mb-3`}>
                {card.icon}
              </div>
              <h3 className="font-semibold text-lumi-primary dark:text-white text-sm sm:text-base mb-1">
                {card.title}
              </h3>
              <p className="text-xs sm:text-sm text-lumi-secondary/80 dark:text-lumi-secondary/80 text-center">
                {card.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};
