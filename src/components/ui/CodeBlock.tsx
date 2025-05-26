import { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { copyToClipboard, getLanguageName } from '@/lib/clipboard';

interface CodeBlockProps {
  language: string;
  value: string;
  className?: string;
  showLineNumbers?: boolean;
  wrapLines?: boolean;
}

export function CodeBlock({
  language,
  value,
  className,
  showLineNumbers: initialShowLineNumbers,
  wrapLines = false,
}: CodeBlockProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(initialShowLineNumbers);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const languageName = getLanguageName(language);
  const lineCount = value.split('\n').length;
  const shouldShowLineNumbers = showLineNumbers ?? (lineCount > 2);
  
  // Effect to handle dark mode changes
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    // Initial check
    checkDarkMode();
    
    // Watch for changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { 
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  const handleCopy = async () => {
    const success = await copyToClipboard(value);
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const toggleLineNumbers = () => {
    setShowLineNumbers(!showLineNumbers);
  };


  
  return (
    <div className={cn('rounded-lg overflow-hidden border border-gray-200 dark:border-lumi-border/30', className)} data-theme={isDarkMode ? 'dark' : 'light'}>
      <div className="bg-gray-100 dark:bg-lumi-surface/90 px-4 py-2 text-xs text-gray-600 dark:text-lumi-secondary border-b border-gray-200 dark:border-lumi-border/20 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="font-mono text-xs font-medium text-gray-700 dark:text-lumi-secondary">{languageName}</span>
          {lineCount > 1 && (
            <button
              onClick={toggleLineNumbers}
              className="text-xs text-gray-500 hover:text-gray-700 dark:opacity-50 dark:hover:opacity-100 transition-opacity"
              title={shouldShowLineNumbers ? 'Hide line numbers' : 'Show line numbers'}
            >
              {shouldShowLineNumbers ? 'Hide #' : 'Show #'}
            </button>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-1.5 text-xs text-gray-700 hover:text-gray-900 dark:text-lumi-secondary dark:hover:text-lumi-accent bg-white/80 hover:bg-white dark:bg-transparent px-2.5 py-1 rounded-md transition-colors border border-gray-200 dark:border-transparent"
          disabled={isCopied}
          aria-label={isCopied ? 'Copied!' : 'Copy code'}
        >
          {isCopied ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-600 dark:text-lumi-accent" />
              <span className="text-green-600 dark:text-lumi-accent">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="relative">
        <div className="overflow-x-auto">
          <div className={!isDarkMode ? 'block' : 'hidden'}>
            <SyntaxHighlighter
              style={oneDark}
              language={language}
              PreTag="div"
              showLineNumbers={shouldShowLineNumbers}
              wrapLines={wrapLines}
              customStyle={{
                margin: 0,
                padding: '1rem',
                background: 'white',
                color: '#374151',
                fontSize: '0.875rem',
                lineHeight: '1.5',
                borderRadius: '0 0 0.5rem 0.5rem',
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)'
              }}
              codeTagProps={{
                style: {
                  fontFamily: 'var(--font-mono)',
                  color: '#374151',
                  backgroundColor: 'transparent',
                  fontSize: 'inherit',
                  lineHeight: 'inherit'
                }
              }}
              lineNumberStyle={{
                color: '#9CA3AF',
                opacity: 0.8,
                minWidth: '2.25em',
                paddingRight: '1em',
                textAlign: 'right',
                userSelect: 'none',
                position: 'sticky',
                left: 0,
                fontFamily: 'var(--font-mono)',
                backgroundColor: 'white',
                borderRight: '1px solid #E5E7EB',
                fontSize: '0.875em',
                lineHeight: '1.5'
              }}
              wrapLongLines={false}
            >
              {value}
            </SyntaxHighlighter>
          </div>
          <div className={isDarkMode ? 'block' : 'hidden'}>
            <SyntaxHighlighter
              style={oneDark}
              language={language}
              PreTag="div"
              showLineNumbers={shouldShowLineNumbers}
              wrapLines={wrapLines}
              customStyle={{
                margin: 0,
                padding: '1rem',
                background: 'hsl(222.2, 84%, 4.9%)',
                color: 'hsl(0, 0%, 90%)',
                fontSize: '0.875rem',
                lineHeight: '1.5',
                borderRadius: '0 0 0.5rem 0.5rem',
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)'
              }}
              codeTagProps={{
                style: {
                  fontFamily: 'var(--font-mono)',
                  color: 'hsl(0, 0%, 90%)',
                  backgroundColor: 'transparent',
                  fontSize: 'inherit',
                  lineHeight: 'inherit'
                }
              }}
              lineNumberStyle={{
                color: 'hsl(0, 0%, 60%)',
                opacity: 0.8,
                minWidth: '2.25em',
                paddingRight: '1em',
                textAlign: 'right',
                userSelect: 'none',
                position: 'sticky',
                left: 0,
                fontFamily: 'var(--font-mono)',
                backgroundColor: 'hsl(222.2, 84%, 4.9%)',
                borderRight: '1px solid hsl(0, 0%, 20%)',
                fontSize: '0.875em',
                lineHeight: '1.5'
              }}
              wrapLongLines={false}
            >
              {value}
            </SyntaxHighlighter>
          </div>
        </div>
      </div>
    </div>
  );
}
