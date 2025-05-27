import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check, Sparkles } from 'lucide-react';
import { AVAILABLE_MODELS } from '@/lib/models';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  className?: string;
}

export const ModelSelector = ({
  selectedModel,
  onModelChange,
  className = '',
}: ModelSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Get the currently selected model data
  const selectedModelData = AVAILABLE_MODELS.find(m => m.id === selectedModel) || AVAILABLE_MODELS[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      const items = Array.from(
        document.querySelectorAll('[role="option"]')
      ) as HTMLElement[];
      
      const currentIndex = items.findIndex(item => 
        item.getAttribute('data-selected') === 'true'
      );

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          items[Math.min(currentIndex + 1, items.length - 1)]?.focus();
          break;
        case 'ArrowUp':
          e.preventDefault();
          items[Math.max(currentIndex - 1, 0)]?.focus();
          break;
        case 'Escape':
          setIsOpen(false);
          triggerRef.current?.focus();
          break;
        case 'Enter':
        case ' ':
          if (document.activeElement?.getAttribute('role') === 'option') {
            (document.activeElement as HTMLElement).click();
            e.preventDefault();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Ensure component is mounted before rendering to avoid hydration mismatches
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse ${className}`} />
    );
  }

  return (
    <div className={`relative w-full sm:w-[220px] ${className}`}>
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          group flex items-center justify-between w-full h-10 px-3 py-2
          rounded-lg border border-border/70 dark:border-border/70
          bg-transparent hover:bg-accent/10
          hover:border-primary/50 dark:hover:border-primary/50
          focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background
          transition-all duration-200 ease-out
          ${isOpen ? 'ring-2 ring-ring/50 ring-offset-2 ring-offset-background' : ''}
        `}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select model"
      >
        <div className="flex items-center min-w-0">
          <span className="text-sm font-medium text-primary truncate text-left">
            {selectedModelData.name}
          </span>
        </div>
        <ChevronDown 
          className={`
            h-4 w-4 text-primary/70 ml-2 flex-shrink-0
            transition-transform duration-200
            ${isOpen ? 'transform rotate-180' : ''}
          `} 
          aria-hidden="true"
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98, transition: { duration: 0.15 } }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`
              fixed sm:absolute left-4 right-4 sm:left-auto sm:right-auto sm:w-[280px] z-50 mt-1 py-1 shadow-lg
              bg-background dark:bg-gray-900 border rounded-lg border-border focus:outline-none
              ${isOpen ? 'block' : 'hidden'} overflow-hidden
              max-h-[70vh] overflow-y-auto
            `}
            role="listbox"
            aria-label="Available models"
          >
            <div className="py-1.5 text-xs font-medium text-muted-foreground/70 px-3 mb-1 sticky top-0 bg-background dark:bg-gray-900 z-10 border-b border-border">
              Select a model
            </div>
            {AVAILABLE_MODELS.map((model) => (
              <div
                key={model.id}
                role="option"
                tabIndex={0}
                data-selected={model.id === selectedModel}
                onClick={() => {
                  onModelChange(model.id);
                  setIsOpen(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onModelChange(model.id);
                    setIsOpen(false);
                  }
                }}
                className={`
                  relative flex items-center justify-between px-4 py-3 sm:px-3 sm:py-2.5 mx-1 rounded-md cursor-pointer
                  transition-colors duration-150 active:bg-accent/40
                  focus:outline-none focus:bg-accent/50 touch-target
                  ${model.id === selectedModel 
                    ? 'bg-accent/50 text-foreground' 
                    : 'text-muted-foreground hover:bg-accent/30'}
                `}
                aria-selected={model.id === selectedModel}
              >
                <div className="min-w-0 w-full">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-sm font-medium truncate">
                      {model.name}
                    </span>
                    {model.id.includes('latest') && (
                      <span className="ml-2 px-1.5 py-0.5 text-[10px] font-medium rounded bg-lumi-primary/10 text-lumi-primary">
                        New
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-lumi-secondary/60 dark:text-lumi-secondary/60 truncate">
                    {model.description}
                  </div>
                </div>
                {model.id === selectedModel && (
                  <Check className="h-4 w-4 text-lumi-primary flex-shrink-0 ml-2" />
                )}
                <div 
                  className="absolute inset-0 rounded-md ring-2 ring-offset-2 ring-lumi-primary/30 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-hidden="true"
                />
              </div>
            ))}

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
