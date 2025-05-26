
import { useState, KeyboardEvent, useRef, useEffect, useCallback } from 'react';
import { Send, Loader2, X } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useChatContext } from '@/providers/ChatProvider';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSendMessage: (message: string, parentId?: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export const ChatInput = ({ onSendMessage, disabled = false, placeholder = "Type your message...", className }: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { activeSession, replyToMessage, clearReply } = useChatContext();
  
  // Clear reply when active session changes
  useEffect(() => {
    clearReply();
  }, [activeSession?.id, clearReply]);
  
  const handleClearReply = useCallback(() => {
    clearReply();
  }, [clearReply]);
  
  // Focus the input when reply target changes
  useEffect(() => {
    if (replyToMessage) {
      textareaRef.current?.focus();
    }
  }, [replyToMessage]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        180 // max height in pixels
      )}px`;
    }
  }, [message]);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim(), replyToMessage || undefined);
      setMessage('');
      clearReply();
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={cn(
      'border-t border-lumi-border/40 bg-white/80 dark:bg-background/80 backdrop-blur-lg p-3 sm:p-4 sticky bottom-0',
      className
        {replyToMessage && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-lumi-surface/50 border-b border-lumi-border/30 overflow-hidden"
          >
            <div className="max-w-4xl mx-auto px-4 py-2 flex items-center justify-between">
              <div className="flex items-center text-sm text-lumi-secondary">
                <CornerUpLeft className="h-4 w-4 mr-2 text-lumi-accent" />
                <span className="truncate max-w-xs">
                  Replying to: {activeSession?.messages.find(m => m.id === replyToMessage)?.content.substring(0, 60)}{activeSession?.messages.find(m => m.id === replyToMessage)?.content.length > 60 ? '...' : ''}
                </span>
              </div>
              <button
                onClick={handleClearReply}
                className="text-lumi-secondary hover:text-lumi-foreground transition-colors p-1"
                aria-label="Cancel reply"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="relative max-w-4xl mx-auto px-4 py-3">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? "Lumi is thinking..." : (replyToMessage ? 'Type your reply...' : 'Ask anything...')}
          disabled={disabled}
          className={cn(
            'w-full min-h-[52px] sm:min-h-[56px] max-h-[180px] resize-none border-2 border-lumi-border/60',
            'text-base sm:text-[15.5px] rounded-2xl shadow-sm bg-white/95 dark:bg-lumi-surface/95',
            'pl-5 pr-14 py-3.5 font-medium placeholder:text-lumi-secondary/60 focus:outline-none',
            'focus-visible:ring-2 focus-visible:ring-lumi-accent focus-visible:ring-offset-0'
          )}
          rows={1}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {message && (
            <button
              onClick={() => setMessage('')}
              disabled={disabled}
              className="p-1.5 rounded-full text-lumi-secondary hover:text-lumi-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-lumi-accent/50"
              aria-label="Clear message"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={handleSend}
            disabled={disabled || !message.trim()}
            className="p-1.5 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-lumi-accent/50 disabled:opacity-50"
            aria-label="Send message"
          >
            {disabled ? (
              <Loader2 className="h-5 w-5 text-lumi-accent animate-spin" />
            ) : (
              <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-orange-500 text-white p-1.5 rounded-full">
                <Send className="h-4 w-4" />
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
