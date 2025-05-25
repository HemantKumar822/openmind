
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  modelId?: string;
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
  SELECTED_MODEL: 'lumi_selected_model'
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
  },
  
  clearCurrentChat: (): void => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_CHAT);
  },
  
  // Theme management
  getTheme: (): 'light' | 'dark' => {
    return (localStorage.getItem(STORAGE_KEYS.THEME) as 'light' | 'dark') || 'light';
  },
  
  setTheme: (theme: 'light' | 'dark'): void => {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
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
    
    return newChat;
  }
};
