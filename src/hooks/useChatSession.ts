import { useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AVAILABLE_MODELS } from '@/lib/models';
import { storageUtils, ChatMessage as ChatMessageType, ChatSession, Conversation, addConversation } from '@/lib/storage';
import { OpenRouterClient } from '@/lib/openrouter';
import { useToast } from '@/hooks/use-toast';

/**
 * Manages the entire lifecycle of a chat session.
 * This includes handling the current chat state, selected model, message sending,
 * API interactions with OpenRouter, and conversation management (loading, starting new chats).
 * It also provides a ref for the chat container to enable auto-scrolling.
 *
 * @returns {object} An object containing all necessary state and functions to manage a chat session.
 */
export const useChatSession = () => {
  /** @type {[string, React.Dispatch<React.SetStateAction<string>>]} */
  const [selectedModel, setSelectedModel] = useState<string>(
    storageUtils.getSelectedModel() || AVAILABLE_MODELS[1].id
  );
  /** @type {[ChatSession | null, React.Dispatch<React.SetStateAction<ChatSession | null>>]} */
  const [currentChat, setCurrentChat] = useState<ChatSession | null>(
    storageUtils.getCurrentChat()
  );
  /** @type {[string | null, React.Dispatch<React.SetStateAction<string | null>>]} */
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(
    storageUtils.getCurrentChat()?.id || null
  );
  /** @type {[boolean, React.Dispatch<React.SetStateAction<boolean>>]} */
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  /** @type {React.RefObject<HTMLDivElement>} Reference to the chat container div for auto-scrolling. */
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom with smooth animation
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [currentChat?.messages]);

  /**
   * Starts a new chat session.
   * This creates a new chat object, sets it as the current chat,
   * updates the current conversation ID, and persists the new chat.
   * @returns {ChatSession} The newly created chat session.
   */
  const startNewChat = useCallback(() => {
    const newChat = storageUtils.createNewChat(selectedModel);
    setCurrentChat(newChat);
    setCurrentConversationId(newChat.id);
    storageUtils.setCurrentChat(newChat); // Persist immediately
    // Add to conversation list for sidebar
    addConversation({ id: newChat.id, title: newChat.title, timestamp: newChat.updatedAt });
    return newChat;
  }, [selectedModel]);

  /**
   * Selects a new model for the chat.
   * Updates the selected model state and persists it.
   * If there's an active chat with messages and the model changes,
   * it may start a new chat or update the current chat's model based on its state.
   * @param {string} modelId - The ID of the model to select.
   */
  const selectModel = useCallback((modelId: string) => {
    setSelectedModel(modelId);
    storageUtils.setSelectedModel(modelId);
    // Optionally, start a new chat if messages exist in current chat with old model
    // This behavior is retained from original Index.tsx
    if (currentChat && currentChat.messages.length > 0 && currentChat.modelId !== modelId) {
        // Update current chat's model ID if it's empty, or start new if not
        if (currentChat.messages.length === 0) {
            const updatedChat = { ...currentChat, modelId };
            setCurrentChat(updatedChat);
            storageUtils.setCurrentChat(updatedChat);
        } else {
            startNewChat();
        }
    } else if (currentChat) {
        // if current chat has no messages, just update its modelId
        const updatedChat = { ...currentChat, modelId };
        setCurrentChat(updatedChat);
        storageUtils.setCurrentChat(updatedChat);
    }
  }, [currentChat, startNewChat]);

  /**
   * Loads an existing chat session based on its conversation ID.
   * If the ID is invalid or not found, it starts a new chat session.
   * @param {string} conversationId - The ID of the conversation to load.
   */
  const loadChatSession = useCallback((conversationId: string) => {
    if (!conversationId) {
      startNewChat();
      return;
    }
    const chat = storageUtils.getChatById(conversationId);
    if (chat) {
      setCurrentChat(chat);
      setCurrentConversationId(chat.id);
      setSelectedModel(chat.modelId);
      storageUtils.setCurrentChat(chat); // Persist as current chat
    } else {
      // If chat ID is invalid or not found, start a new one
      startNewChat();
    }
  }, [startNewChat]);
  
  // Effect to update conversation list when currentChat changes (e.g., new message, title update)
  // This ensures the sidebar reflects the most up-to-date conversation titles and timestamps.
  useEffect(() => {
    if (currentChat && currentChat.messages.length > 0) { // Only add/update if there are messages
      const conversation: Omit<Conversation, 'isPinned'> = {
        id: currentChat.id,
        title: currentChat.title || 'New Chat', // Ensure title is present
        timestamp: currentChat.updatedAt || Date.now(),
      };
      addConversation(conversation);
      setCurrentConversationId(currentChat.id); // Ensure currentConversationId is in sync
    }
  }, [currentChat]);


  // Save selected model to storage
  useEffect(() => {
    storageUtils.setSelectedModel(selectedModel);
  }, [selectedModel]);

  // Save current chat to storage
  // This might be redundant if setCurrentChat always calls storageUtils.setCurrentChat
  // but keeping it for safety, or if setCurrentChat is used internally without immediate persistence.
  useEffect(() => {
    if (currentChat) {
      storageUtils.setCurrentChat(currentChat);
    }
  }, [currentChat]);

  /**
   * Sends a message from the user.
   * This involves updating the chat with the user's message, then making a request
   * to the OpenRouter API to get the assistant's response. The assistant's response
   * is streamed and progressively updates the chat.
   * @param {string} content - The content of the message to send.
   * @returns {Promise<void>} A promise that resolves when the message sending process is complete (or an error occurs).
   */
  const sendMessage = async (content: string) => {
    const apiKey = storageUtils.getApiKey();
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please set your API key in the settings.",
        variant: "destructive",
      });
      return;
    }

    let activeChat = currentChat;
    if (!activeChat) {
      activeChat = startNewChat(); // Creates, sets state, and persists
    }
    
    // Ensure activeChat is not null after potential startNewChat
    if (!activeChat) {
        toast({ title: "Error", description: "Failed to initialize chat session.", variant: "destructive" });
        return;
    }

    const userMessage: ChatMessageType = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: Date.now(),
      modelId: selectedModel,
    };

    // Update chat with user message
    activeChat = {
      ...activeChat,
      messages: [...(activeChat.messages || []), userMessage],
      updatedAt: Date.now(),
      modelId: selectedModel // Ensure modelId is current
    };
    setCurrentChat(activeChat);
    // storageUtils.setCurrentChat(activeChat); // Handled by useEffect or direct call in startNewChat

    const assistantMessageId = `msg-${Date.now()}`;
    const initialTimestamp = Date.now();
    let fullResponse = '';

    const initialAssistantMessage: ChatMessageType = {
      id: assistantMessageId,
      role: 'assistant',
      content: fullResponse,
      timestamp: initialTimestamp,
      modelId: selectedModel,
      isStreaming: true,
    };
    
    // Update chat with initial assistant message
    activeChat = {
      ...activeChat,
      messages: [...activeChat.messages, initialAssistantMessage],
      updatedAt: initialTimestamp,
    };
    setCurrentChat(activeChat);
    // storageUtils.setCurrentChat(activeChat);

    setIsLoading(true);
    const openRouter = new OpenRouterClient(apiKey);
    const abortController = new AbortController();
    let isStreaming = true;
    let hasError = false;
    // Scroll interval is managed by the main useEffect for chatContainerRef now

    const cleanup = () => {
      isStreaming = false;
      abortController.abort();
      setIsLoading(false);
    };

    try {
      const modelName = AVAILABLE_MODELS.find(m => m.id === selectedModel)?.name || 'AI Assistant';
      const stream = openRouter.streamMessage(
        selectedModel,
        activeChat.messages.filter(m => m.id !== assistantMessageId).map(msg => ({ // Send all but the placeholder
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content,
        })),
        modelName,
        abortController.signal
      );

      let lastUpdateTime = 0;
      const UPDATE_THROTTLE_MS = 50;

      for await (const chunk of stream) {
        if (!isStreaming) break;
        if (chunk.error) throw new Error(chunk.error); // Handled by outer catch
        if (chunk.done) break;

        fullResponse += chunk.content;
        const now = Date.now();

        if (now - lastUpdateTime > UPDATE_THROTTLE_MS) {
          lastUpdateTime = now;
          setCurrentChat(prev => {
            if (!prev) return prev;
            const msgIndex = prev.messages.findIndex(m => m.id === assistantMessageId);
            if (msgIndex === -1) return prev;

            const newMessages = [...prev.messages];
            newMessages[msgIndex] = {
              ...newMessages[msgIndex],
              content: fullResponse,
              timestamp: now,
              isStreaming: true,
            };
            return { ...prev, messages: newMessages, updatedAt: now };
          });
        }
      }
      
      // Final update for the assistant's message
      setCurrentChat(prev => {
        if (!prev) return prev;
        const msgIndex = prev.messages.findIndex(m => m.id === assistantMessageId);
        if (msgIndex === -1) return prev;

        const finalMessages = [...prev.messages];
        const finalMessageContent = fullResponse;
        finalMessages[msgIndex] = {
          ...finalMessages[msgIndex],
          content: finalMessageContent,
          isStreaming: false,
          timestamp: Date.now(),
        };
        
        const finalChatSession = {
          ...prev,
          messages: finalMessages,
          updatedAt: Date.now(),
          title: finalMessages.length === 2 && userMessage.content // Set title for new conversations (user + assistant)
            ? userMessage.content.slice(0, 50) + (userMessage.content.length > 50 ? '...' : '')
            : prev.title,
        };
        
        storageUtils.setCurrentChat(finalChatSession); // Persist final state
        addConversation({ // Update conversation list
            id: finalChatSession.id, 
            title: finalChatSession.title, 
            timestamp: finalChatSession.updatedAt 
        });
        return finalChatSession;
      });

    } catch (error) {
      hasError = true;
      if (error instanceof Error && error.name !== 'AbortError') {
        toast({
          title: "Error",
          description: error.message || "Failed to send message. Please try again.",
          variant: "destructive",
        });
      }
      // If it was a new chat that errored on first message, consider deleting it
      if (activeChat.messages.length === 2 && userMessage) { // user message + placeholder assistant
         setTimeout(() => {
            setCurrentChat(prev => {
                // Check if the chat is still in the error state (only 2 messages, assistant streaming)
                if (prev && prev.id === activeChat?.id && prev.messages.length === 2 && prev.messages[1].isStreaming) {
                    storageUtils.deleteChat(activeChat.id);
                    setCurrentConversationId(null); // Clear current conversation ID
                    return null; // Reset currentChat state
                }
                return prev;
            });
        }, 300);
      } else if(activeChat.messages.length > 1) { // If not a new chat, revert the optimistic assistant message
        setCurrentChat(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                messages: prev.messages.filter(m => m.id !== assistantMessageId)
            };
        });
      }
    } finally {
      cleanup();
    }
  };

  return {
    /** @type {ChatSession | null} The current active chat session. */
    currentChat,
    /** @type {string | null} The ID of the current active conversation. */
    currentConversationId,
    /** @type {string} The ID of the currently selected language model. */
    selectedModel,
    /** @type {boolean} Indicates if a message is currently being sent or streamed. */
    isLoading,
    /** @type {(content: string) => Promise<void>} Function to send a message. */
    sendMessage,
    /** @type {() => ChatSession} Function to start a new chat session. */
    startNewChat,
    /** @type {(modelId: string) => void} Function to select a new language model. */
    selectModel,
    /** @type {(conversationId: string) => void} Function to load an existing chat session. */
    loadChatSession,
    /** @type {React.RefObject<HTMLDivElement>} Ref for the chat container DOM element. */
    chatContainerRef
  };
};
