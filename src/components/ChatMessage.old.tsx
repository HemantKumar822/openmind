import { ChatMessage as ChatMessageType } from '@/lib/storage';
import { AVAILABLE_MODELS } from '@/lib/models';
import ReactMarkdown, { Components } from 'react-markdown';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { memo, useMemo, useState } from 'react';
import { CodeBlock } from '@/components/ui/CodeBlock';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { ComponentPropsWithoutRef } from 'react';
import { MessageThread } from './MessageThread';
import { useChatContext } from '@/providers/ChatProvider';

interface ChatMessageProps {
  message: ChatMessageType;
  onReply?: (messageId: string) => void;
  className?: string;
}

function ChatMessageComponent({ message, onReply, className }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const model = AVAILABLE_MODELS.find(m => m.id === message.modelId);
  const isTyping = message.isStreaming === true;
  const content = message.content || '';

  const processedContent = useMemo(() => {
    // Pre-process content to ensure proper markdown formatting
    return content
      // Ensure code blocks have proper newlines
      .replace(/```(\w*)\n([\s\S]*?)\n```/g, (match, lang, code) => {
        return `\n\`\`\`${lang}\n${code.trim()}\n\`\`\`\n`;
      })
      // Ensure lists have proper spacing
      .replace(/(\n\s*[-*+]\s+[^\n]+)/g, '\n$1\n')
      // Fix numbered lists
      .replace(/(\n\s*\d+\.\s+[^\n]+)/g, '\n$1\n');
  }, [content]);

  const renderMarkdown = () => {
    const components: Components = {
      code({ node, className, children, ...props }: { node?: any; className?: string; children?: React.ReactNode; [key: string]: any }) {
        const match = /language-(\w+)/.exec(className || '');
        const isInline = !className?.includes('language-');
        
        if (isInline) {
          return (
            <code 
              className="bg-lumi-accent/10 text-lumi-accent px-1.5 py-0.5 rounded text-sm font-mono break-words"
              {...props}
            >
              {children}
            </code>
          );
        }

        const language = match?.[1] || 'text';
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
      pre: ({ node, children, ...props }: { node?: any; children?: React.ReactNode; [key: string]: any }) => (
        <div className="my-4" {...props}>
          {children}
        </div>
      ),
      p: ({ node, children, ...props }: { node?: any; children?: React.ReactNode; [key: string]: any }) => {
        // Skip rendering empty paragraphs
        if (!children || (Array.isArray(children) && children.every(child => !child || child === '\n'))) {
          return null;
        }
        return (
          <p className="text-foreground leading-relaxed text-sm sm:text-[15px] my-3 first:mt-0 last:mb-0" {...props}>
            {children}
          </p>
        );
      },
      ul: ({ node, children, ...props }: { node?: any; children?: React.ReactNode; [key: string]: any }) => (
        <ul className="list-disc list-inside space-y-1 my-3 pl-5" {...props}>
          {children}
        </ul>
      ),
      ol: ({ node, children, ...props }: { node?: any; children?: React.ReactNode; [key: string]: any }) => (
        <ol className="list-decimal list-inside space-y-1 my-3 pl-5" {...props}>
          {children}
        </ol>
      ),
      li: ({ node, children, ...props }: { node?: any; children?: React.ReactNode; [key: string]: any }) => (
        <li className="pl-1 -ml-1" {...props}>
          <span className="-ml-1.5">{children}</span>
        </li>
      ),
      a: ({ node, ...props }: { node?: any; children?: React.ReactNode; [key: string]: any }) => {
        // Ensure href exists and is a string
        const href = typeof props.href === 'string' ? props.href : '#';
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lumi-accent hover:underline break-words"
            {...props}
          >
            {props.children}
          </a>
        );
      },
      blockquote: ({ node, children, ...props }: { node?: any; children?: React.ReactNode; [key: string]: any }) => (
        <blockquote
          className="border-l-4 border-lumi-accent/30 pl-4 py-1 my-3 text-lumi-secondary"
          {...props}
        >
          {children}
        </blockquote>
      ),
      h1: ({ node, children, ...props }: { node?: any; children?: React.ReactNode; [key: string]: any }) => (
        <h1 className="text-2xl font-bold my-4" {...props}>
          {children}
        </h1>
      ),
      h2: ({ node, children, ...props }: { node?: any; children?: React.ReactNode; [key: string]: any }) => (
        <h2 className="text-xl font-bold my-3" {...props}>
          {children}
        </h2>
      ),
      h3: ({ node, children, ...props }: { node?: any; children?: React.ReactNode; [key: string]: any }) => (
        <h3 className="text-lg font-semibold my-2" {...props}>
          {children}
        </h3>
      ),
      h4: ({ node, children, ...props }: { node?: any; children?: React.ReactNode; [key: string]: any }) => (
        <h4 className="text-base font-medium my-2" {...props}>
          {children}
        </h4>
      ),
      hr: () => <hr className="my-4 border-lumi-border/30" />,
      table: ({ node, children, ...props }: { node?: any; children?: React.ReactNode; [key: string]: any }) => (
        <div className="overflow-x-auto my-4" {...props}>
          <table className="min-w-full border-collapse border border-lumi-border/30">
            {children}
          </table>
        </div>
      ),
      thead: ({ node, children, ...props }: { node?: any; children?: React.ReactNode; [key: string]: any }) => (
        <thead className="bg-lumi-surface/50 dark:bg-lumi-surface/80" {...props}>
          {children}
        </thead>
      ),
      tbody: ({ node, children, ...props }: { node?: any; children?: React.ReactNode; [key: string]: any }) => (
        <tbody className="divide-y divide-lumi-border/30" {...props}>
          {children}
        </tbody>
      ),
      tr: ({ node, children, isHeader, ...props }: { node?: any; children?: React.ReactNode; isHeader?: boolean; [key: string]: any }) => (
        <tr className={`hover:bg-lumi-surface/30 transition-colors ${isHeader ? 'font-semibold' : ''}`} {...props}>
          {children}
        </tr>
      ),
      th: ({ node, children, ...props }: { node?: any; children?: React.ReactNode; [key: string]: any }) => (
        <th 
          className="px-4 py-2 text-left text-sm font-medium text-lumi-primary border-b border-lumi-border/30"
          {...props}
        >
          {children}
        </th>
      ),
      td: ({ node, children, ...props }: { node?: any; children?: React.ReactNode; [key: string]: any }) => (
        <td 
          className="px-4 py-2 text-sm border-b border-lumi-border/20"
          {...props}
        >
          {children}
        </td>
      ),
      strong: ({ node, children, ...props }: { node?: any; children?: React.ReactNode; [key: string]: any }) => (
        <strong className="font-semibold" {...props}>
          {children}
        </strong>
      ),
      em: ({ node, children, ...props }: { node?: any; children?: React.ReactNode; [key: string]: any }) => (
        <em className="italic" {...props}>
          {children}
        </em>
      ),
      del: ({ node, children, ...props }: { node?: any; children?: React.ReactNode; [key: string]: any }) => (
        <del className="line-through text-lumi-secondary" {...props}>
          {children}
        </del>
      ),
    };

    return (
      <div className={cn('markdown-content', className)}>
        <div className="prose prose-sm dark:prose-invert max-w-none">
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

  const { activeSession, replyToMessage } = useChatContext();
  
  const handleReply = () => {
    if (activeSession) {
      replyToMessage(activeSession.id, message.id);
    }
  };

  const renderContent = () => {
    return (
      <motion.div
        className={cn(
          'group flex flex-col space-y-2 relative',
          isUser ? 'items-end' : 'items-start',
          className
        )}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {renderMarkdown()}
        
        {message.children?.length > 0 && (
          <MessageThread 
            messageIds={message.children}
            onReply={onReply}
            className="mt-2"
          />
        )}
      </motion.div>
    );
  };

  return (
    <div className={cn(
      'w-full px-2 sm:px-4 py-2',
      isUser ? 'flex justify-end' : 'block'
    )}>
      <div className={cn(
        'w-full',
        isUser ? 'flex justify-end' : 'max-w-4xl mx-auto'
      )}>
        <div className={cn(
          'w-full',
          isUser ? 'max-w-[90%] sm:max-w-[85%] lg:max-w-[75%] xl:max-w-[65%]' : ''
        )}>
          <MessageThread 
            message={message} 
            messages={activeSession?.messages || []} 
            activeSessionId={activeSession?.id || ''}
            onReply={handleReply}
          />
        </div>
      </div>
    </motion.div>
  );
}

export const ChatMessage = memo(ChatMessageComponent);
