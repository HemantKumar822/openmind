
import { MessageCircle, Code, Zap, Key } from 'lucide-react';

export const WelcomeScreen = () => {
  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
      <div className="max-w-lg sm:max-w-2xl text-center space-y-6 sm:space-y-8 animate-fade-in">
        {/* LUMI Logo */}
        <div className="flex justify-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl lumi-gradient flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl sm:text-2xl">L</span>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="space-y-3 sm:space-y-4">
          <h1 className="text-2xl sm:text-4xl font-bold text-lumi-primary">
            Welcome to LUMI
          </h1>
          <p className="text-lg sm:text-xl text-lumi-secondary">
            Learning & Understanding Machine Interface
          </p>
          <p className="text-sm sm:text-base text-lumi-secondary max-w-md mx-auto">
            Your AI companion powered by multiple language models. Choose a model and start exploring!
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-8 sm:mt-12">
          <div className="flex items-start space-x-3 p-3 sm:p-4 rounded-lg bg-lumi-surface border border-lumi-border">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-lumi-accent/10 flex items-center justify-center">
              <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-lumi-accent" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-lumi-primary text-sm sm:text-base">Natural Conversations</h3>
              <p className="text-xs sm:text-sm text-lumi-secondary">
                Engage in friendly, educational chats
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 sm:p-4 rounded-lg bg-lumi-surface border border-lumi-border">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-lumi-accent/10 flex items-center justify-center">
              <Code className="h-4 w-4 sm:h-5 sm:w-5 text-lumi-accent" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-lumi-primary text-sm sm:text-base">Code Assistance</h3>
              <p className="text-xs sm:text-sm text-lumi-secondary">
                Get help with programming
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 sm:p-4 rounded-lg bg-lumi-surface border border-lumi-border">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-lumi-accent/10 flex items-center justify-center">
              <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-lumi-accent" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-lumi-primary text-sm sm:text-base">Multiple Models</h3>
              <p className="text-xs sm:text-sm text-lumi-secondary">
                Access different AI models
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 sm:p-4 rounded-lg bg-lumi-surface border border-lumi-border">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-lumi-accent/10 flex items-center justify-center">
              <Key className="h-4 w-4 sm:h-5 sm:w-5 text-lumi-accent" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-lumi-primary text-sm sm:text-base">Free & Private</h3>
              <p className="text-xs sm:text-sm text-lumi-secondary">
                Your data stays local
              </p>
            </div>
          </div>
        </div>

        {/* Getting Started */}
        <div className="bg-lumi-accent/5 border border-lumi-accent/20 rounded-lg p-4 sm:p-6 mt-6 sm:mt-8">
          <h3 className="font-semibold text-lumi-primary mb-2 text-sm sm:text-base">Getting Started</h3>
          <ol className="text-xs sm:text-sm text-lumi-secondary space-y-1 text-left">
            <li>1. Set your OpenRouter API key</li>
            <li>2. Select a model</li>
            <li>3. Start chatting!</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
