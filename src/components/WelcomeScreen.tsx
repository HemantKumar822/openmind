
import { Bot, Code, MessageCircle, Zap } from 'lucide-react';

export const WelcomeScreen = () => {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-2xl text-center space-y-8 animate-fade-in">
        {/* LUMI Logo */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl lumi-gradient flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-2xl">L</span>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-lumi-primary">
            Welcome to LUMI
          </h1>
          <p className="text-xl text-lumi-secondary">
            Learning & Understanding Machine Interface
          </p>
          <p className="text-base text-lumi-secondary max-w-lg mx-auto">
            Your friendly AI companion powered by multiple language models. 
            Choose a model above and start exploring the world of AI assistance!
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          <div className="flex items-start space-x-3 p-4 rounded-lg bg-lumi-surface border border-lumi-border">
            <div className="w-10 h-10 rounded-lg bg-lumi-accent/10 flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-lumi-accent" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-lumi-primary">Natural Conversations</h3>
              <p className="text-sm text-lumi-secondary">
                Engage in friendly, educational chats with AI
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 rounded-lg bg-lumi-surface border border-lumi-border">
            <div className="w-10 h-10 rounded-lg bg-lumi-accent/10 flex items-center justify-center">
              <Code className="h-5 w-5 text-lumi-accent" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-lumi-primary">Code Assistance</h3>
              <p className="text-sm text-lumi-secondary">
                Get help with programming and technical problems
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 rounded-lg bg-lumi-surface border border-lumi-border">
            <div className="w-10 h-10 rounded-lg bg-lumi-accent/10 flex items-center justify-center">
              <Bot className="h-5 w-5 text-lumi-accent" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-lumi-primary">Multiple Models</h3>
              <p className="text-sm text-lumi-secondary">
                Access different AI models for various tasks
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 rounded-lg bg-lumi-surface border border-lumi-border">
            <div className="w-10 h-10 rounded-lg bg-lumi-accent/10 flex items-center justify-center">
              <Zap className="h-5 w-5 text-lumi-accent" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-lumi-primary">Free & Private</h3>
              <p className="text-sm text-lumi-secondary">
                No login required, your data stays local
              </p>
            </div>
          </div>
        </div>

        {/* Getting Started */}
        <div className="bg-lumi-accent/5 border border-lumi-accent/20 rounded-lg p-6 mt-8">
          <h3 className="font-semibold text-lumi-primary mb-2">Getting Started</h3>
          <ol className="text-sm text-lumi-secondary space-y-1 text-left">
            <li>1. Click the key icon above to set your OpenRouter API key</li>
            <li>2. Select a model that fits your needs</li>
            <li>3. Start chatting and exploring!</li>
          </ol>
        </div>

        <p className="text-xs text-lumi-secondary">
          Created with ❤️ by Hemant Kumar • Making AI friendly, accessible, and powerful for everyone
        </p>
      </div>
    </div>
  );
};
