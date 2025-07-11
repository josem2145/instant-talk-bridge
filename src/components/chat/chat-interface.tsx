import { useState, useRef, useEffect } from "react";
import { Send, ArrowLeft, MoreVertical, Phone, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { User } from "@/types/user";

interface Message {
  id: string;
  content: string;
  timestamp: Date;
  sender: "me" | "other";
}

interface ChatInterfaceProps {
  user: User;
  onBack: () => void;
}

// Mock messages for demonstration
const mockMessages: Message[] = [
  {
    id: "1",
    content: "Oi! Como você está?",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    sender: "other",
  },
  {
    id: "2",
    content: "Oi! Estou bem, obrigado! E você?",
    timestamp: new Date(Date.now() - 1000 * 60 * 25),
    sender: "me",
  },
  {
    id: "3",
    content: "Também estou bem! Você viu as novidades do projeto?",
    timestamp: new Date(Date.now() - 1000 * 60 * 20),
    sender: "other",
  },
  {
    id: "4",
    content: "Sim! Ficou muito bom. Parabéns pelo trabalho!",
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    sender: "me",
  },
];

export function ChatInterface({ user, onBack }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      timestamp: new Date(),
      sender: "me",
    };

    setMessages(prev => [...prev, message]);
    setNewMessage("");

    // Simulate typing indicator and response
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const response: Message = {
        id: (Date.now() + 1).toString(),
        content: "Obrigado pela mensagem! Esta é uma resposta automática.",
        timestamp: new Date(),
        sender: "other",
      };
      setMessages(prev => [...prev, response]);
    }, 2000);
  };

  const formatTime = (date: Date) => {
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
              {isTyping ? "digitando..." : user.status === "online" ? "online" : "offline"}
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
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`flex ${message.sender === "me" ? "justify-end" : "justify-start"} animate-slide-in`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow-message ${
                message.sender === "me"
                  ? "bg-gradient-chat text-white rounded-br-md"
                  : "bg-chat-bubble-received text-foreground rounded-bl-md"
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p className={`text-xs mt-1 ${
                message.sender === "me" ? "text-white/70" : "text-muted-foreground"
              }`}>
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start animate-bounce-in">
            <div className="bg-chat-bubble-received px-4 py-2 rounded-2xl rounded-bl-md shadow-message">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
              </div>
            </div>
          </div>
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