import { useState, useEffect } from 'react';
import { Key, MessageSquarePlus, Moon, Sun, Menu, X, Info, MessageSquare } from 'lucide-react';
import { ThemePreference } from '@/lib/storage';
import { v4 as uuidv4 } from 'uuid';
import { ConversationSidebar, addConversation, Conversation } from './ConversationSidebar';
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
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [conversationTitle, setConversationTitle] = useState('New Chat');
  const { toast } = useToast();

  // Update conversation title when it changes
  useEffect(() => {
    if (currentConversationId) {
      const saved = localStorage.getItem('lumi-conversations');
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
      <header className="border-b border-lumi-border/50 bg-background/95 dark:bg-background/90 backdrop-blur sticky top-0 z-40 transition-colors duration-200">
        <div className="w-full px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between max-w-7xl mx-auto w-full gap-2">
            {/* Hamburger Menu */}
            <button 
              type="button" 
              onClick={toggleSidebar}
              className="flex-shrink-0 flex items-center justify-center h-9 w-9 rounded-md hover:bg-lumi-surface/50 dark:hover:bg-lumi-surface/30 focus:outline-none focus:ring-2 focus:ring-lumi-primary/50 transition-colors duration-200" 
              title="Menu"
              aria-label="Toggle menu"
            >
              <Menu className="h-6 w-6 text-lumi-primary" />
            </button>
            
            {/* Empty flex-1 to push model selector to center */}
            <div className="flex-1"></div>
            
            {/* Model Selector - Centered */}
            <div className="flex justify-center min-w-0">
              <div className="w-full max-w-[160px] sm:max-w-[180px] md:max-w-[220px]">
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
              className="hover:bg-lumi-surface/50 dark:hover:bg-lumi-surface/30 h-8 w-8 sm:h-9 sm:w-9 text-lumi-primary hover:text-lumi-primary/90 transition-colors"
              title="New Chat"
            >
              <MessageSquarePlus className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>

            <Dialog open={isApiKeyDialogOpen} onOpenChange={setIsApiKeyDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-lumi-surface/50 dark:hover:bg-lumi-surface/30 h-8 w-8 sm:h-9 sm:w-9 text-lumi-primary hover:text-lumi-primary/90 transition-colors"
                  title="API Key"
                >
                  <Key className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent 
                className="sm:max-w-lg bg-background dark:bg-gray-900"
                aria-describedby="api-key-description"
              >
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-lumi-primary">
                    <Key className="h-5 w-5" />
                    <span>OpenRouter API Key</span>
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="apiKey" className="text-sm font-medium text-lumi-primary/90 dark:text-lumi-primary/80">
                        Your API Key
                      </Label>
                      <Input
                        id="apiKey"
                        type="password"
                        placeholder="sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="font-mono text-sm h-10 border-lumi-border/50 dark:border-lumi-border/30 focus-visible:ring-2 focus-visible:ring-lumi-primary/50"
                        autoComplete="off"
                        spellCheck={false}
                      />
                    </div>
                    <p id="api-key-description" className="sr-only">
                      Enter your OpenRouter API key. This key is stored locally in your browser and only sent to OpenRouter's servers.
                    </p>
                    <p className="text-xs text-lumi-secondary/70 dark:text-lumi-secondary/60 px-1">
                      Your API key is stored locally and only sent to OpenRouter's servers.
                    </p>
                  </div>

                  <div className="rounded-lg bg-gray-100 dark:bg-gray-800 p-4 space-y-3">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Info className="h-4 w-4 text-lumi-primary" />
                      How to get your API key
                    </h4>
                    <ol className="text-xs space-y-2 list-decimal list-inside text-lumi-secondary/80 dark:text-lumi-secondary/60">
                      <li>Go to <a href="https://openrouter.ai/" target="_blank" rel="noopener noreferrer" className="text-lumi-primary hover:underline">OpenRouter.ai</a> and sign in</li>
                      <li>Click on your profile picture → Settings</li>
                      <li>Find your API key under "API Keys"</li>
                      <li>Copy and paste it above</li>
                    </ol>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between gap-3 pt-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsApiKeyDialogOpen(false)}
                      className="w-full sm:w-auto"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleApiKeySave}
                      disabled={!apiKey.trim()}
                      className="w-full sm:w-auto"
                    >
                      Save API Key
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button
              variant="ghost"
              size="icon"
              onClick={onThemeToggle}
              className="rounded-full hover:bg-lumi-surface/50 dark:hover:bg-lumi-surface/30 transition-colors relative group h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center"
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              <div className="relative w-5 h-5 flex items-center justify-center">
                <Sun 
                  className={`h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 transition-all duration-300 ${
                    theme === 'light' ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-45 absolute'
                  }`} 
                />
                <Moon 
                  className={`h-4 w-4 sm:h-5 sm:w-5 text-lumi-primary transition-all duration-300 ${
                    theme === 'dark' ? 'opacity-100 rotate-0' : 'opacity-0 rotate-45 absolute'
                  }`} 
                />
              </div>
              <span className="sr-only">
                {theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              </span>
            </Button>
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
