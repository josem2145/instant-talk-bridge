export interface User {
  id: string;
  user_id: string;
  display_name: string;
  email: string;
  status: "online" | "away" | "busy" | "offline";
  last_seen?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Conversation {
  id: string;
  user: User;
  lastMessage: {
    content: string;
    timestamp: Date;
    sender: "me" | "other";
  };
  unreadCount?: number;
}