import { ChatMessage as ChatMessageType } from '@/lib/storage';
import { AVAILABLE_MODELS } from '@/lib/models';
import ReactMarkdown, { Components } from 'react-markdown';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { memo, useMemo, useCallback, ReactNode } from 'react';
import { CodeBlock } from '@/components/ui/CodeBlock';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

interface ChatMessageProps {
  message: ChatMessageType;
}

interface MarkdownComponentProps {
  node?: any;
  className?: string;
  children?: ReactNode;
  [key: string]: any;
}

// Memoized Markdown components to prevent unnecessary re-renders
const MarkdownComponents: Components = {
  code: memo(({ node, className, children, ...props }: MarkdownComponentProps) => {
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
  }),
  
  pre: memo(({ node, children, ...props }: MarkdownComponentProps) => (
    <div className="my-4" {...props}>
      {children}
    </div>
  )),
  
  p: memo(({ node, children, ...props }: MarkdownComponentProps) => {
    if (!children || (Array.isArray(children) && children.every(child => !child || child === '\n'))) {
      return null;
    }
    const isInList = node?.parentElement?.tagName?.toLowerCase() === 'li';
    return (
      <p className={`text-foreground leading-relaxed text-sm sm:text-[15px] ${isInList ? 'my-1' : 'my-3 first:mt-0 last:mb-0'}`} {...props}>
        {children}
      </p>
    );
  }),
  
  ul: memo(({ node, children, ...props }: MarkdownComponentProps) => (
    <ul className="list-disc list-outside space-y-1 my-3 pl-5" {...props}>
      {children}
    </ul>
  )),
  
  ol: memo(({ node, children, ...props }: MarkdownComponentProps) => (
    <ol className="list-decimal list-outside space-y-1 my-3 pl-5" {...props}>
      {children}
    </ol>
  )),
  
  li: memo(({ node, children, ...props }: MarkdownComponentProps) => (
    <li className="mb-1 pl-1" {...props}>
      <div className="-ml-1.5">{children}</div>
    </li>
  )),
  
  a: memo(({ node, href, children, ...props }: MarkdownComponentProps & { href?: string }) => {
    const safeHref = typeof href === 'string' ? href : '#';
    return (
      <a
        href={safeHref}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary-600 dark:text-primary-400 hover:underline break-words"
        {...props}
      >
        {children}
      </a>
    );
  }),
  
  blockquote: memo(({ node, children, ...props }: MarkdownComponentProps) => (
    <blockquote
      className="border-l-4 border-gray-300 dark:border-black pl-4 py-1 my-3 text-gray-700 dark:text-white"
      {...props}
    >
      {children}
    </blockquote>
  )),
  
  h1: memo(({ node, children, ...props }: MarkdownComponentProps) => (
    <h1 className="text-2xl font-bold my-4" {...props}>
      {children}
    </h1>
  )),
  
  h2: memo(({ node, children, ...props }: MarkdownComponentProps) => (
    <h2 className="text-xl font-bold my-3" {...props}>
      {children}
    </h2>
  )),
  
  h3: memo(({ node, children, ...props }: MarkdownComponentProps) => (
    <h3 className="text-lg font-semibold my-2" {...props}>
      {children}
    </h3>
  )),
  
  h4: memo(({ node, children, ...props }: MarkdownComponentProps) => (
    <h4 className="text-base font-medium my-2" {...props}>
      {children}
    </h4>
  )),
  
  hr: memo(() => <hr className="my-4 border-openmind-border/30" />),
  
  table: memo(({ node, children, ...props }: MarkdownComponentProps) => (
    <div className="my-6 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700" {...props}>
        {children}
      </table>
    </div>
  )),
  
  thead: memo(({ node, children, ...props }: MarkdownComponentProps) => (
    <thead className="bg-gray-100 dark:bg-gray-800/80" {...props}>
      {children}
    </thead>
  )),
  
  tbody: memo(({ node, children, ...props }: MarkdownComponentProps) => (
    <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900/50" {...props}>
      {children}
    </tbody>
  )),
  
  tr: memo(({ node, children, isHeader, ...props }: MarkdownComponentProps & { isHeader?: boolean }) => (
    <tr 
      className={`transition-colors ${isHeader ? 'font-semibold' : 'hover:bg-gray-50 dark:hover:bg-gray-800/30'}`} 
      {...props}
    >
      {children}
    </tr>
  )),
  
  th: memo(({ node, children, ...props }: MarkdownComponentProps) => (
    <th 
      className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700"
      {...props}
    >
      {children}
    </th>
  )),
  
  td: memo(({ node, children, ...props }: MarkdownComponentProps) => (
    <td 
      className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-800"
      {...props}
    >
      {children}
    </td>
  )),
  
  strong: memo(({ node, children, ...props }: MarkdownComponentProps) => (
    <strong className="font-semibold" {...props}>
      {children}
    </strong>
  )),
  
  em: memo(({ node, children, ...props }: MarkdownComponentProps) => (
    <em className="italic" {...props}>
      {children}
    </em>
  )),
  
  del: memo(({ node, children, ...props }: MarkdownComponentProps) => (
    <del className="line-through text-gray-500 dark:text-white" {...props}>
      {children}
    </del>
  ))
};

