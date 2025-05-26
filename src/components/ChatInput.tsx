
import { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput = ({ onSendMessage, disabled = false, placeholder = "Type your message..." }: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-lumi-border/40 bg-white/80 dark:bg-background/80 backdrop-blur-lg p-2 sm:p-4 sticky bottom-0">
      <div className="container mx-auto max-w-4xl px-2 sm:px-4">
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            onKeyDown={(e) => {
              // Prevent default behavior for Enter key to avoid form submission
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
              }
            }}
            placeholder={disabled ? "Lyra is thinking..." : "Ask anything..."}
            disabled={disabled}
            className="w-full min-h-[48px] sm:min-h-[56px] max-h-[180px] sm:max-h-[240px] resize-none border-2 border-lumi-border/60 text-base sm:text-[15.5px] rounded-2xl shadow-sm bg-white/95 dark:bg-lumi-surface/95 pl-4 sm:pl-5 pr-12 sm:pr-14 py-3 font-medium placeholder:text-lumi-secondary/60 focus:outline-none focus:ring-2 focus:ring-lumi-accent/20 focus:border-lumi-accent/50 transition-all duration-200 ease-in-out"
            style={{
              // For better mobile experience with virtual keyboards
              WebkitAppearance: 'none',
              appearance: 'none',
              lineHeight: '1.5',
            }}
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={disabled || !message.trim()}
            aria-label="Send message"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full focus:outline-none disabled:opacity-50"
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
