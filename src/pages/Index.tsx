
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import { Header } from '@/components/Header';
import { ChatMessage } from '@/components/ChatMessage';
import { ChatInput } from '@/components/ChatInput';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { AVAILABLE_MODELS } from '@/lib/models';
import { storageUtils, ChatMessage as ChatMessageType, ChatSession, ThemePreference } from '@/lib/storage';
import { OpenRouterClient } from '@/lib/openrouter';
import { useToast } from '@/hooks/use-toast';
import { addConversation, Conversation } from '@/components/ConversationSidebar';

const Index = () => {
  // Initialize theme state
  const [theme, setThemeState] = useState<ThemePreference>(storageUtils.getTheme());
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(storageUtils.getResolvedTheme());
  
  // Update theme in state and storage
  const setTheme = useCallback((newTheme: ThemePreference) => {
    console.log('Setting theme to:', newTheme);
    setThemeState(newTheme);
    storageUtils.setTheme(newTheme);
    
    // Update the resolved theme
    const resolved = newTheme === 'system' ? storageUtils.getSystemTheme() : newTheme;
    console.log('Resolved theme:', resolved);
    setResolvedTheme(resolved);
    
    // Update the document class for Tailwind
    if (resolved === 'dark') {
      console.log('Adding dark class to html element');
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      console.log('Removing dark class from html element');
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.style.colorScheme = 'light';
    }
  }, []);
  
  // Handle system theme changes
  useEffect(() => {
    console.log('Initializing theme system');
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      console.log('System theme changed, current theme setting:', theme);
      // Only update if we're using system theme
      if (theme === 'system') {
        const newTheme = e.matches ? 'dark' : 'light';
        console.log('Setting resolved theme from system:', newTheme);
        setResolvedTheme(newTheme);
        if (newTheme === 'dark') {
          console.log('Adding dark class (system change)');
          document.documentElement.classList.add('dark');
          document.documentElement.setAttribute('data-theme', 'dark');
          document.documentElement.style.colorScheme = 'dark';
        } else {
          console.log('Removing dark class (system change)');
          document.documentElement.classList.remove('dark');
          document.documentElement.setAttribute('data-theme', 'light');
          document.documentElement.style.colorScheme = 'light';
        }
      }
    };
    
    // Set initial theme
    const resolved = storageUtils.getResolvedTheme();
    console.log('Initial resolved theme:', resolved);
    setResolvedTheme(resolved);
    if (resolved === 'dark') {
      console.log('Adding dark class (initial)');
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      console.log('Removing dark class (initial)');
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.style.colorScheme = 'light';
    }
    
    // Listen for system theme changes
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [theme]);
  const [selectedModel, setSelectedModel] = useState<string>(
    storageUtils.getSelectedModel() || AVAILABLE_MODELS[1].id
  );
  const [currentChat, setCurrentChat] = useState<ChatSession | null>(
    storageUtils.getCurrentChat()
  );
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(
    storageUtils.getCurrentChat()?.id || null
  );
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Check if there are any messages in the current chat
  const hasMessages = currentChat?.messages?.length > 0 || false;

  // Create a new chat
  const handleNewChat = useCallback(() => {
    const newChat = storageUtils.createNewChat(selectedModel);
    setCurrentChat(newChat);
    setCurrentConversationId(newChat.id);
    storageUtils.setCurrentChat(newChat);
  }, [selectedModel]);

  const handleModelChange = useCallback((modelId: string) => {
    setSelectedModel(modelId);
    if (currentChat && currentChat.messages.length > 0) {
      handleNewChat();
    }
  }, [currentChat, handleNewChat]);

  const handleConversationChange = useCallback((id: string) => {
    if (!id) {
      // If no ID provided, create a new chat
      handleNewChat();
      return;
    }
    
    const chat = storageUtils.getChatById && storageUtils.getChatById(id);
    if (chat) {
      setCurrentChat(chat);
      setCurrentConversationId(chat.id);
      setSelectedModel(chat.modelId);
      storageUtils.setCurrentChat(chat);
    }
  }, [handleNewChat]);

  useEffect(() => {
    if (currentChat) {
      const conversation: Omit<Conversation, 'isPinned'> = {
        id: currentChat.id,
        title: currentChat.title || 'New Chat',
        timestamp: currentChat.updatedAt || Date.now(),
      };
      addConversation(conversation);
      setCurrentConversationId(currentChat.id);
    }
  }, [currentChat]);

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

  const handleThemeToggle = useCallback(() => {
    // Toggle between light and dark themes only
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  }, [theme, setTheme]);



  const handleSendMessage = async (content: string) => {
    const apiKey = storageUtils.getApiKey();
    
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please set your API key in the settings.",
        variant: "destructive",
      });
      return;
    }

    // Initialize chat if none exists
    let chat = currentChat;
    if (!chat) {
      chat = storageUtils.createNewChat(selectedModel);
      setCurrentChat(chat);
      setCurrentConversationId(chat.id);
    }

    // Add user message
    const userMessage: ChatMessageType = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: Date.now(),
      modelId: selectedModel,
    };

    const updatedMessages = [...(chat.messages || []), userMessage];
    const updatedChat = {
      ...chat,
      messages: updatedMessages,
      updatedAt: Date.now(),
    };

    setCurrentChat(updatedChat);
    storageUtils.setCurrentChat(updatedChat);

    // Create a unique ID for the assistant message
    const assistantMessageId = `msg-${Date.now()}`;
    const initialTimestamp = Date.now();
    let fullResponse = '';
    
    // Create the initial message object
    const initialAssistantMessage: ChatMessageType = {
      id: assistantMessageId,
      role: 'assistant',
      content: fullResponse,
      timestamp: initialTimestamp,
      modelId: selectedModel,
      isStreaming: true
    };

    // Initialize the chat with the assistant's message
    const initialChat = {
      ...updatedChat,
      messages: [...updatedMessages, initialAssistantMessage],
      updatedAt: initialTimestamp,
    };
    
    setCurrentChat(initialChat);
    setIsLoading(true);
    const openRouter = new OpenRouterClient(apiKey);
    const abortController = new AbortController();
    let isStreaming = true;
    let hasError = false;
    let scrollInterval: NodeJS.Timeout | null = null;
    let lastUpdateTime = 0;
    const UPDATE_THROTTLE_MS = 50; // Update UI at most every 50ms

    // Cleanup function
    const cleanup = () => {
      isStreaming = false;
      abortController.abort();
      setIsLoading(false);
    };

    // Auto-scroll to bottom when new content arrives
    const scrollToBottom = () => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }
    };

    // Scroll to bottom when streaming starts
    setTimeout(scrollToBottom, 100);

    try {
      const modelName = AVAILABLE_MODELS.find(m => m.id === selectedModel)?.name || 'AI Assistant';
      const stream = openRouter.streamMessage(
        selectedModel,
        updatedMessages.map(msg => ({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content
        })),
        modelName,
        abortController.signal
      );

      // Add scroll handler for streaming updates
      scrollInterval = setInterval(scrollToBottom, 500);
      let lastChunkTime = Date.now();

      // Process the stream chunks
      for await (const chunk of stream) {
        if (!isStreaming) break;
        if (chunk.error) throw new Error(chunk.error);
        if (chunk.done) break;
        
        // Update the full response
        fullResponse += chunk.content;
        lastChunkTime = Date.now();
        
        // Throttle UI updates
        const now = Date.now();
        if (now - lastUpdateTime > UPDATE_THROTTLE_MS) {
          lastUpdateTime = now;
          
          // Use functional update to avoid race conditions
          setCurrentChat(prev => {
            if (!prev) return prev;
            
            const messageIndex = prev.messages.findIndex(m => m.id === assistantMessageId);
            if (messageIndex === -1) return prev;
            
            // Skip if content hasn't changed (shouldn't happen but good to check)
            const currentContent = prev.messages[messageIndex]?.content || '';
            if (currentContent === fullResponse) return prev;
            
            // Create a new messages array with updated content
            const newMessages = [...prev.messages];
            newMessages[messageIndex] = {
              ...newMessages[messageIndex],
              content: fullResponse,
              timestamp: now,
              isStreaming: true
            };
            
            return {
              ...prev,
              messages: newMessages,
              updatedAt: now
            };
          });
        }
      }

      // Final update when streaming is complete
      if (isStreaming && !hasError) {
        setCurrentChat(prev => {
          if (!prev) return prev;
          
          const messageIndex = prev.messages.findIndex(m => m.id === assistantMessageId);
          if (messageIndex === -1) return prev;
          
          // Skip if already up to date
          const currentMessage = prev.messages[messageIndex];
          if (currentMessage.content === fullResponse && currentMessage.isStreaming === false) {
            return prev;
          }
          
          // Create final messages array
          const finalMessages = [...prev.messages];
          finalMessages[messageIndex] = {
            ...finalMessages[messageIndex],
            content: fullResponse,
            isStreaming: false,
            timestamp: Date.now()
          };
          
          // Create final chat state
          const finalChat = {
            ...prev,
            messages: finalMessages,
            updatedAt: Date.now(),
            // Set title for new conversations
            title: finalMessages.length === 2 // 1 user message + 1 assistant message
              ? finalMessages[0].content.slice(0, 50) + (finalMessages[0].content.length > 50 ? '...' : '')
              : prev.title
          };
          
          // Persist to storage
          storageUtils.setCurrentChat(finalChat);
          storageUtils.updateChatInHistory(finalChat);
          
          return finalChat;
        });
      }

    } catch (error) {
      hasError = true;
      console.error('Error in streaming:', error);
      
      if (error instanceof Error && error.name !== 'AbortError') {
        // Only show error if it wasn't an abort error
        toast({
          title: "Error",
          description: error.message || "Failed to send message. Please try again.",
          variant: "destructive",
        });
      }
      
      // Only reset chat if it was a new chat with no successful responses
      if (updatedMessages.length === 1) {
        // Small delay to prevent UI flash
        setTimeout(() => {
          setCurrentChat(prev => {
            if (prev?.messages.length === 2 && prev.messages[1].isStreaming) {
              storageUtils.deleteChat(chat.id);
              setCurrentConversationId(null);
              return null;
            }
            return prev;
          });
        }, 300);
      }
    } finally {
      if (scrollInterval) {
        clearInterval(scrollInterval);
      }
      cleanup();
      
      // Reset loading state after a small delay to prevent UI flash
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  };

  // Show welcome screen only when there are no messages in the current chat
  const showWelcomeScreen = !currentChat || currentChat.messages.length === 0;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-lumi-surface/30 w-full">
      <Header
        selectedModel={selectedModel}
        onModelChange={handleModelChange}
        onNewChat={handleNewChat}
        theme={theme}
        onThemeToggle={handleThemeToggle}
        currentConversationId={currentConversationId}
        onConversationChange={handleConversationChange}
      />
      
      {/* Chat area with fixed height and scrolling */}
      <main className="flex-1 flex flex-col min-h-0 w-full">
        {showWelcomeScreen ? (
          <WelcomeScreen />
        ) : (
          <div
            ref={chatContainerRef}
            className="flex-1 w-full overflow-y-auto scrollbar-thin scrollbar-thumb-lumi-border/30 scrollbar-track-transparent hover:scrollbar-thumb-lumi-border/50"
            style={{
              height: 'calc(100vh - 4rem - 4.5rem)', // Account for header and input heights
              scrollBehavior: 'smooth',
              scrollPadding: '1rem',
              WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
            }}
          >
            <div className="container mx-auto max-w-4xl px-2 sm:px-4 py-4 w-full">
              <div className="space-y-2 sm:space-y-3 w-full">
                {currentChat?.messages.map((message) => (
                  <div key={message.id} className="w-full">
                    <ChatMessage message={message} />
                  </div>
                ))}
              </div>
              
              {/* Empty space at the bottom to prevent content from being hidden behind the input */}
              <div className="h-24 sm:h-20 w-full" />
            </div>
          </div>
        )}
      </main>

      {/* Fixed chat input at bottom */}
      <div className="sticky bottom-0 z-10">
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={isLoading}
          placeholder={hasMessages ? "Continue the conversation..." : "Start your conversation with Lyra..."}
        />
      </div>
    </div>
  );
};

export default Index;
