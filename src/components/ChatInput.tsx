
import { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { Send, Loader2, Square, Sparkles, Mic } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';

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
  placeholder = "Ask anything..."
}: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200 // max height in pixels
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

  const suggestions = [
    "Explain quantum computing",
    "Write a creative story",
    "Help with coding",
    "Plan a trip"
  ];

  return (
    <div className="w-full bg-gradient-to-t from-white/95 via-white/90 to-transparent dark:from-black/95 dark:via-black/90 dark:to-transparent backdrop-blur-xl border-t border-gray-200/60 dark:border-gray-700/60 sticky bottom-0 z-20">
      {/* Quick Suggestions */}
      <AnimatePresence>
        {!message && !isFocused && (
          <motion.div
            className="px-4 pt-4 pb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center space-x-2 mb-3">
                <Sparkles className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Try these suggestions
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                  <motion.button
                    key={suggestion}
                    onClick={() => setMessage(suggestion)}
                    className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 border border-gray-200 dark:border-gray-700"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1, duration: 0.2 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {suggestion}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Input Area */}
      <div className="px-4 pb-4 pt-2">
        <div className="w-full max-w-4xl mx-auto">
          <motion.div 
            className={`relative rounded-2xl transition-all duration-300 ${
              isFocused 
                ? 'shadow-lg shadow-blue-500/10 ring-2 ring-blue-500/20' 
                : 'shadow-md hover:shadow-lg'
            }`}
            layout
          >
            {/* Gradient Border Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 rounded-2xl p-[1px] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <div className="w-full h-full bg-white dark:bg-gray-900 rounded-2xl"></div>
            </div>
            
            <div className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={disabled ? "OpenMind is thinking..." : placeholder}
                disabled={disabled}
                className="w-full min-h-[60px] max-h-[200px] resize-none border-0 bg-transparent text-base px-6 py-4 pr-20 placeholder:text-gray-500/70 dark:placeholder:text-gray-400/70 focus:outline-none focus:ring-0 focus-visible:ring-0 transition-all duration-200"
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  WebkitOverflowScrolling: 'touch',
                }}
                rows={1}
              />
              
              {/* Action Buttons */}
              <div className="absolute right-3 bottom-3 flex items-center space-x-2">
                {/* Voice Input Button (placeholder) */}
                <motion.button
                  type="button"
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Voice input (coming soon)"
                >
                  <Mic className="h-4 w-4" />
                </motion.button>

                {/* Send/Stop Button */}
                <AnimatePresence mode="wait">
                  {isStreaming ? (
                    <motion.button
                      key="stop"
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onStopGeneration?.();
                      }}
                      className="p-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center group"
                      initial={{ opacity: 0, scale: 0.8, rotate: -180 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      exit={{ opacity: 0, scale: 0.8, rotate: 180 }}
                      transition={{ duration: 0.2 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      title="Stop generating"
                    >
                      <Square className="h-4 w-4 fill-current" />
                    </motion.button>
                  ) : (
                    <motion.button
                      key="send"
                      type="button"
                      onClick={handleSend}
                      disabled={disabled || !message.trim()}
                      className={`p-2.5 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center group ${
                        message.trim() && !disabled
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                      }`}
                      initial={{ opacity: 0, scale: 0.8, rotate: 180 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      exit={{ opacity: 0, scale: 0.8, rotate: -180 }}
                      transition={{ duration: 0.2 }}
                      whileHover={message.trim() && !disabled ? { scale: 1.05 } : {}}
                      whileTap={message.trim() && !disabled ? { scale: 0.95 } : {}}
                      title="Send message"
                    >
                      {disabled ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
                      )}
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Character Count & Tips */}
          <AnimatePresence>
            {(isFocused || message.length > 0) && (
              <motion.div
                className="flex items-center justify-between mt-3 px-2 text-xs text-gray-500 dark:text-gray-400"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <span>Press Shift + Enter for new line</span>
                <span className={message.length > 4000 ? 'text-orange-500' : ''}>
                  {message.length}/5000
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
