import { useState, useEffect } from 'react';
import { X, MessageSquare, Trash2, Pin, Pencil, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { storageUtils } from '@/lib/storage';

export interface Conversation {
  id: string;
  title: string;
  timestamp: number;
  isPinned?: boolean;
}

interface ConversationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  currentConversationId: string | null;
}

export const ConversationSidebar = ({
  isOpen,
  onClose,
  onNewChat,
  onSelectConversation,
  currentConversationId,
}: ConversationSidebarProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const { toast } = useToast();

  // Load conversations from chat history
  useEffect(() => {
    try {
      const chatHistory = storageUtils.getChatHistory();
      // Only include chats that have messages
      const validConversations = chatHistory
        .filter(chat => chat?.messages?.length > 0)
        .map(chat => ({
          id: chat.id,
          title: chat.title || 'New Chat',
          timestamp: chat.updatedAt || chat.createdAt || Date.now(),
          isPinned: false
        }))
        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)); // Sort by most recent
      
      setConversations(validConversations);
    } catch (e) {
      console.error('Failed to load conversations', e);
      setConversations([]);
    }
  }, [currentConversationId]); // Refresh when current conversation changes

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      // Remove from storage
      storageUtils.deleteChat(id);
      
      // Update local state
      setConversations(prev => prev.filter(conv => conv.id !== id));
      
      // If the deleted conversation is the current one, clear it
      if (id === currentConversationId) {
        onSelectConversation('');
      }
      
      toast({
        title: "Conversation deleted",
        description: "The conversation has been removed from your history.",
      });
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast({
        title: "Error",
        description: "Failed to delete the conversation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversations(conversations.map(conv => 
      conv.id === id ? { ...conv, isPinned: !conv.isPinned } : conv
    ));
  };

  const startEditing = (conversation: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conversation.id);
    setEditTitle(conversation.title);
  };

  const saveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !editTitle.trim()) return;
    
    // Update in storage
    const chat = storageUtils.getChatById(editingId);
    if (chat) {
      const updatedChat = { ...chat, title: editTitle.trim() };
      storageUtils.updateChatInHistory(updatedChat);
    }
    
    // Update local state
    setConversations(conversations.map(conv => 
      conv.id === editingId ? { ...conv, title: editTitle.trim() } : conv
    ));
    
    setEditingId(null);
    setEditTitle('');
  };

  const sortedConversations = [...conversations].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.timestamp - a.timestamp;
  });

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/90 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 h-full w-72 bg-white dark:bg-black shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Conversation history"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700/60">
            <h2 className="text-lg font-semibold text-lumi-primary dark:text-blue-400">Conversations</h2>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
          
          {/* New Chat Button */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700/60">
            <button 
              onClick={() => {
                onNewChat();
                onClose();
              }}
              className="w-full flex items-center justify-center h-10 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-200 shadow-sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Chat
            </button>
          </div>
          
          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto py-2">
            {sortedConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 p-6 text-center">
                <MessageSquare className="h-10 w-10 mb-3 opacity-60" />
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No conversations yet</p>
                <p className="text-xs mt-1 text-gray-400 dark:text-gray-500">Start a new chat to see it here</p>
              </div>
            ) : (
              <ul className="space-y-1 px-2">
                {sortedConversations.map((conversation) => (
                  <li 
                    key={conversation.id}
                    onClick={() => {
                      onSelectConversation(conversation.id);
                      onClose();
                    }}
                    className={`w-full text-left p-2.5 rounded-md flex items-center justify-between group transition-colors duration-150 cursor-pointer ${
                      conversation.id === currentConversationId
                        ? 'bg-blue-100 dark:bg-gray-800 text-blue-700 dark:text-white font-medium'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex-1 min-w-0 flex items-center">
                      <MessageSquare className={`h-4 w-4 mr-2 flex-shrink-0 ${
                        conversation.id === currentConversationId 
                          ? 'text-blue-500 dark:text-blue-400' 
                          : 'text-gray-400 dark:text-gray-500'
                      }`} />
                      {editingId === conversation.id ? (
                        <form onSubmit={saveEdit} className="flex-1" onClick={e => e.stopPropagation()}>
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onClick={e => e.stopPropagation()}
                            onBlur={saveEdit}
                            onKeyDown={(e) => e.key === 'Escape' && setEditingId(null)}
                            className="w-full bg-transparent border-b border-blue-300 dark:border-blue-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                            autoFocus
                          />
                        </form>
                      ) : (
                        <span className="truncate">{conversation.title}</span>
                      )}
                    </div>
                    <div 
                      className="flex items-center opacity-100 transition-opacity"
                      onClick={e => e.stopPropagation()}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePin(conversation.id, e);
                        }}
                        className="p-1.5 rounded hover:bg-gray-200/70 dark:hover:bg-gray-600/50 transition-colors"
                        title={conversation.isPinned ? 'Unpin' : 'Pin to top'}
                      >
                        <Pin
                          className={`h-3.5 w-3.5 ${
                            conversation.isPinned 
                              ? 'text-blue-500 dark:text-blue-400 fill-current' 
                              : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'
                          } transition-colors`}
                        />
                      </button>
                      <button
                        onClick={(e) => startEditing(conversation, e)}
                        className="p-1.5 rounded hover:bg-gray-200/70 dark:hover:bg-gray-600/50 transition-colors"
                        title="Rename"
                      >
                        <Pencil className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(conversation.id, e)}
                        className="p-1 rounded hover:bg-lumi-surface/70 text-red-500 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {/* Footer */}
          <div className="p-4 border-t border-lumi-border/30">
            <div className="flex flex-col items-center justify-center space-y-1 text-xs text-lumi-secondary/60">
              <div className="flex items-center">
                <span>Made with</span>
                <svg 
                  className="mx-1 h-3.5 w-3.5 text-rose-500" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" 
                    clipRule="evenodd" 
                  />
                </svg>
                <span>by Hemant</span>
              </div>
              <div className="text-lumi-secondary/40">
                Powered by OpenRouter
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export const addConversation = (conversation: Omit<Conversation, 'isPinned'>) => {
  const saved = localStorage.getItem('lumi-conversations');
  let conversations: Conversation[] = [];
  
  if (saved) {
    try {
      conversations = JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse conversations', e);
    }
  }
  
  // Update or add conversation
  const existingIndex = conversations.findIndex(c => c.id === conversation.id);
  if (existingIndex >= 0) {
    conversations[existingIndex] = { ...conversations[existingIndex], ...conversation };
  } else {
    conversations.unshift({ ...conversation, isPinned: false });
  }
  
  localStorage.setItem('lumi-conversations', JSON.stringify(conversations));
};

export const getConversation = (id: string): Conversation | undefined => {
  const saved = localStorage.getItem('lumi-conversations');
  if (!saved) return undefined;
  
  try {
    const conversations: Conversation[] = JSON.parse(saved);
    return conversations.find(c => c.id === id);
  } catch (e) {
    console.error('Failed to parse conversations', e);
    return undefined;
  }
};
