import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { LoginForm } from "@/components/auth/login-form";
import { SignupForm } from "@/components/auth/signup-form";
import ChatPage from "./Chat";
// import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [showSignup, setShowSignup] = useState(false);
  const [loading, setLoading] = useState(true);
  // const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error.message);
      } else {
        console.log("Login successful");
      }
    } catch (error) {
      console.error("Unexpected login error:", error);
    }
  };

  const handleSignup = async (email: string, password: string, displayName: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            display_name: displayName,
          },
        },
      });

      if (error) {
        console.error("Signup error:", error.message);
      } else {
        console.log("Account created successfully");
        setShowSignup(false);
      }
    } catch (error) {
      console.error("Unexpected signup error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      console.log("Logout successful");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleForgotPassword = () => {
    console.log("Password recovery - feature in development");
  };

  const handleCreateAccount = () => {
    setShowSignup(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <ChatPage onLogout={handleLogout} />;
  }

  if (showSignup) {
    return (
      <SignupForm
        onSignup={handleSignup}
        onBackToLogin={() => setShowSignup(false)}
      />
    );
  }

  return (
    <>
      <LoginForm
        onLogin={handleLogin}
        onForgotPassword={handleForgotPassword}
        onCreateAccount={handleCreateAccount}
      />
      <InstallPrompt />
    </>
  );
};

export default Index;
