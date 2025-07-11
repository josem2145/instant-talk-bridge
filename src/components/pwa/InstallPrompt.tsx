import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, X, Smartphone, Share } from "lucide-react";
import { usePWA } from "@/hooks/usePWA";

export function InstallPrompt() {
  const { isInstallable, isIOSInstallable, installApp } = usePWA();
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed || (!isInstallable && !isIOSInstallable)) {
    return null;
  }

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      setIsDismissed(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 shadow-chat animate-slide-in border-primary/20 bg-gradient-subtle backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-chat rounded-lg">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold">
                Instalar Chat App
              </CardTitle>
              <CardDescription className="text-xs">
                Acesse rapidamente suas conversas
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {isInstallable ? (
          <div className="flex space-x-2">
            <Button
              onClick={handleInstall}
              className="flex-1 bg-gradient-chat hover:opacity-90 transition-all duration-300"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Instalar App
            </Button>
            <Button
              variant="outline"
              onClick={handleDismiss}
              size="sm"
            >
              Agora não
            </Button>
          </div>
        ) : isIOSInstallable ? (
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              Para instalar no iPhone:
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-1 h-1 bg-primary rounded-full"></div>
                <span>Toque no ícone <Share className="w-3 h-3 inline mx-1" /> (Compartilhar)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-1 h-1 bg-primary rounded-full"></div>
                <span>Selecione "Adicionar à Tela de Início"</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-1 h-1 bg-primary rounded-full"></div>
                <span>Toque em "Adicionar"</span>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleDismiss}
              size="sm"
              className="w-full"
            >
              Entendi
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}