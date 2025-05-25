
import { useState, useEffect, useRef } from 'react';
import { Header } from '@/components/Header';
import { ChatMessage } from '@/components/ChatMessage';
import { ChatInput } from '@/components/ChatInput';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { AVAILABLE_MODELS } from '@/lib/models';
import { storageUtils, ChatMessage as ChatMessageType, ChatSession } from '@/lib/storage';
import { OpenRouterClient } from '@/lib/openrouter';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(storageUtils.getTheme());
  const [selectedModel, setSelectedModel] = useState<string>(
    storageUtils.getSelectedModel() || AVAILABLE_MODELS[1].id
  );
  const [currentChat, setCurrentChat] = useState<ChatSession | null>(
    storageUtils.getCurrentChat()
  );
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    storageUtils.setTheme(theme);
  }, [theme]);

  // Save selected model
  useEffect(() => {
    storageUtils.setSelectedModel(selectedModel);
  }, [selectedModel]);

  // Save current chat
  useEffect(() => {
    if (currentChat) {
      storageUtils.setCurrentChat(currentChat);
    }
  }, [currentChat]);

  // Auto-scroll to bottom with smooth animation
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [currentChat?.messages]);

  const handleThemeToggle = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
    if (currentChat && currentChat.messages.length > 0) {
      handleNewChat();
    }
  };

  const handleNewChat = () => {
    const newChat = storageUtils.createNewChat(selectedModel);
    setCurrentChat(newChat);
    storageUtils.setCurrentChat(newChat);
  };

  const handleSendMessage = async (content: string) => {
    const apiKey = storageUtils.getApiKey();
    
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please set your OpenRouter API key first.",
        variant: "destructive",
      });
      return;
    }

    // Create or use existing chat
    let chat = currentChat;
    if (!chat) {
      chat = storageUtils.createNewChat(selectedModel);
      setCurrentChat(chat);
    }

    // Add user message
    const userMessage: ChatMessageType = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role: 'user',
      content,
      timestamp: Date.now(),
      modelId: selectedModel
    };

    const updatedChat = {
      ...chat,
      messages: [...chat.messages, userMessage],
      updatedAt: Date.now(),
      title: chat.messages.length === 0 ? content.slice(0, 50) + (content.length > 50 ? '...' : '') : chat.title
    };

    setCurrentChat(updatedChat);
    setIsLoading(true);

    try {
      const client = new OpenRouterClient(apiKey);
      const selectedModelData = AVAILABLE_MODELS.find(m => m.id === selectedModel);
      
      const openRouterMessages = updatedChat.messages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }));

      const response = await client.sendMessage(
        selectedModel,
        openRouterMessages,
        selectedModelData?.name || 'AI Assistant'
      );

      // Add assistant response
      const assistantMessage: ChatMessageType = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
        modelId: selectedModel
      };

      const finalChat = {
        ...updatedChat,
        messages: [...updatedChat.messages, assistantMessage],
        updatedAt: Date.now()
      };

      setCurrentChat(finalChat);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const hasMessages = currentChat?.messages?.length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-lumi-surface/30 w-full">
      <Header
        selectedModel={selectedModel}
        onModelChange={handleModelChange}
        onNewChat={handleNewChat}
        theme={theme}
        onThemeToggle={handleThemeToggle}
      />
      
      <main className="flex-1 flex flex-col">
        {!hasMessages ? (
          <WelcomeScreen />
        ) : (
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 sm:p-6"
          >
            <div className="container mx-auto max-w-4xl">
              {currentChat?.messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isLoading && (
                <div className="flex justify-start mb-6">
                  <div className="bg-white dark:bg-lumi-surface border border-lumi-border/50 rounded-2xl p-4 sm:p-5 max-w-[90%] sm:max-w-[85%] shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-full lumi-gradient flex items-center justify-center">
                        <span className="text-white font-bold text-xs">L</span>
                      </div>
                      <span className="text-sm font-medium text-lumi-primary">
                        {AVAILABLE_MODELS.find(m => m.id === selectedModel)?.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-lumi-accent rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-lumi-accent rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-lumi-accent rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                      <span className="text-sm text-lumi-secondary">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <ChatInput
        onSendMessage={handleSendMessage}
        disabled={isLoading}
        placeholder={hasMessages ? "Continue the conversation..." : "Start your conversation with LUMI..."}
      />
    </div>
  );
};

export default Index;
