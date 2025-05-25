
import { useState } from 'react';
import { Key, MessageSquarePlus, Moon, Sun, Settings } from 'lucide-react';
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
  const { toast } = useToast();

  const handleApiKeySave = () => {
    if (apiKey.trim()) {
      storageUtils.setApiKey(apiKey.trim());
      setIsApiKeyDialogOpen(false);
      toast({
        title: "API Key Saved",
        description: "Your OpenRouter API key has been saved securely in your browser.",
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
    <header className="border-b border-lumi-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg lumi-gradient flex items-center justify-center">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-lumi-primary">LUMI</h1>
              <p className="text-xs text-lumi-secondary">Learning & Understanding Machine Interface</p>
            </div>
          </div>

          {/* Model Selector */}
          <div className="flex-1 max-w-md mx-8">
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
            {selectedModelData && (
              <p className="text-xs text-lumi-secondary mt-1 text-center">
                {selectedModelData.guidance}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onNewChat}
              className="hover:bg-lumi-surface"
              title="New Chat"
            >
              <MessageSquarePlus className="h-5 w-5" />
            </Button>

            <Dialog open={isApiKeyDialogOpen} onOpenChange={setIsApiKeyDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-lumi-surface"
                  title="API Key Settings"
                >
                  <Key className="h-5 w-5" />
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
                    <p className="text-xs text-lumi-secondary mt-2">
                      Your API key is stored locally in your browser and never sent to our servers.
                    </p>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsApiKeyDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleApiKeySave}>
                      Save Key
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button
              variant="ghost"
              size="icon"
              onClick={onThemeToggle}
              className="hover:bg-lumi-surface"
              title="Toggle Theme"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
