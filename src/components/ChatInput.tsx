
import { useState, KeyboardEvent } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput = ({ onSendMessage, disabled = false, placeholder = "Type your message..." }: ChatInputProps) => {
  const [message, setMessage] = useState('');

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
    <div className="border-t border-lumi-border/50 bg-white/80 dark:bg-background/80 backdrop-blur-sm p-4 sm:p-6">
      <div className="container mx-auto max-w-4xl">
        <div className="flex gap-3 sm:gap-4 items-end">
          <div className="flex-1">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              disabled={disabled}
              className="min-h-[50px] sm:min-h-[60px] max-h-[120px] sm:max-h-[200px] resize-none border-lumi-border/50 focus:border-lumi-accent text-base rounded-2xl shadow-sm bg-white dark:bg-background"
              rows={1}
            />
          </div>
          <Button
            onClick={handleSend}
            disabled={disabled || !message.trim()}
            className="lumi-gradient hover:opacity-90 text-white h-[50px] w-[50px] sm:h-[60px] sm:w-[60px] rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200"
            size="icon"
          >
            {disabled ? (
              <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin" />
            ) : (
              <Send className="h-5 w-5 sm:h-6 sm:w-6" />
            )}
          </Button>
        </div>
        <p className="text-xs text-lumi-secondary mt-3 text-center hidden sm:block">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};
