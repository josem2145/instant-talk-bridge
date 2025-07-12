import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface RealTimeMessage {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  conversation_id: string;
}

interface UseRealTimeMessagesProps {
  conversationId: string | null;
  currentUserId: string | null;
}

export function useRealTimeMessages({ conversationId, currentUserId }: UseRealTimeMessagesProps) {
  const [messages, setMessages] = useState<RealTimeMessage[]>([]);
  const [loading, setLoading] = useState(false);

  // Load existing messages
  useEffect(() => {
    if (!conversationId) return;

    const loadMessages = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error loading messages:', error);
          return;
        }

        setMessages(data || []);
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [conversationId]);

  // Set up realtime subscription
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          const newMessage = payload.new as RealTimeMessage;
          console.log('New message received:', newMessage);
          setMessages(prev => {
            // Check if message already exists to avoid duplicates
            const exists = prev.find(msg => msg.id === newMessage.id);
            if (exists) return prev;
            return [...prev, newMessage];
          });
        }
      )
      .subscribe((status) => {
        console.log('Real-time subscription status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  const sendMessage = async (content: string) => {
    if (!conversationId || !currentUserId || !content.trim()) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          content: content.trim(),
          conversation_id: conversationId,
          sender_id: currentUserId
        });

      if (error) {
        console.error('Error sending message:', error);
        throw error;
      }

      // Update conversation last_message_at
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId);

    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  return {
    messages,
    loading,
    sendMessage
  };
}