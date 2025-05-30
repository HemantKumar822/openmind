import { useState, useEffect } from 'react';
import { Key, MessageSquarePlus, Menu, X, Info, MessageSquare, Eye, EyeOff } from 'lucide-react';
import { ThemePreference } from '@/lib/storage';
import { v4 as uuidv4 } from 'uuid';
import { ConversationSidebar, addConversation, Conversation } from './ConversationSidebar';
import { ThemeToggle } from './ThemeToggle';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AVAILABLE_MODELS } from '@/lib/models';
import { storageUtils } from '@/lib/storage';
import { ModelSelector } from './ModelSelector';
import { useToast } from '@/hooks/use-toast';

interface HeaderProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  onNewChat: () => void;
  theme: ThemePreference;
  onThemeToggle: () => void;
  currentConversationId: string | null;
  onConversationChange: (id: string) => void;
}

export const Header = ({
  selectedModel,
  onModelChange,
  onNewChat: originalOnNewChat,
  theme,
  onThemeToggle,
  currentConversationId,
  onConversationChange,
}: HeaderProps) => {
  const [apiKey, setApiKey] = useState(storageUtils.getApiKey() || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [conversationTitle, setConversationTitle] = useState('New Chat');
  const { toast } = useToast();

  // Update conversation title when it changes
  useEffect(() => {
    if (currentConversationId) {
      const saved = localStorage.getItem('openmind_conversations');
      if (saved) {
        try {
          const conversations: Conversation[] = JSON.parse(saved);
          const conversation = conversations.find(c => c.id === currentConversationId);
          if (conversation) {
            setConversationTitle(conversation.title);
          }
        } catch (e) {
          console.error('Failed to parse conversations', e);
        }
      }
    } else {
      setConversationTitle('New Chat');
    }
  }, [currentConversationId]);

  const handleNewChat = () => {
    const newConversationId = uuidv4();
    const newConversation = {
      id: newConversationId,
      title: 'New Chat',
      timestamp: Date.now(),
    };
    
    addConversation(newConversation);
    onConversationChange(newConversationId);
    originalOnNewChat();
  };

  const handleSelectConversation = (id: string) => {
    onConversationChange(id);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleApiKeySave = () => {
    if (apiKey.trim()) {
      storageUtils.setApiKey(apiKey.trim());
      setIsApiKeyDialogOpen(false);
      toast({
        title: "API Key Saved",
        description: "Your OpenRouter API key has been saved.",
      });
    } else {
      toast({
        title: "Invalid API Key",
        description: "Please enter a valid OpenRouter API key.",
        variant: "destructive",
      });
    }
  };

  const selectedModelData = AVAILABLE_MODELS.find(m => m.id === selectedModel);

  return (
    <>
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black sticky top-0 z-40 transition-colors duration-200 shadow-sm">
        <div className="w-full px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between max-w-7xl mx-auto w-full gap-2">
            <div className="flex items-center flex-1 sm:flex-none sm:w-auto">
              {/* Hamburger Menu */}
              <button 
                type="button" 
                onClick={toggleSidebar}
                className="flex-shrink-0 flex items-center justify-center h-9 w-9 rounded-md hover:bg-gray-100 dark:hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-openmind-primary/50 transition-colors duration-200" 
                title="Menu"
                aria-label="Toggle menu"
              >
                <Menu className="h-6 w-6 text-openmind-primary" />
              </button>
            </div>
            
            {/* Model Selector - Centered on desktop */}
            <div className="hidden sm:flex sm:flex-1 sm:justify-center sm:mx-2">
              <div className="w-full max-w-[200px]">
                <ModelSelector 
                  selectedModel={selectedModel} 
                  onModelChange={onModelChange}
                />
              </div>
            </div>
            
            {/* Mobile Model Selector - Only visible on mobile */}
            <div className="sm:hidden">
              <div className="w-[140px]">
                <ModelSelector 
                  selectedModel={selectedModel} 
                  onModelChange={onModelChange}
                />
              </div>
            </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Common Action Buttons for all screen sizes */} 
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNewChat}
              className="hover:bg-gray-100 dark:hover:bg-[#111] h-8 w-8 sm:h-9 sm:w-9 text-openmind-primary hover:text-openmind-primary/90 transition-colors"
              title="New Chat"
            >
              <MessageSquarePlus className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>

            <Dialog open={isApiKeyDialogOpen} onOpenChange={setIsApiKeyDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-gray-100 dark:hover:bg-gray-900 h-8 w-8 sm:h-9 sm:w-9 text-openmind-primary hover:text-openmind-primary/90 transition-colors"
                  title="API Key"
                >
                  <Key className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent 
                className="sm:max-w-md bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-0 overflow-hidden"
                aria-describedby="api-key-description"
              >
                <div className="p-4 sm:p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-1.5 rounded-lg bg-openmind-primary/10 mt-0.5">
                      <Key className="h-4 w-4 text-openmind-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-base">OpenRouter API Key</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 -mt-0.5">Securely connect your account</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <Label htmlFor="apiKey" className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          API Key
                        </Label>
                        {apiKey && (
                          <span className="text-[10px] bg-openmind-primary/10 text-openmind-primary px-1.5 py-0.5 rounded-full">
                            Key entered
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <div className="relative">
                          <Input
                            id="apiKey"
                            type={showApiKey ? 'text' : 'password'}
                            placeholder="sk-or-v1-..."
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            className="font-mono text-sm h-9 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 pr-10"
                            autoComplete="off"
                            spellCheck={false}
                            onKeyDown={(e) => e.key === 'Enter' && handleApiKeySave()}
                          />
                          {apiKey && (
                            <button
                              type="button"
                              onClick={() => setShowApiKey(!showApiKey)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                              tabIndex={-1}
                            >
                              {showApiKey ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-500 flex items-start">
                        <Info className="h-3 w-3 text-openmind-primary mr-1 mt-0.5 flex-shrink-0" />
                        Stored locally, never shared
                      </p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2.5 text-xs border border-gray-200 dark:border-gray-700">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1 flex items-center text-sm">
                        <Key className="h-3.5 w-3.5 text-openmind-primary mr-1.5" />
                        How to get your API key:
                      </h4>
                      <ol className="space-y-1 text-gray-700 dark:text-gray-300 text-xs">
                        <li className="flex items-start">
                          <span className="text-openmind-primary font-bold w-4 flex-shrink-0">1.</span>
                          <div>
                            <a 
                              href="https://openrouter.ai/keys" 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-openmind-primary hover:underline font-semibold inline-flex items-center"
                            >
                              Sign in to OpenRouter
                              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-0.5">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                <polyline points="15 3 21 3 21 9"></polyline>
                                <line x1="10" y1="14" x2="21" y2="3"></line>
                              </svg>
                            </a>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-none mt-0.5">
                              Create an account if you don't have one
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <span className="text-openmind-primary font-bold w-4 flex-shrink-0">2.</span>
                          <div>
                            <span className="font-semibold">Create a new API key</span>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-none mt-0.5">
                              Click "Create a key" and name it (e.g., "OpenMind Chat")
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <span className="text-openmind-primary font-bold w-4 flex-shrink-0">3.</span>
                          <div>
                            <span className="font-semibold">Copy & paste below</span>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-none mt-0.5">
                              Look for a key starting with <code className="bg-gray-200 dark:bg-gray-700/50 px-1 py-0.5 rounded text-[9px] font-mono">sk-or-</code>
                            </p>
                          </div>
                        </li>
                      </ol>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <Button 
                        variant="outline" 
                        onClick={() => setIsApiKeyDialogOpen(false)}
                        className="flex-1 h-8 text-xs"
                      >
                        Cancel
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={handleApiKeySave}
                        disabled={!apiKey.trim()}
                        className={`flex-1 h-8 text-xs border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 ${
                          apiKey.trim() ? 'ring-1 ring-white dark:ring-white ring-offset-0' : ''
                        }`}
                      >
                        Save Key
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
    
    {/* Conversation Sidebar */}
    <ConversationSidebar
      isOpen={isSidebarOpen}
      onClose={() => setIsSidebarOpen(false)}
      onNewChat={handleNewChat}
      onSelectConversation={handleSelectConversation}
      currentConversationId={currentConversationId}
    />
  </>
  );
};
