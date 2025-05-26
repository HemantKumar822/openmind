
export type ThemePreference = 'light' | 'dark' | 'system';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  modelId?: string;
  isStreaming?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  modelId: string;
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEYS = {
  API_KEY: 'lumi_openrouter_api_key',
  CURRENT_CHAT: 'lumi_current_chat',
  CHAT_HISTORY: 'lumi_chat_history',
  THEME: 'lumi_theme',
  SELECTED_MODEL: 'lumi_selected_model',
  CONVERSATIONS: 'lumi-conversations'
};

/**
 * Represents a conversation item, typically used for display in a list.
 * Derived from a ChatSession but may contain a subset of its information.
 * @interface Conversation
 * @property {string} id - Unique identifier for the conversation.
 * @property {string} title - Title of the conversation.
 * @property {number} timestamp - Timestamp of the last update.
 * @property {boolean} [isPinned] - Optional flag indicating if the conversation is pinned.
 */
export interface Conversation {
  id: string;
  title: string;
  timestamp: number;
  isPinned?: boolean;
}

/**
 * Utility object for managing application data in localStorage.
 * This includes API keys, chat sessions, theme preferences, selected models, and conversation lists.
 */
export const storageUtils = {
  /**
   * Retrieves the stored OpenRouter API key.
   * @returns {string | null} The API key, or null if not set.
   */
  getApiKey: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.API_KEY);
  },
  
  /**
   * Stores the OpenRouter API key.
   * @param {string} key - The API key to store.
   */
  setApiKey: (key: string): void => {
    localStorage.setItem(STORAGE_KEYS.API_KEY, key);
  },
  
  /**
   * Removes the stored OpenRouter API key.
   */
  removeApiKey: (): void => {
    localStorage.removeItem(STORAGE_KEYS.API_KEY);
  },
  
  /**
   * Retrieves the current active chat session.
   * @returns {ChatSession | null} The current chat session, or null if none is active.
   */
  getCurrentChat: (): ChatSession | null => {
    const chat = localStorage.getItem(STORAGE_KEYS.CURRENT_CHAT);
    return chat ? JSON.parse(chat) : null;
  },
  
  /**
   * Sets the current active chat session and updates it in the chat history.
   * @param {ChatSession} chat - The chat session to set as current.
   */
  setCurrentChat: (chat: ChatSession): void => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_CHAT, JSON.stringify(chat));
    // Also update in history
    storageUtils.updateChatInHistory(chat);
  },
  
  /**
   * Clears the current active chat session from storage.
   */
  clearCurrentChat: (): void => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_CHAT);
  },
  
  /**
   * Retrieves the stored theme preference.
   * @returns {ThemePreference} The theme preference ('light', 'dark', or 'system'). Defaults to 'system'.
   */
  getTheme: (): ThemePreference => {
    const stored = localStorage.getItem(STORAGE_KEYS.THEME);
    return (stored === 'light' || stored === 'dark' || stored === 'system') ? stored : 'system';
  },
  
  /**
   * Stores the theme preference.
   * If 'system' is chosen, the specific theme is removed from storage to defer to system settings.
   * @param {ThemePreference} theme - The theme preference to store.
   */
  setTheme: (theme: ThemePreference): void => {
    if (theme === 'system') {
      localStorage.removeItem(STORAGE_KEYS.THEME);
    } else {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    }
  },
  
  /**
   * Determines the system's current theme preference (light or dark).
   * @returns {'light' | 'dark'} The system's theme. Defaults to 'light' if window is undefined.
   */
  getSystemTheme: (): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  },
  
  /**
   * Resolves the actual theme to apply (light or dark) based on stored preference and system theme.
   * @returns {'light' | 'dark'} The resolved theme.
   */
  getResolvedTheme: (): 'light' | 'dark' => {
    const theme = storageUtils.getTheme();
    return theme === 'system' ? storageUtils.getSystemTheme() : theme;
  },
  
  /**
   * Retrieves the ID of the currently selected language model.
   * @returns {string | null} The selected model ID, or null if not set.
   */
  getSelectedModel: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.SELECTED_MODEL);
  },
  
  /**
   * Stores the ID of the selected language model.
   * @param {string} modelId - The ID of the model to store.
   */
  setSelectedModel: (modelId: string): void => {
    localStorage.setItem(STORAGE_KEYS.SELECTED_MODEL, modelId);
  },
  
  /**
   * Creates a new chat session object and adds it to the beginning of the chat history.
   * @param {string} modelId - The ID of the model to associate with the new chat.
   * @returns {ChatSession} The newly created chat session.
   */
  createNewChat: (modelId: string): ChatSession => {
    const newChat: ChatSession = {
      id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: 'New Chat', // Default title for new chats
      messages: [],
      modelId,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    // Add to chat history
    const history = storageUtils.getChatHistory();
    history.unshift(newChat);
    localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(history));
    
    return newChat;
  },
  
  /**
   * Retrieves a specific chat session by its ID from the chat history.
   * @param {string} id - The ID of the chat session to retrieve.
   * @returns {ChatSession | null} The chat session if found, otherwise null.
   */
  getChatById: (id: string): ChatSession | null => {
    if (!id) return null;
    try {
      const history = storageUtils.getChatHistory();
      return history.find(chat => chat.id === id) || null;
    } catch (error) {
      console.error('Error getting chat by ID:', error);
      return null;
    }
  },
  
  /**
   * Retrieves the entire chat history.
   * @returns {ChatSession[]} An array of chat sessions, or an empty array if history is empty or an error occurs.
   */
  getChatHistory: (): ChatSession[] => {
    const history = localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY);
    return history ? JSON.parse(history) : [];
  },
  
  /**
   * Updates an existing chat session in the history or adds it if new.
   * If the chat session has no messages and already exists in history, it's removed.
   * Chat sessions are only persisted if they contain messages.
   * @param {ChatSession} updatedChat - The chat session to update or add.
   */
  updateChatInHistory: (updatedChat: ChatSession): void => {
    if (!updatedChat?.id) return;
    
    try {
      const history = storageUtils.getChatHistory();
      const existingIndex = history.findIndex(chat => chat.id === updatedChat.id);
      
      // Only update or add if chat has messages
      if (updatedChat.messages && updatedChat.messages.length > 0) {
        if (existingIndex >= 0) {
          history[existingIndex] = updatedChat;
        } else {
          history.unshift(updatedChat); // Add to the beginning if new
        }
        localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(history));
      } else if (existingIndex >= 0) {
        // Remove if no messages exist and it was previously in history
        history.splice(existingIndex, 1);
        localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(history));
      }
    } catch (error) {
      console.error('Error updating chat in history:', error);
    }
  },
  
  /**
   * Deletes a chat session from the history by its ID.
   * If the deleted chat is the current active chat, it also clears the current chat.
   * @param {string} id - The ID of the chat session to delete.
   */
  deleteChat: (id: string): void => {
    if (!id) return;
    
    try {
      const history = storageUtils.getChatHistory();
      const updatedHistory = history.filter(chat => chat.id !== id);
      localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(updatedHistory));
      
      // If deleting current chat, clear it from storage
      const current = storageUtils.getCurrentChat();
      if (current?.id === id) {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_CHAT);
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  },

  /**
   * Adds or updates a conversation in the dedicated conversation list.
   * Conversations are primarily used for display in sidebars or lists.
   * @param {Omit<Conversation, 'isPinned'>} conversation - The conversation object to add or update.
   *                                                        `isPinned` defaults to false if not present.
   */
  addConversation: (conversation: Omit<Conversation, 'isPinned'>): void => {
    const saved = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    let conversations: Conversation[] = [];
    
    if (saved) {
      try {
        conversations = JSON.parse(saved);
      } catch (e) {
        // Failed to parse, start with empty array
        console.error('Failed to parse conversations from localStorage', e);
      }
    }
    
    // Update or add conversation
    const existingIndex = conversations.findIndex(c => c.id === conversation.id);
    if (existingIndex >= 0) {
      // Preserve existing pinned status if not explicitly part of the update
      const currentConversation = conversations[existingIndex];
      conversations[existingIndex] = { 
        ...currentConversation, // Keep existing fields like isPinned
        ...conversation         // Overwrite with new data
      };
    } else {
      conversations.unshift({ ...conversation, isPinned: false }); // Add to the beginning, default isPinned to false
    }
    
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
  },

  /**
   * Retrieves a specific conversation by its ID from the conversation list.
   * @param {string} id - The ID of the conversation to retrieve.
   * @returns {Conversation | undefined} The conversation if found, otherwise undefined.
   */
  getConversation: (id: string): Conversation | undefined => {
    const saved = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    if (!saved) return undefined;
    
    try {
      const conversations: Conversation[] = JSON.parse(saved);
      return conversations.find(c => c.id === id);
    } catch (e) {
      console.error('Failed to parse conversations from localStorage', e);
      return undefined;
    }
  },

  /**
   * Retrieves the entire list of conversations.
   * @returns {Conversation[]} An array of conversations, or an empty array if none are stored or an error occurs.
   */
  getConversations: (): Conversation[] => {
    const saved = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    if (!saved) return [];
    
    try {
      return JSON.parse(saved) as Conversation[];
    } catch (e) {
      console.error('Failed to parse conversations from localStorage', e);
      return [];
    }
  },

  /**
   * Sets the pinned status of a specific conversation in the conversation list.
   * @param {string} id - The ID of the conversation to update.
   * @param {boolean} isPinned - The new pinned status.
   */
  setConversationPinnedStatus: (id: string, isPinned: boolean): void => {
    const conversations = storageUtils.getConversations();
    const conversationIndex = conversations.findIndex(c => c.id === id);

    if (conversationIndex !== -1) {
      conversations[conversationIndex].isPinned = isPinned;
      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
    }
  }
};
