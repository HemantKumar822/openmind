
import { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from '@/hooks/useTheme';
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
  // Initialize theme state using the useTheme hook
  const { theme, resolvedTheme, setTheme } = useTheme();
  
  // Toggle theme function for the header
  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);
  const [selectedModel, setSelectedModel] = useState<string>(
    storageUtils.getSelectedModel() || AVAILABLE_MODELS[0].id
  );
  const [currentChat, setCurrentChat] = useState<ChatSession | null>(
    storageUtils.getCurrentChat()
  );
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(
    storageUtils.getCurrentChat()?.id || null
  );
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const currentAssistantMessageId = useRef<string | null>(null);
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

  // Optimized scroll handling
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (!chatContainerRef.current) return;
    
    const container = chatContainerRef.current;
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 300;
    
    if (isNearBottom) {
      // Use requestAnimationFrame for smoother animations
      requestAnimationFrame(() => {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: behavior === 'auto' ? 'auto' : 'smooth'
        });
      });
    }
  }, []);
  
  // Only scroll on message length change
  const prevMessagesLength = useRef(0);
  useEffect(() => {
    if (currentChat?.messages.length !== prevMessagesLength.current) {
      prevMessagesLength.current = currentChat?.messages.length || 0;
      scrollToBottom('auto');
    }
  }, [currentChat?.messages.length, scrollToBottom]);

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
    currentAssistantMessageId.current = assistantMessageId;
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
    
    // Cancel any existing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    let isStreaming = true;
    let hasError = false;
    let scrollInterval: NodeJS.Timeout | null = null;
    
    // Initialize streaming state
    const streamingStartTime = Date.now();
    let lastChunkTime = Date.now();
    let lastScrollTime = 0;
    const SCROLL_THROTTLE_MS = 150; // Throttle scroll updates
    
    // Scroll handler function with throttling
    const maybeScroll = () => {
      const now = Date.now();
      if (now - lastScrollTime > SCROLL_THROTTLE_MS) {
        lastScrollTime = now;
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTo({
            top: chatContainerRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }
      }
    };
    
    // Initial scroll to ensure we're at the bottom when starting
    setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: 'auto'
        });
      }
    }, 100);
    
    // Cleanup function
    const cleanup = () => {
      isStreaming = false;
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
      }
      if (scrollInterval) {
        clearInterval(scrollInterval);
      }
      setIsLoading(false);
    };
    
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
    
    // Process the stream chunks
    for await (const chunk of stream) {
        if (!isStreaming) break;
        if (chunk.error) throw new Error(chunk.error);
        if (chunk.done) break;
        
        // Update the full response and track last chunk time
        fullResponse += chunk.content;
        lastChunkTime = Date.now();
        
        // Update state in a more efficient way
        setCurrentChat(prev => {
          if (!prev) return prev;
          
          const messageIndex = prev.messages.findIndex(m => m.id === assistantMessageId);
          if (messageIndex === -1) return prev;
          
          // Skip if content hasn't changed
          const currentContent = prev.messages[messageIndex]?.content || '';
          if (currentContent === fullResponse) return prev;
          
          // Only update if we have new content
          if (currentContent.length < fullResponse.length) {
            // Use a more efficient update by only changing what's necessary
            const newMessages = [...prev.messages];
            newMessages[messageIndex] = {
              ...newMessages[messageIndex],
              content: fullResponse,
              timestamp: Date.now(),
              isStreaming: true
            };
            
            // Only trigger scroll for significant updates to reduce jank
            if (fullResponse.length % 10 === 0 || fullResponse.length < 50) {
              maybeScroll();
            }
            
            return {
              ...prev,
              messages: newMessages,
              updatedAt: Date.now(),
              // Prevent unnecessary re-renders
              ...(prev.updatedAt ? {} : { updatedAt: Date.now() })
            };
          }
          
          return prev;
        });
        
        // Add a small delay to prevent UI thread blocking
        await new Promise(resolve => setTimeout(resolve, 0));
      }

      // Final update when streaming is complete
      if (isStreaming && !hasError) {
        // Force a final update with requestAnimationFrame to ensure it runs in the next tick
        await new Promise(resolve => requestAnimationFrame(resolve));
        
        // Make sure we have the latest fullResponse
        const finalResponse = fullResponse;
        
        setCurrentChat(prev => {
          if (!prev) return prev;
          
          const messageIndex = prev.messages.findIndex(m => m.id === assistantMessageId);
          if (messageIndex === -1) return prev;
          
          // Skip if already up to date
          const currentMessage = prev.messages[messageIndex];
          if (currentMessage.content === finalResponse && currentMessage.isStreaming === false) {
            return prev;
          }
          
          // Create final messages array with the complete response
          const finalMessages = [...prev.messages];
          finalMessages[messageIndex] = {
            ...finalMessages[messageIndex],
            content: finalResponse,  // Use the captured finalResponse
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
        
        // Force a re-render to ensure the UI is updated
        await new Promise(resolve => setTimeout(resolve, 0));
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

  // Handle stopping the generation
  const handleStopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
      
      // Update the last message to remove the streaming state
      if (currentAssistantMessageId.current) {
        setCurrentChat(prev => {
          if (!prev) return prev;
          
          const messageIndex = prev.messages.findIndex(m => m.id === currentAssistantMessageId.current);
          if (messageIndex === -1) return prev;
          
          const newMessages = [...prev.messages];
          newMessages[messageIndex] = {
            ...newMessages[messageIndex],
            isStreaming: false,
            timestamp: Date.now()
          };
          
          return {
            ...prev,
            messages: newMessages,
            updatedAt: Date.now()
          };
        });
      }
    }
  }, []);

  // Show welcome screen only when there are no messages in the current chat
  const showWelcomeScreen = !currentChat || currentChat.messages.length === 0;

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black w-full">
      <div className="flex-1 flex flex-col w-full max-w-[2000px] mx-auto">
        <Header
          selectedModel={selectedModel}
          onModelChange={handleModelChange}
          onNewChat={handleNewChat}
          theme={theme}
          onThemeToggle={toggleTheme}
          currentConversationId={currentConversationId}
          onConversationChange={handleConversationChange}
        />
        
        {/* Chat area with fixed height and scrolling */}
        <main className="flex-1 flex flex-col w-full">
          {showWelcomeScreen ? (
            <WelcomeScreen />
          ) : (
            <div
              ref={chatContainerRef}
              className="flex-1 w-full overflow-y-auto scrollbar-thin scrollbar-thumb-openmind-border/30 scrollbar-track-transparent hover:scrollbar-thumb-openmind-border/50"
              style={{
                height: 'calc(100vh - 4rem - 4.5rem)', // Account for header and input heights
                scrollBehavior: 'smooth',
                scrollPadding: '1rem',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 lg:px-6 py-4">
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
        <div className="sticky bottom-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 lg:px-6">
            <ChatInput
              onSendMessage={handleSendMessage}
              onStopGeneration={handleStopGeneration}
              disabled={isLoading}
              isStreaming={isLoading}
              placeholder={hasMessages ? "Continue the conversation..." : "Start your conversation with OpenMind..."}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
