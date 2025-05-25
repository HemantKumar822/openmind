
import { useState, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';
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
    <div className="border-t border-lumi-border bg-background p-3 sm:p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex gap-2 sm:gap-3 items-end">
          <div className="flex-1">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              disabled={disabled}
              className="min-h-[44px] sm:min-h-[60px] max-h-[120px] sm:max-h-[200px] resize-none border-lumi-border focus:border-lumi-accent text-sm sm:text-base"
              rows={1}
            />
          </div>
          <Button
            onClick={handleSend}
            disabled={disabled || !message.trim()}
            className="lumi-gradient hover:opacity-90 text-white h-[44px] w-[44px] sm:h-12 sm:w-12"
            size="icon"
          >
            <Send className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
        <p className="text-xs text-lumi-secondary mt-2 text-center hidden sm:block">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};