// Custom comparison function for memo
const areEqual = (prevProps: ChatMessageProps, nextProps: ChatMessageProps): boolean => {
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.content === nextProps.message.content &&
    prevProps.message.isStreaming === nextProps.message.isStreaming
  );
};

const ChatMessageComponent = ({ message }: ChatMessageProps): JSX.Element => {
  const isUser = message.role === 'user';
  const model = useMemo(() => 
    AVAILABLE_MODELS.find(m => m.id === message.modelId),
    [message.modelId]
  );
  const isTyping = message.isStreaming === true;
  const content = message.content || '';
  
  // Memoize the processed content to avoid recalculating on every render
  const processedContent = useMemo(() => {
    if (!content) return '';
    return content
      .replace(/```(\w*)\n([\s\S]*?)\n```/gs, (match, lang, code) => {
        return `\n\`\`\`${lang}\n${code.trim()}\n\`\`\`\n`;
      })
      .replace(/(\n\s*[-*+]\s+)([^\n]+)/g, (match, bullet, text) => {
        return `\n${bullet}${text.trim()}`;
      })
      .replace(/(\n\s*\d+\.\s+)([^\n]+)/g, (match, number, text) => {
        return `\n${number}${text.trim()}`;
      });
  }, [content]);

  // Memoize the markdown renderer
  const renderMarkdown = useCallback(() => (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      <ReactMarkdown
        components={MarkdownComponents}
        rehypePlugins={[rehypeRaw] as any}
        remarkPlugins={[remarkGfm] as any}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  ), [processedContent]);

  if (isUser) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, type: 'spring', damping: 25, stiffness: 200 }}
        className={cn(
          'w-full px-2 sm:px-4 py-1.5 sm:py-2 flex justify-center'
        )}
      >
        <div className="w-full max-w-4xl">
          <div className="flex justify-end">
            <div className="relative max-w-[90%] sm:max-w-[85%] lg:max-w-[80%] xl:max-w-[75%] rounded-2xl p-4 bg-blue-600 text-white shadow-lg transition-all duration-200 ease-out hover:shadow-md">
              <p className="m-0 text-sm sm:text-[15px] leading-relaxed text-white break-words">
                {content}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, type: 'spring', damping: 25, stiffness: 200 }}
      className={cn(
        'w-full px-2 sm:px-4 py-1.5 sm:py-2 block'
      )}
    >
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
          'w-full',
          !model && 'pt-1' // Add padding if no header
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
    </motion.div>
  );
}

export const ChatMessage = memo(ChatMessageComponent, areEqual);
