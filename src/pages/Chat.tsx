import { useState } from "react";
import { UserList } from "@/components/chat/user-list";
import { ChatInterface } from "@/components/chat/chat-interface";
import { ConversationList } from "@/components/chat/conversation-list";
import { Button } from "@/components/ui/button";
import { Users, MessageSquare, LogOut } from "lucide-react";
import { User, Conversation } from "@/types/user";

type View = "users" | "conversations" | "chat";

interface ChatPageProps {
  onLogout: () => void;
}

export default function ChatPage({ onLogout }: ChatPageProps) {
  const [currentView, setCurrentView] = useState<View>("users");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isMobile] = useState(window.innerWidth < 1024);

  const handleStartChat = (user: User) => {
    setSelectedUser(user);
    setCurrentView("chat");
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedUser(conversation.user);
    setCurrentView("chat");
  };

  const handleBackToList = () => {
    setCurrentView("users");
    setSelectedUser(null);
  };

  const renderMobileView = () => {
    if (currentView === "chat" && selectedUser) {
      return <ChatInterface user={selectedUser} onBack={handleBackToList} />;
    }

    return (
      <div className="h-full flex flex-col">
        {/* Mobile Header */}
        <div className="p-4 bg-white border-b shadow-sm">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold bg-gradient-chat bg-clip-text text-transparent">
              Chat App
            </h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="text-muted-foreground"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Mobile Navigation */}
          <div className="flex mt-4 bg-muted rounded-lg p-1">
            <Button
              variant={currentView === "users" ? "default" : "ghost"}
              size="sm"
              onClick={() => setCurrentView("users")}
              className={`flex-1 ${
                currentView === "users" 
                  ? "bg-gradient-chat text-white shadow-message" 
                  : "text-muted-foreground"
              }`}
            >
              <Users className="w-4 h-4 mr-2" />
              Usuários
            </Button>
            <Button
              variant={currentView === "conversations" ? "default" : "ghost"}
              size="sm"
              onClick={() => setCurrentView("conversations")}
              className={`flex-1 ${
                currentView === "conversations" 
                  ? "bg-gradient-chat text-white shadow-message" 
                  : "text-muted-foreground"
              }`}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Conversas
            </Button>
          </div>
        </div>

        {/* Mobile Content */}
        <div className="flex-1">
          {currentView === "users" && (
            <UserList onStartChat={handleStartChat} />
          )}
          {currentView === "conversations" && (
            <ConversationList onSelectConversation={handleSelectConversation} />
          )}
        </div>
      </div>
    );
  };

  const renderDesktopView = () => {
    return (
      <div className="h-full flex">
        {/* Desktop Sidebar */}
        <div className="w-80 border-r bg-chat-sidebar flex flex-col">
          {/* Desktop Header */}
          <div className="p-6 bg-white border-b">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold bg-gradient-chat bg-clip-text text-transparent">
                Chat App
              </h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="text-muted-foreground"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="p-4 bg-white border-b">
            <div className="flex bg-muted rounded-lg p-1">
              <Button
                variant={currentView === "users" ? "default" : "ghost"}
                size="sm"
                onClick={() => setCurrentView("users")}
                className={`flex-1 ${
                  currentView === "users" 
                    ? "bg-gradient-chat text-white shadow-message" 
                    : "text-muted-foreground"
                }`}
              >
                <Users className="w-4 h-4 mr-2" />
                Usuários
              </Button>
              <Button
                variant={currentView === "conversations" ? "default" : "ghost"}
                size="sm"
                onClick={() => setCurrentView("conversations")}
                className={`flex-1 ${
                  currentView === "conversations" 
                    ? "bg-gradient-chat text-white shadow-message" 
                    : "text-muted-foreground"
                }`}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Conversas
              </Button>
            </div>
          </div>

          {/* Desktop Content */}
          <div className="flex-1">
            {currentView === "users" && (
              <UserList onStartChat={handleStartChat} />
            )}
            {currentView === "conversations" && (
              <ConversationList onSelectConversation={handleSelectConversation} />
            )}
          </div>
        </div>

        {/* Desktop Chat Area */}
        <div className="flex-1">
          {selectedUser ? (
            <ChatInterface user={selectedUser} onBack={handleBackToList} />
          ) : (
            <div className="h-full flex items-center justify-center bg-gradient-subtle">
              <div className="text-center">
                <div className="p-4 bg-gradient-chat rounded-full inline-block mb-4 shadow-glow">
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Selecione uma conversa
                </h2>
                <p className="text-muted-foreground">
                  Escolha um usuário ou conversa para começar
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen">
      {isMobile ? renderMobileView() : renderDesktopView()}
    </div>
  );
}