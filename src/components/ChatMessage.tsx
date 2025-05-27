import { ChatMessage as ChatMessageType } from '@/lib/storage';
import { AVAILABLE_MODELS } from '@/lib/models';
import ReactMarkdown, { Components } from 'react-markdown';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { memo, useMemo } from 'react';
import { CodeBlock } from '@/components/ui/CodeBlock';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

interface ChatMessageProps {
  message: ChatMessageType;
}

function ChatMessageComponent({ message }: ChatMessageProps) {
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
              className="bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 px-1.5 py-0.5 rounded text-sm font-mono break-words"
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
            className="text-primary-600 dark:text-primary-400 hover:underline break-words"
            {...props}
          >
            {props.children}
          </a>
        );
      },
      blockquote: ({ node, children, ...props }: { node?: any; children?: React.ReactNode; [key: string]: any }) => (
        <blockquote
          className="border-l-4 border-primary-300 dark:border-primary-600 pl-4 py-1 my-3 text-gray-600 dark:text-gray-300"
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
          <table className="min-w-full border-collapse border border-gray-200 dark:border-gray-700">
            {children}
          </table>
        </div>
      ),
      thead: ({ node, children, ...props }: { node?: any; children?: React.ReactNode; [key: string]: any }) => (
        <thead className="bg-gray-100 dark:bg-gray-800/80" {...props}>
          {children}
        </thead>
      ),
      tbody: ({ node, children, ...props }: { node?: any; children?: React.ReactNode; [key: string]: any }) => (
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700" {...props}>
          {children}
        </tbody>
      ),
      tr: ({ node, children, isHeader, ...props }: { node?: any; children?: React.ReactNode; isHeader?: boolean; [key: string]: any }) => (
        <tr className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${isHeader ? 'font-semibold' : ''}`} {...props}>
          {children}
        </tr>
      ),
      th: ({ node, children, ...props }: { node?: any; children?: React.ReactNode; [key: string]: any }) => (
        <th 
          className="px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700"
          {...props}
        >
          {children}
        </th>
      ),
      td: ({ node, children, ...props }: { node?: any; children?: React.ReactNode; [key: string]: any }) => (
        <td 
          className="px-4 py-2 text-sm border-b border-gray-200 dark:border-gray-700"
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
        <del className="line-through text-gray-500 dark:text-gray-400" {...props}>
          {children}
        </del>
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
        <div className="relative max-w-[90%] sm:max-w-[85%] lg:max-w-[75%] xl:max-w-[65%] rounded-2xl p-4 bg-primary-600 text-white shadow-lg transition-all duration-200 ease-out">
          <p className="m-0 text-sm sm:text-[15px] leading-relaxed text-white break-words">
            {content}
          </p>
        </div>
      ) : (
        <div className="w-full max-w-4xl mx-auto pl-0.5 pr-1 sm:px-4">
          {/* Message Header */}
          {model && (
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-sm flex-shrink-0">
                <span className="text-white font-bold text-xs">L</span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{model.name}</span>
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
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
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
