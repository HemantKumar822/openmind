import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import { useEffect, useState } from 'react';

export const ThemeToggle = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isDark = resolvedTheme === 'dark';

  // Ensure we only render on the client to avoid hydration mismatches
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 sm:h-9 sm:w-9"
        aria-label="Theme toggle"
        disabled
      />
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="group relative rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        <Sun 
          className={`h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 transition-all duration-300 ease-in-out ${
            !isDark ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-45 absolute'
          }`}
          aria-hidden="true"
        />
        <Moon 
          className={`h-4 w-4 sm:h-5 sm:w-5 text-blue-400 transition-all duration-300 ease-in-out ${
            isDark ? 'opacity-100 rotate-0' : 'opacity-0 rotate-45 absolute'
          }`}
          aria-hidden="true"
        />
      </div>
      <span className="sr-only">
        {isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      </span>
    </Button>
  );
};
