import { useState, useEffect } from "react";
import { Search, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types/user";

interface UserListProps {
  onStartChat: (user: User) => void;
}


export function UserList({ onStartChat }: UserListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
    
    // Set up real-time subscription for user status updates
    const channel = supabase
      .channel('profiles-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          loadUsers(); // Reload users when any profile is updated
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadUsers = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading users:', error);
        return;
      }

      // Cast status to the correct type and force all users to show as online
      const typedProfiles = profiles?.map(profile => ({
        ...profile,
        status: "online" as "online" | "away" | "busy" | "offline"
      })) || [];
      
      setUsers(typedProfiles);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const filteredUsers = users.filter(user =>
    user.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getStatusText = (user: User) => {
    switch (user.status) {
      case "online": return "Online";
      case "away": return "Ausente";
      case "busy": return "Ocupado";
      case "offline": return user.last_seen || "Offline";
      default: return "Offline";
    }
  };

  return (
    <div className="h-full flex flex-col bg-chat-sidebar">
      {/* Header */}
      <div className="p-6 border-b bg-white">
        <h1 className="text-2xl font-bold mb-4 bg-gradient-chat bg-clip-text text-transparent">
          Usuários Ativos
        </h1>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-chat-input border-0 shadow-sm focus:shadow-message transition-all duration-300"
          />
        </div>
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Carregando usuários...</p>
          </div>
        ) : filteredUsers.map((user, index) => (
          <div
            key={user.id}
            className="bg-white rounded-lg p-4 shadow-sm hover:shadow-message transition-all duration-300 animate-slide-in border border-gray-100"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="" alt={user.display_name} />
                    <AvatarFallback className="bg-gradient-chat text-white font-semibold">
                      {getInitials(user.display_name)}
                    </AvatarFallback>
                  </Avatar>
                  <StatusIndicator
                    status={user.status}
                    size="md"
                    className="absolute -bottom-1 -right-1"
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">
                    {user.display_name}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {getStatusText(user)}
                  </p>
                </div>
              </div>
              
              <Button
                onClick={() => onStartChat(user)}
                size="sm"
                className="bg-gradient-chat hover:opacity-90 transition-all duration-300 shadow-message"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Chat
              </Button>
            </div>
          </div>
        ))}
        
        {!loading && filteredUsers.length === 0 && (
          <div className="text-center py-8">
            <div className="text-muted-foreground">
              Nenhum usuário encontrado
            </div>
          </div>
        )}
      </div>
    </div>
  );
}