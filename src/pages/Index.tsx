import { useState } from "react";
import { LoginForm } from "@/components/auth/login-form";
import ChatPage from "./Chat";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();

  const handleLogin = (email: string, password: string) => {
    // Mock authentication - in real app this would be handled by Supabase
    console.log("Login attempt:", { email, password });
    setIsAuthenticated(true);
    toast({
      title: "Login realizado com sucesso!",
      description: "Bem-vindo ao Chat App",
    });
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado",
    });
  };

  const handleForgotPassword = () => {
    toast({
      title: "Recuperação de senha",
      description: "Funcionalidade em desenvolvimento",
    });
  };

  const handleCreateAccount = () => {
    toast({
      title: "Criar conta",
      description: "Funcionalidade em desenvolvimento",
    });
  };

  if (isAuthenticated) {
    return <ChatPage onLogout={handleLogout} />;
  }

  return (
    <LoginForm
      onLogin={handleLogin}
      onForgotPassword={handleForgotPassword}
      onCreateAccount={handleCreateAccount}
    />
  );
};

export default Index;
