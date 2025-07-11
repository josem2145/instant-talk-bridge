import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/user';

export interface ConversationWithUser {
  id: string;
  user1_id: string;
  user2_id: string;
  last_message_at: string | null;
  created_at: string;
  otherUser: User;
  lastMessage?: {
    content: string;
    created_at: string;
    sender_id: string;
  };
}

export function useConversations(currentUserId: string | null) {
  const [conversations, setConversations] = useState<ConversationWithUser[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentUserId) return;

    loadConversations();
  }, [currentUserId]);

  const loadConversations = async () => {
    if (!currentUserId) return;

    setLoading(true);
    try {
      // Get conversations where user is participant
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select('*')
        .or(`user1_id.eq.${currentUserId},user2_id.eq.${currentUserId}`)
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (conversationsError) {
        console.error('Error loading conversations:', conversationsError);
        return;
      }

      // Get other users and last messages
      const enrichedConversations = await Promise.all(
        (conversationsData || []).map(async (conv) => {
          const otherUserId = conv.user1_id === currentUserId ? conv.user2_id : conv.user1_id;
          
          // Get other user profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', otherUserId)
            .single();

          // Get last message
          const { data: lastMessage } = await supabase
            .from('messages')
            .select('content, created_at, sender_id')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          return {
            ...conv,
            otherUser: profile ? {
              ...profile,
              status: profile.status as "online" | "away" | "busy" | "offline"
            } : null,
            lastMessage
          };
        })
      );

      setConversations(enrichedConversations.filter(conv => conv.otherUser));
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getOrCreateConversation = async (otherUserId: string): Promise<string | null> => {
    if (!currentUserId) return null;

    try {
      // Check if conversation already exists
      const { data: existing } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(user1_id.eq.${currentUserId},user2_id.eq.${otherUserId}),and(user1_id.eq.${otherUserId},user2_id.eq.${currentUserId})`)
        .single();

      if (existing) {
        return existing.id;
      }

      // Create new conversation
      const { data: newConv, error } = await supabase
        .from('conversations')
        .insert({
          user1_id: currentUserId,
          user2_id: otherUserId
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error creating conversation:', error);
        return null;
      }

      // Reload conversations
      loadConversations();

      return newConv.id;
    } catch (error) {
      console.error('Error getting/creating conversation:', error);
      return null;
    }
  };

  return {
    conversations,
    loading,
    getOrCreateConversation,
    refreshConversations: loadConversations
  };
}