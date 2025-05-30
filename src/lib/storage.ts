
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
  API_KEY: 'openmind_openrouter_api_key',
  CURRENT_CHAT: 'openmind_current_chat',
  CHAT_HISTORY: 'openmind_chat_history',
  THEME: 'openmind_theme',
  SELECTED_MODEL: 'openmind_selected_model'
};

export const storageUtils = {
  // API Key management
  getApiKey: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.API_KEY);
  },
  
  setApiKey: (key: string): void => {
    localStorage.setItem(STORAGE_KEYS.API_KEY, key);
  },
  
  removeApiKey: (): void => {
    localStorage.removeItem(STORAGE_KEYS.API_KEY);
  },
  
  // Current chat session
  getCurrentChat: (): ChatSession | null => {
    const chat = localStorage.getItem(STORAGE_KEYS.CURRENT_CHAT);
    return chat ? JSON.parse(chat) : null;
  },
  
  setCurrentChat: (chat: ChatSession): void => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_CHAT, JSON.stringify(chat));
    // Also update in history
    storageUtils.updateChatInHistory(chat);
  },
  
  clearCurrentChat: (): void => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_CHAT);
  },
  
  // Theme management
  getTheme: (): ThemePreference => {
    const stored = localStorage.getItem(STORAGE_KEYS.THEME);
    return (stored === 'light' || stored === 'dark' || stored === 'system') ? stored : 'system';
  },
  
  setTheme: (theme: ThemePreference): void => {
    if (theme === 'system') {
      localStorage.removeItem(STORAGE_KEYS.THEME);
    } else {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    }
  },
  
  getSystemTheme: (): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  },
  
  getResolvedTheme: (): 'light' | 'dark' => {
    const theme = storageUtils.getTheme();
    return theme === 'system' ? storageUtils.getSystemTheme() : theme;
  },
  
  // Selected model
  getSelectedModel: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.SELECTED_MODEL);
  },
  
  setSelectedModel: (modelId: string): void => {
    localStorage.setItem(STORAGE_KEYS.SELECTED_MODEL, modelId);
  },
  
  // Generate new chat session
  createNewChat: (modelId: string): ChatSession => {
    const newChat: ChatSession = {
      id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: 'New Chat',
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
  
  // Get chat by ID
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
  
  // Get all chat history
  getChatHistory: (): ChatSession[] => {
    const history = localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY);
    return history ? JSON.parse(history) : [];
  },
  
  // Update chat in history (only if it has messages)
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
          history.unshift(updatedChat);
        }
        localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(history));
      } else if (existingIndex >= 0) {
        // Remove if no messages exist
        history.splice(existingIndex, 1);
        localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(history));
      }
    } catch (error) {
      console.error('Error updating chat in history:', error);
    }
  },
  
  // Delete chat from history
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
};
