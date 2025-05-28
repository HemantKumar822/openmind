
import { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { Send, Loader2, X } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onStopGeneration?: () => void;
  disabled?: boolean;
  isStreaming?: boolean;
  placeholder?: string;
}

export const ChatInput = ({
  onSendMessage,
  onStopGeneration,
  disabled = false,
  isStreaming = false,
  placeholder = "Type your message..."
}: ChatInputProps) => {
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

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full border-t border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-black/80 p-2 sm:p-4 sticky bottom-0 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl mx-auto">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? "Lyra is thinking..." : "Ask anything..."}
          disabled={disabled}
          className="w-full min-h-[48px] sm:min-h-[56px] max-h-[200px] sm:max-h-[280px] resize-none border-2 border-gray-200 dark:border-gray-700 text-base sm:text-[15.5px] rounded-2xl shadow-sm bg-white dark:bg-gray-900/80 pl-4 sm:pl-5 pr-12 sm:pr-14 py-3 font-medium placeholder:text-gray-500/60 dark:placeholder:text-gray-500/70 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition-all duration-200 ease-in-out backdrop-blur-sm overflow-y-auto overscroll-contain scrollbar-hide"
          style={{
            // For better mobile experience with virtual keyboards
            WebkitAppearance: 'none',
            appearance: 'none',
            lineHeight: '1.5',
            // Hide scrollbar for all browsers
            scrollbarWidth: 'none', // Firefox
            msOverflowStyle: 'none', // IE and Edge
            WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
          }}
          // @ts-ignore - This is a valid attribute
          scrollbarWidth="none"
          rows={1}
        />
        {isStreaming ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onStopGeneration?.();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-br from-red-500 to-red-700 text-white p-2 rounded-full hover:opacity-90 transition-opacity flex items-center justify-center z-10 overflow-hidden shadow-sm"
            title="Stop generating"
          >
            <div className="relative w-4 h-4 flex items-center justify-center">
              <div className="absolute w-3 h-3 bg-white rounded-sm" 
                   style={{
                     animation: 'pulse 1.5s ease-in-out infinite',
                     boxShadow: '0 0 0 0 rgba(255, 255, 255, 0.7)'
                   }}>
              </div>
              <style>
                {`
                  @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.6; transform: scale(0.9); }
                  }
                `}
              </style>
            </div>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSend}
            disabled={disabled || !message.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full focus:outline-none disabled:opacity-50 z-10"
            aria-label="Send message"
          >
            {disabled ? (
              <Loader2 className="h-5 w-5 text-primary-500 animate-spin" />
            ) : (
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-1.5 rounded-full hover:opacity-90 transition-opacity shadow-sm">
                <Send className="h-4 w-4" />
              </div>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
