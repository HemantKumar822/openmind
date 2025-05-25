
import { ChatMessage as ChatMessageType } from '@/lib/storage';
import { AVAILABLE_MODELS } from '@/lib/models';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === 'user';
  const model = AVAILABLE_MODELS.find(m => m.id === message.modelId);

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-fade-in`}>
      <div className={`max-w-[85%] sm:max-w-[80%] rounded-lg p-3 sm:p-4 ${
        isUser 
          ? 'message-user border text-right' 
          : 'message-assistant border'
      }`}>
        {!isUser && model && (
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-lumi-border">
            <div className="w-5 h-5 rounded-full lumi-gradient flex items-center justify-center">
              <span className="text-white font-bold text-xs">L</span>
            </div>
            <span className="text-xs sm:text-sm font-medium text-lumi-primary">{model.name}</span>
          </div>
        )}
        
        <div className="prose prose-sm max-w-none dark:prose-invert">
          {isUser ? (
            <p className="text-foreground m-0 text-sm sm:text-base">{message.content}</p>
          ) : (
            <ReactMarkdown
              components={{
                code({ className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  const isInline = !match;
                  
                  return isInline ? (
                    <code className="bg-lumi-surface px-1 py-0.5 rounded text-sm" {...props}>
                      {children}
                    </code>
                  ) : (
                    <SyntaxHighlighter
                      style={tomorrow as { [key: string]: React.CSSProperties }}
                      language={match[1]}
                      PreTag="div"
                      className="rounded-md text-sm"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>
        
        <div className="mt-2 text-xs text-lumi-secondary">
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};
