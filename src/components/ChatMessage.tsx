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
      // Clean up list formatting - remove extra newlines that cause spacing issues
      .replace(/(\n\s*[-*+]\s+)([^\n]+)/g, (match, bullet, text) => {
        return `\n${bullet}${text.trim()}`;
      })
      // Fix numbered lists - ensure they're on their own line but without extra spacing
      .replace(/(\n\s*\d+\.\s+)([^\n]+)/g, (match, number, text) => {
        return `\n${number}${text.trim()}`;
      });
  }, [content]);

  const renderMarkdown = () => {
    const components: Components = {
      code({ node, className, children, ...props }: { node?: any; className?: string; children?: React.ReactNode; [key: string]: any }) {
        const match = /language-(\w+)/.exec(className || '');
        const isInline = !className?.includes('language-');
        
        if (isInline) {
          return (
            <code 
              className="bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded text-sm font-mono break-words"
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
        // Check if the paragraph is part of a list item
        const isInList = node?.parentElement?.tagName?.toLowerCase() === 'li';
        return (
          <p className={`text-foreground leading-relaxed text-sm sm:text-[15px] ${isInList ? 'my-1' : 'my-3 first:mt-0 last:mb-0'}`} {...props}>
            {children}
          </p>
        );
      },
      ul: ({ node, children, ...props }: { node?: any; children?: React.ReactNode; [key: string]: any }) => (
        <ul className="list-disc list-outside space-y-1 my-3 pl-5" {...props}>
          {children}
        </ul>
      ),
      ol: ({ node, children, ...props }: { node?: any; children?: React.ReactNode; [key: string]: any }) => (
        <ol className="list-decimal list-outside space-y-1 my-3 pl-5" {...props}>
          {children}
        </ol>
      ),
      li: ({ node, children, ...props }: { node?: any; children?: React.ReactNode; [key: string]: any }) => (
        <li className="mb-1 pl-1" {...props}>
          <div className="-ml-1.5">{children}</div>
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
          className="border-l-4 border-gray-300 dark:border-black pl-4 py-1 my-3 text-gray-700 dark:text-white"
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
        <div className="my-4 overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-200 dark:border-black" {...props}>
            {children}
          </table>
        </div>
      ),
      thead: ({ node, children, ...props }: { node?: any; children?: React.ReactNode; [key: string]: any }) => (
        <thead className="bg-gray-100 dark:bg-black/80" {...props}>
          {children}
        </thead>
      ),
      tbody: ({ node, children, ...props }: { node?: any; children?: React.ReactNode; [key: string]: any }) => (
        <tbody className="divide-y divide-gray-200 dark:divide-black" {...props}>
          {children}
        </tbody>
      ),
      tr: ({ node, children, isHeader, ...props }: { node?: any; children?: React.ReactNode; isHeader?: boolean; [key: string]: any }) => (
        <tr className={`hover:bg-gray-50 dark:hover:bg-black/50 transition-colors ${isHeader ? 'font-semibold' : ''}`} {...props}>
          {children}
        </tr>
      ),
      th: ({ node, children, ...props }: { node?: any; children?: React.ReactNode; [key: string]: any }) => (
        <th className="border border-gray-200 dark:border-black px-4 py-2 text-left bg-gray-50 dark:bg-black font-medium" {...props}>
          {children}
        </th>
      ),
      td: ({ node, children, ...props }: { node?: any; children?: React.ReactNode; [key: string]: any }) => (
        <td className="border border-gray-200 dark:border-black px-4 py-2" {...props}>
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
        <del className="line-through text-gray-500 dark:text-white" {...props}>
          {children}
        </del>
      ),
    };

    return (
      <div className="markdown-content">
        <div className="prose prose-sm max-w-none dark:prose-invert prose-dark">
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
        isUser ? 'flex justify-center' : 'block'
      )}
    >
      {isUser ? (
        <div className="w-full max-w-4xl">
          <div className="flex justify-end">
            <div className="relative max-w-[90%] sm:max-w-[85%] lg:max-w-[80%] xl:max-w-[75%] rounded-2xl p-4 bg-blue-600 text-white shadow-lg transition-all duration-200 ease-out hover:shadow-md">
              <p className="m-0 text-sm sm:text-[15px] leading-relaxed text-white break-words">
                {content}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-4xl mx-auto px-1 sm:px-2">
          {/* Message Header */}
          {model && (
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-sm flex-shrink-0">
                <span className="text-white font-bold text-[10px] leading-none">AI</span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{model.name}</span>
            </div>
          )}
          
          {/* Message Content */}
          <div className={cn(
            'prose prose-sm max-w-none dark:prose-invert',
            !model && 'pt-1', // Add padding if no header
            'w-full' // Ensure full width for content
          )}>
            <div className="space-y-3">
              <div className="min-h-[1.5em] w-full break-words">
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
