import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useUserStatus() {
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const updateUserStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        try {
          await supabase.rpc('handle_user_activity');
        } catch (error) {
          console.error('Error updating user status:', error);
        }
      }
    };

    // Update status immediately
    updateUserStatus();

    // Update status every 30 seconds while user is active
    intervalId = setInterval(updateUserStatus, 30000);

    // Update status on user activity
    const handleActivity = () => {
      updateUserStatus();
    };

    // Listen for user activity
    document.addEventListener('mousedown', handleActivity);
    document.addEventListener('keydown', handleActivity);
    document.addEventListener('scroll', handleActivity);
    document.addEventListener('mousemove', handleActivity);

    // Update status when tab becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updateUserStatus();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      document.removeEventListener('mousedown', handleActivity);
      document.removeEventListener('keydown', handleActivity);
      document.removeEventListener('scroll', handleActivity);
      document.removeEventListener('mousemove', handleActivity);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
}