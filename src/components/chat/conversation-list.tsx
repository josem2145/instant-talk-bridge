import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusIndicator } from "@/components/ui/status-indicator";

interface Conversation {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    status: "online" | "away" | "busy" | "offline";
    avatar?: string;
  };
  lastMessage: {
    content: string;
    timestamp: Date;
    sender: "me" | "other";
  };
  unreadCount?: number;
}

interface ConversationListProps {
  onSelectConversation: (conversation: Conversation) => void;
}

// Mock conversations for demonstration
const mockConversations: Conversation[] = [
  {
    id: "1",
    user: {
      id: "1",
      name: "Ana Silva",
      email: "ana@email.com",
      status: "online",
    },
    lastMessage: {
      content: "Oi! Como você está?",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      sender: "other",
    },
    unreadCount: 2,
  },
  {
    id: "2",
    user: {
      id: "2",
      name: "Carlos Santos",
      email: "carlos@email.com",
      status: "away",
    },
    lastMessage: {
      content: "Obrigado pela ajuda!",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      sender: "me",
    },
  },
  {
    id: "3",
    user: {
      id: "3",
      name: "Maria Oliveira",
      email: "maria@email.com",
      status: "online",
    },
    lastMessage: {
      content: "Vamos marcar a reunião para amanhã?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
      sender: "other",
    },
    unreadCount: 1,
  },
];

export function ConversationList({ onSelectConversation }: ConversationListProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatTime = (date: Date) => {
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
          {mockConversations.length} conversas ativas
        </p>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {mockConversations.map((conversation, index) => (
          <div
            key={conversation.id}
            onClick={() => onSelectConversation(conversation)}
            className="p-4 border-b hover:bg-white/50 cursor-pointer transition-all duration-300 animate-slide-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={conversation.user.avatar} alt={conversation.user.name} />
                  <AvatarFallback className="bg-gradient-chat text-white font-semibold">
                    {getInitials(conversation.user.name)}
                  </AvatarFallback>
                </Avatar>
                <StatusIndicator
                  status={conversation.user.status}
                  size="md"
                  className="absolute -bottom-1 -right-1"
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground truncate">
                    {conversation.user.name}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-muted-foreground">
                      {formatTime(conversation.lastMessage.timestamp)}
                    </span>
                    {conversation.unreadCount && (
                      <div className="bg-gradient-chat text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center animate-bounce-in">
                        {conversation.unreadCount}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center mt-1">
                  <span className={`text-sm mr-1 ${
                    conversation.lastMessage.sender === "me" 
                      ? "text-muted-foreground" 
                      : "text-foreground"
                  }`}>
                    {conversation.lastMessage.sender === "me" ? "Você: " : ""}
                  </span>
                  <p className={`text-sm truncate ${
                    conversation.unreadCount 
                      ? "text-foreground font-medium" 
                      : "text-muted-foreground"
                  }`}>
                    {truncateMessage(conversation.lastMessage.content)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {mockConversations.length === 0 && (
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