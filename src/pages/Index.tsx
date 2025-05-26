
import { Header } from '@/components/Header';
import { ChatMessage } from '@/components/ChatMessage';
import { ChatInput } from '@/components/ChatInput';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { useThemeManager } from '@/hooks/useThemeManager';
import { useChatSession } from '@/hooks/useChatSession';

const Index = () => {
  const { theme, handleThemeToggle } = useThemeManager();
  const {
    currentChat,
    currentConversationId,
    selectedModel,
    isLoading,
    sendMessage,
    startNewChat,
    selectModel,
    loadChatSession,
    chatContainerRef
  } = useChatSession();
  
  const hasMessages = currentChat?.messages?.length > 0 || false;
  const showWelcomeScreen = !currentChat || currentChat.messages.length === 0;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-lumi-surface/30 w-full">
      <Header
        selectedModel={selectedModel}
        onModelChange={handleModelChange}
        onNewChat={handleNewChat}
        theme={theme}
        onThemeToggle={handleThemeToggle}
        currentConversationId={currentConversationId}
        onConversationChange={handleConversationChange}
      />
      
      {/* Chat area with fixed height and scrolling */}
      <main className="flex-1 flex flex-col min-h-0 w-full">
        {showWelcomeScreen ? (
          <WelcomeScreen />
        ) : (
          <div
            ref={chatContainerRef}
            className="flex-1 w-full overflow-y-auto scrollbar-thin scrollbar-thumb-lumi-border/30 scrollbar-track-transparent hover:scrollbar-thumb-lumi-border/50"
            style={{
              height: 'calc(100vh - 4rem - 4.5rem)', // Account for header and input heights
              scrollBehavior: 'smooth',
              scrollPadding: '1rem',
              WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
            }}
          >
            <div className="container mx-auto max-w-4xl px-2 sm:px-4 py-4 w-full">
              <div className="space-y-2 sm:space-y-3 w-full">
                {currentChat?.messages.map((message) => (
                  <div key={message.id} className="w-full">
                    <ChatMessage message={message} />
                  </div>
                ))}
              </div>
              
              {/* Empty space at the bottom to prevent content from being hidden behind the input */}
              <div className="h-24 sm:h-20 w-full" />
            </div>
          </div>
        )}
      </main>

      {/* Fixed chat input at bottom */}
      <div className="sticky bottom-0 z-10">
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={isLoading}
          placeholder={hasMessages ? "Continue the conversation..." : "Start your conversation with Lyra..."}
        />
      </div>
    </div>
  );
};

export default Index;
