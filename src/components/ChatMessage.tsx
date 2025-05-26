import { ChatMessage as ChatMessageType } from '@/lib/storage';
import { AVAILABLE_MODELS } from '@/lib/models';
import ReactMarkdown, { Components } from 'react-markdown';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { memo, useMemo } from 'react';
import { CodeBlock } from '@/components/ui/CodeBlock';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { ComponentPropsWithoutRef } from 'react';

interface ChatMessageProps {
  message: ChatMessageType;
}

function ChatMessageComponent({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const model = AVAILABLE_MODELS.find(m => m.id === message.modelId);
  const isTyping = message.isStreaming === true;
  const content = message.content || '';

  const processedContent = useMemo(() => {
    // Pre-processing is removed as remark-gfm should handle standard cases.
    // If specific formatting issues from AI output persist,
    // consider targeted remark/rehype plugins or minimal necessary preprocessing.
    return content;
  }, [content]);

  const renderMarkdown = () => {
    const components: Components = {
      code({ node, className, children, inline, ...props }: ComponentPropsWithoutRef<'code'> & { inline?: boolean; node?: any }) {
        const match = /language-(\w+)/.exec(className || '');
        
        if (inline || !match) { // Treat as inline if no language match or explicitly inline
          return (
            <code 
              className={cn("bg-lumi-accent/10 text-lumi-accent px-1.5 py-0.5 rounded text-sm font-mono break-words", className)}
              {...props}
            >
              {children}
            </code>
          );
        }

        const language = match[1];
        const codeContent = String(children).replace(/\n$/, '');
        
        return (
          <div className="my-4">
            <CodeBlock 
              language={language}
              value={codeContent}
              showLineNumbers={codeContent.split('\n').length > 2}
            />
          </div>
        );
      },
      pre: (props: ComponentPropsWithoutRef<'pre'>) => (
        <div className="my-4" {...props} />
      ),
      p: (props: ComponentPropsWithoutRef<'p'>) => {
        // Skip rendering empty paragraphs
        if (!props.children || (Array.isArray(props.children) && props.children.every(child => !child || child === '\n'))) {
          return null;
        }
        return (
          <p className="text-foreground leading-relaxed text-sm sm:text-[15px] my-3 first:mt-0 last:mb-0" {...props} />
        );
      },
      ul: (props: ComponentPropsWithoutRef<'ul'>) => (
        <ul className="list-disc list-inside space-y-1 my-3 pl-5" {...props} />
      ),
      ol: (props: ComponentPropsWithoutRef<'ol'>) => (
        <ol className="list-decimal list-inside space-y-1 my-3 pl-5" {...props} />
      ),
      li: (props: ComponentPropsWithoutRef<'li'>) => (
        <li className="pl-1 -ml-1">
          <span className="-ml-1.5">{props.children}</span>
        </li>
      ),
      a: (props: ComponentPropsWithoutRef<'a'>) => {
        // Ensure href exists and is a string
        const href = typeof props.href === 'string' ? props.href : '#';
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lumi-accent hover:underline break-words"
            {...props}
          />
        );
      },
      blockquote: (props: ComponentPropsWithoutRef<'blockquote'>) => (
        <blockquote
          className="border-l-4 border-lumi-accent/30 pl-4 py-1 my-3 text-lumi-secondary"
          {...props}
        />
      ),
      h1: (props: ComponentPropsWithoutRef<'h1'>) => (
        <h1 className="text-2xl font-bold my-4" {...props} />
      ),
      h2: (props: ComponentPropsWithoutRef<'h2'>) => (
        <h2 className="text-xl font-bold my-3" {...props} />
      ),
      h3: (props: ComponentPropsWithoutRef<'h3'>) => (
        <h3 className="text-lg font-semibold my-2" {...props} />
      ),
      h4: (props: ComponentPropsWithoutRef<'h4'>) => (
        <h4 className="text-base font-medium my-2" {...props} />
      ),
      hr: (props: ComponentPropsWithoutRef<'hr'>) => <hr className="my-4 border-lumi-border/30" {...props} />,
      table: (props: ComponentPropsWithoutRef<'table'>) => (
        <div className="overflow-x-auto my-4">
          <table className="min-w-full border-collapse border border-lumi-border/30" {...props} />
        </div>
      ),
      thead: (props: ComponentPropsWithoutRef<'thead'>) => (
        <thead className="bg-lumi-surface/50 dark:bg-lumi-surface/80" {...props} />
      ),
      tbody: (props: ComponentPropsWithoutRef<'tbody'>) => (
        <tbody className="divide-y divide-lumi-border/30" {...props} />
      ),
      tr: (props: ComponentPropsWithoutRef<'tr'> & { isHeader?: boolean }) => ( // isHeader is a custom prop from react-markdown
        <tr className={`hover:bg-lumi-surface/30 transition-colors ${props.isHeader ? 'font-semibold' : ''}`} {...props} />
      ),
      th: (props: ComponentPropsWithoutRef<'th'>) => (
        <th 
          className="px-4 py-2 text-left text-sm font-medium text-lumi-primary border-b border-lumi-border/30"
          {...props}
        />
      ),
      td: (props: ComponentPropsWithoutRef<'td'>) => (
        <td 
          className="px-4 py-2 text-sm border-b border-lumi-border/20"
          {...props}
        />
      ),
      strong: (props: ComponentPropsWithoutRef<'strong'>) => (
        <strong className="font-semibold" {...props} />
      ),
      em: (props: ComponentPropsWithoutRef<'em'>) => (
        <em className="italic" {...props} />
      ),
      del: (props: ComponentPropsWithoutRef<'del'>) => (
        <del className="line-through text-lumi-secondary" {...props} />
      ),
    };

    return (
      <div className="markdown-content">
        <div className="prose dark:prose-invert prose-sm max-w-none">
          <ReactMarkdown
            rehypePlugins={[rehypeRaw]}
            remarkPlugins={[remarkGfm]}
            components={components}
          >
            {processedContent}
          </ReactMarkdown>
        </div>
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, type: 'spring', damping: 25, stiffness: 200 }}
      className={cn(
        'w-full px-2 sm:px-4 py-1.5 sm:py-2',
        isUser ? 'flex justify-end' : 'block'
      )}
    >
      {isUser ? (
        <div className="relative max-w-[90%] sm:max-w-[85%] lg:max-w-[75%] xl:max-w-[65%] rounded-2xl p-4 bg-lumi-accent text-white shadow-lg transition-all duration-200 ease-out">
          <p className="m-0 text-sm sm:text-[15px] leading-relaxed text-white break-words">
            {content}
          </p>
        </div>
      ) : (
        <div className="w-full max-w-4xl mx-auto px-1 sm:px-4">
          {/* Message Header */}
          {model && (
            <div className="flex items-center gap-2 mb-1.5 px-1 sm:px-0">
              <div className="w-5 h-5 rounded-full lumi-gradient flex items-center justify-center shadow-sm flex-shrink-0">
                <span className="text-white font-bold text-xs">L</span>
              </div>
              <span className="text-sm font-medium text-lumi-primary">{model.name}</span>
            </div>
          )}
          
          {/* Message Content */}
          <div className={cn(
            'prose prose-sm max-w-none dark:prose-invert',
            !model && 'pt-1' // Add padding if no header
          )}>
            <div className="space-y-3">
              <div className="min-h-[1.5em] w-full">
                {renderMarkdown()}
                {isTyping && (
                  <div className="flex items-center mt-1 space-x-1">
                    <div className="w-2 h-2 rounded-full bg-lumi-accent/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-lumi-accent/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-lumi-accent/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export const ChatMessage = memo(ChatMessageComponent);
