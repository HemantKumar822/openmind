
import { MessageCircle, Sparkles, Shield, Zap } from 'lucide-react';

export const WelcomeScreen = () => {
  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
      <div className="max-w-lg sm:max-w-2xl text-center space-y-8 sm:space-y-10 animate-fade-in">
        {/* LUMI Logo */}
        <div className="flex justify-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl lumi-gradient flex items-center justify-center shadow-xl">
            <span className="text-white font-bold text-2xl sm:text-3xl">L</span>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="space-y-4 sm:space-y-6">
          <h1 className="text-3xl sm:text-5xl font-bold text-lumi-primary tracking-tight">
            Welcome to LUMI
          </h1>
          <p className="text-xl sm:text-2xl text-lumi-secondary font-medium">
            AI Assistant Powered by Multiple Models
          </p>
          <p className="text-base sm:text-lg text-lumi-secondary max-w-lg mx-auto leading-relaxed">
            Choose your preferred AI model and start an intelligent conversation
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-12">
          <div className="flex items-start space-x-3 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-lumi-surface to-white border border-lumi-border/50 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-lumi-primary text-base sm:text-lg">Smart Conversations</h3>
              <p className="text-sm sm:text-base text-lumi-secondary mt-1">
                Natural, context-aware discussions
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-lumi-surface to-white border border-lumi-border/50 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-purple-500" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-lumi-primary text-base sm:text-lg">Multiple Models</h3>
              <p className="text-sm sm:text-base text-lumi-secondary mt-1">
                Access different AI capabilities
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-lumi-surface to-white border border-lumi-border/50 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
              <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-lumi-primary text-base sm:text-lg">Private & Secure</h3>
              <p className="text-sm sm:text-base text-lumi-secondary mt-1">
                Your data stays protected
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-lumi-surface to-white border border-lumi-border/50 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-lumi-primary text-base sm:text-lg">Lightning Fast</h3>
              <p className="text-sm sm:text-base text-lumi-secondary mt-1">
                Quick responses and interactions
              </p>
            </div>
          </div>
        </div>

        {/* Getting Started */}
        <div className="bg-gradient-to-r from-lumi-accent/5 to-blue-500/5 border border-lumi-accent/20 rounded-2xl p-6 sm:p-8 mt-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full lumi-gradient flex items-center justify-center">
              <span className="text-white font-bold text-xs">1</span>
            </div>
            <span className="text-sm font-medium text-lumi-primary">Quick Start</span>
          </div>
          <p className="text-sm sm:text-base text-lumi-secondary">
            Set your API key, choose a model, and start chatting with AI
          </p>
        </div>
      </div>
    </div>
  );
};
