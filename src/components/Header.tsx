
import { useState } from 'react';
import { Key, MessageSquarePlus, Moon, Sun, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AVAILABLE_MODELS } from '@/lib/models';
import { storageUtils } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

interface HeaderProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  onNewChat: () => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}

export const Header = ({ selectedModel, onModelChange, onNewChat, theme, onThemeToggle }: HeaderProps) => {
  const [apiKey, setApiKey] = useState(storageUtils.getApiKey() || '');
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { toast } = useToast();

  const handleApiKeySave = () => {
    if (apiKey.trim()) {
      storageUtils.setApiKey(apiKey.trim());
      setIsApiKeyDialogOpen(false);
      toast({
        title: "API Key Saved",
        description: "Your OpenRouter API key has been saved.",
      });
    } else {
      toast({
        title: "Invalid API Key",
        description: "Please enter a valid OpenRouter API key.",
        variant: "destructive",
      });
    }
  };

  const selectedModelData = AVAILABLE_MODELS.find(m => m.id === selectedModel);

  return (
    <header className="border-b border-lumi-border bg-background/95 backdrop-blur sticky top-0 z-50">
      <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg lumi-gradient flex items-center justify-center">
              <span className="text-white font-bold text-xs sm:text-sm">L</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl font-bold text-lumi-primary">LUMI</h1>
            </div>
          </div>

          {/* Desktop Model Selector */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <Select value={selectedModel} onValueChange={onModelChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent className="z-50 bg-background border border-lumi-border">
                {AVAILABLE_MODELS.map((model) => (
                  <SelectItem key={model.id} value={model.id} className="cursor-pointer">
                    <div className="flex flex-col">
                      <span className="font-medium">{model.name}</span>
                      <span className="text-xs text-lumi-secondary">{model.guidance}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Desktop buttons */}
            <div className="hidden sm:flex items-center space-x-1 sm:space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={onNewChat}
                className="hover:bg-lumi-surface h-8 w-8 sm:h-9 sm:w-9"
                title="New Chat"
              >
                <MessageSquarePlus className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>

              <Dialog open={isApiKeyDialogOpen} onOpenChange={setIsApiKeyDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-lumi-surface h-8 w-8 sm:h-9 sm:w-9"
                    title="API Key"
                  >
                    <Key className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>OpenRouter API Key</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="apiKey">API Key</Label>
                      <Input
                        id="apiKey"
                        type="password"
                        placeholder="Enter your OpenRouter API key"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsApiKeyDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleApiKeySave}>
                        Save
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Button
                variant="ghost"
                size="icon"
                onClick={onThemeToggle}
                className="hover:bg-lumi-surface h-8 w-8 sm:h-9 sm:w-9"
                title="Toggle Theme"
              >
                {theme === 'light' ? <Moon className="h-4 w-4 sm:h-5 sm:w-5" /> : <Sun className="h-4 w-4 sm:h-5 sm:w-5" />}
              </Button>
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="sm:hidden hover:bg-lumi-surface h-8 w-8"
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu with improved design */}
        {isMobileMenuOpen && (
          <div className="sm:hidden mt-4 pt-4 border-t border-lumi-border/30 animate-fade-in">
            <div className="space-y-4 bg-white dark:bg-lumi-surface rounded-xl p-4 shadow-lg border border-lumi-border/20">
              {/* Mobile Model Selector */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-lumi-primary">Select Model</Label>
                <Select value={selectedModel} onValueChange={onModelChange}>
                  <SelectTrigger className="w-full bg-background border border-lumi-border/50 rounded-lg">
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-background border border-lumi-border">
                    {AVAILABLE_MODELS.map((model) => (
                      <SelectItem key={model.id} value={model.id} className="cursor-pointer">
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{model.name}</span>
                          <span className="text-xs text-lumi-secondary">{model.guidance}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Mobile action buttons with improved layout */}
              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { onNewChat(); setIsMobileMenuOpen(false); }}
                  className="flex flex-col items-center gap-1 h-auto py-3 border-lumi-border/50 hover:bg-lumi-surface"
                >
                  <MessageSquarePlus className="h-4 w-4" />
                  <span className="text-xs">New Chat</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setIsApiKeyDialogOpen(true); setIsMobileMenuOpen(false); }}
                  className="flex flex-col items-center gap-1 h-auto py-3 border-lumi-border/50 hover:bg-lumi-surface"
                >
                  <Key className="h-4 w-4" />
                  <span className="text-xs">API Key</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { onThemeToggle(); setIsMobileMenuOpen(false); }}
                  className="flex flex-col items-center gap-1 h-auto py-3 border-lumi-border/50 hover:bg-lumi-surface"
                >
                  {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                  <span className="text-xs">Theme</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
