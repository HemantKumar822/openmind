
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
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6 animate-fade-in`}>
      <div className={`max-w-[90%] sm:max-w-[85%] rounded-2xl p-4 sm:p-5 ${
        isUser 
          ? 'bg-lumi-accent text-white shadow-lg' 
          : 'bg-white dark:bg-lumi-surface border border-lumi-border/50 shadow-sm'
      }`}>
        {!isUser && model && (
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-lumi-border/30">
            <div className="w-6 h-6 rounded-full lumi-gradient flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-xs">L</span>
            </div>
            <span className="text-sm font-medium text-lumi-primary">{model.name}</span>
          </div>
        )}
        
        <div className="prose prose-sm max-w-none dark:prose-invert">
          {isUser ? (
            <p className={`m-0 text-sm sm:text-base leading-relaxed ${isUser ? 'text-white' : 'text-foreground'}`}>
              {message.content}
            </p>
          ) : (
            <ReactMarkdown
              components={{
                code({ className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  const isInline = !match;
                  
                  return isInline ? (
                    <code className="bg-lumi-accent/10 text-lumi-accent px-2 py-1 rounded text-sm font-mono" {...props}>
                      {children}
                    </code>
                  ) : (
                    <SyntaxHighlighter
                      style={tomorrow}
                      language={match[1]}
                      PreTag="div"
                      className="!rounded-xl !text-sm !my-4 shadow-sm"
                      customStyle={{
                        background: '#1a1a1a',
                        padding: '1rem',
                        borderRadius: '0.75rem',
                      }}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  );
                },
                p: ({ children }) => (
                  <p className="text-foreground leading-relaxed mb-3 last:mb-0">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside space-y-1 mb-3">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside space-y-1 mb-3">{children}</ol>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>
        
        <div className={`mt-3 text-xs ${isUser ? 'text-white/70' : 'text-lumi-secondary'}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </div>
  );
};
