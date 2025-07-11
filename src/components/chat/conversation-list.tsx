import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { User } from "@/types/user";
import { useConversations, ConversationWithUser } from "@/hooks/useConversations";
import { supabase } from "@/integrations/supabase/client";

interface ConversationListProps {
  onSelectConversation: (user: User) => void;
}

export function ConversationList({ onSelectConversation }: ConversationListProps) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { conversations, loading } = useConversations(currentUserId);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    getCurrentUser();
  }, []);
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      const minutes = Math.floor(diff / (1000 * 60));
      return minutes > 0 ? `${minutes}m` : "agora";
    }
  };

  const truncateMessage = (message: string, maxLength: number = 40) => {
    return message.length > maxLength 
      ? message.substring(0, maxLength) + "..."
      : message;
  };

  return (
    <div className="h-full flex flex-col bg-chat-sidebar">
      {/* Header */}
      <div className="p-6 border-b bg-white">
        <h1 className="text-2xl font-bold bg-gradient-chat bg-clip-text text-transparent">
          Minhas Conversas
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {conversations.length} conversas ativas
        </p>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Carregando conversas...</p>
          </div>
        ) : (
          conversations.map((conversation, index) => (
            <div
              key={conversation.id}
              onClick={() => onSelectConversation(conversation.otherUser)}
              className="p-4 border-b hover:bg-white/50 cursor-pointer transition-all duration-300 animate-slide-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="" alt={conversation.otherUser.display_name} />
                    <AvatarFallback className="bg-gradient-chat text-white font-semibold">
                      {getInitials(conversation.otherUser.display_name)}
                    </AvatarFallback>
                  </Avatar>
                  <StatusIndicator
                    status={conversation.otherUser.status}
                    size="md"
                    className="absolute -bottom-1 -right-1"
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground truncate">
                      {conversation.otherUser.display_name}
                    </h3>
                    {conversation.lastMessage && (
                      <span className="text-xs text-muted-foreground">
                        {formatTime(conversation.lastMessage.created_at)}
                      </span>
                    )}
                  </div>
                  
                  {conversation.lastMessage && (
                    <div className="flex items-center mt-1">
                      <span className={`text-sm mr-1 ${
                        conversation.lastMessage.sender_id === currentUserId 
                          ? "text-muted-foreground" 
                          : "text-foreground"
                      }`}>
                        {conversation.lastMessage.sender_id === currentUserId ? "Você: " : ""}
                      </span>
                      <p className="text-sm truncate text-muted-foreground">
                        {truncateMessage(conversation.lastMessage.content)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        
        {!loading && conversations.length === 0 && (
          <div className="text-center py-8">
            <div className="text-muted-foreground">
              Nenhuma conversa ainda
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Inicie uma nova conversa com outros usuários
            </p>
          </div>
        )}
      </div>
    </div>
  );
}