import { useState, useRef, useEffect } from "react";
import { Send, ArrowLeft, MoreVertical, Phone, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { User } from "@/types/user";
import { useRealTimeMessages } from "@/hooks/useRealTimeMessages";
import { useConversations } from "@/hooks/useConversations";
import { supabase } from "@/integrations/supabase/client";

interface ChatInterfaceProps {
  user: User;
  onBack: () => void;
}

export function ChatInterface({ user, onBack }: ChatInterfaceProps) {
  const [newMessage, setNewMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { getOrCreateConversation } = useConversations(currentUserId);
  const { messages, loading, sendMessage } = useRealTimeMessages({ 
    conversationId, 
    currentUserId 
  });

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        setCurrentUserId(authUser.id);
      }
    };
    getCurrentUser();
  }, []);

  // Get or create conversation when user changes
  useEffect(() => {
    const initConversation = async () => {
      if (currentUserId && user.user_id) {
        const convId = await getOrCreateConversation(user.user_id);
        setConversationId(convId);
      }
    };
    initConversation();
  }, [currentUserId, user.user_id, getOrCreateConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await sendMessage(newMessage);
      setNewMessage("");
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white shadow-sm">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="lg:hidden"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage src="" alt={user.display_name} />
              <AvatarFallback className="bg-gradient-chat text-white font-semibold text-sm">
                {getInitials(user.display_name)}
              </AvatarFallback>
            </Avatar>
            <StatusIndicator
              status={user.status}
              size="sm"
              className="absolute -bottom-0.5 -right-0.5"
            />
          </div>
          
          <div>
            <h2 className="font-semibold text-foreground">
              Conversando com {user.display_name}
            </h2>
            <p className="text-sm text-muted-foreground">
              {user.status === "online" ? "online" : "offline"}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="sm">
            <Phone className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Video className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-subtle">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Carregando mensagens...</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex ${message.sender_id === currentUserId ? "justify-end" : "justify-start"} animate-slide-in`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow-message ${
                  message.sender_id === currentUserId
                    ? "bg-gradient-chat text-white rounded-br-md"
                    : "bg-chat-bubble-received text-foreground rounded-bl-md"
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.sender_id === currentUserId ? "text-white/70" : "text-muted-foreground"
                }`}>
                  {formatTime(message.created_at)}
                </p>
              </div>
            </div>
          ))
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t bg-white">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1 bg-chat-input border-0 shadow-sm focus:shadow-message transition-all duration-300"
          />
          <Button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-gradient-chat hover:opacity-90 transition-all duration-300 shadow-message px-4"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}