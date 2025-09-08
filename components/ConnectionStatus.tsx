import { useState, useEffect } from 'react';
import { ResidueService } from './services/ResidueService';
import { useAuth } from './AuthContext';
import { LogoLogisamb } from './LogoLogisamb';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { 
  Wifi, 
  WifiOff, 
  Database, 
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  Building2,
  Zap,
  Globe,
  FileJson
} from 'lucide-react';

export function ConnectionStatus() {
  const { usuario, cliente } = useAuth();
  const [connectionInfo, setConnectionInfo] = useState(ResidueService.getConnectionInfo());
  const [externalInfo, setExternalInfo] = useState<any>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const updateConnectionInfo = async () => {
      setConnectionInfo(ResidueService.getConnectionInfo());
      
      // Obtener información del servicio externo
      try {
        const { ExternalDataService } = await import('./services/ExternalDataService');
        setExternalInfo(ExternalDataService.getConnectionInfo());
      } catch (error) {
        console.warn('Could not load external service info:', error);
      }
    };

    updateConnectionInfo();

    // Update connection info every few seconds
    const interval = setInterval(updateConnectionInfo, 10000);

    // Update on page visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateConnectionInfo();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const isDemoMode = connectionInfo.mode === 'demo';

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <div className="fixed bottom-4 right-4 z-50">
        <Card className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-white/20 shadow-xl">
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-between p-3 h-auto"
            >
              <div className="flex items-center space-x-3">
                <LogoLogisamb variant="icon" size="sm" showText={false} />
                {isDemoMode ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    <span className="text-xs font-medium">Demo LOGISAMB</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-xs font-medium">Portal Activo</span>
                  </div>
                )}
                {cliente && (
                  <Badge variant="outline" className="text-xs px-1 py-0">
                    ID:{cliente.id}
                  </Badge>
                )}
              </div>
              {isExpanded ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <CardContent className="pt-0 pb-3 px-3">
              <div className="space-y-3">
                {/* LOGISAMB Branding */}
                <div className="border-t pt-3">
                  <div className="flex items-center justify-center mb-2">
                    <LogoLogisamb variant="compact" size="sm" />
                  </div>
                  <p className="text-center text-xs text-muted-foreground leading-relaxed">
                    Sistema de Gestión Integral de Residuos
                  </p>
                </div>

                <div className="border-t pt-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Estado del Sistema:</span>
                    <Badge variant={isDemoMode ? "secondary" : "default"} className="text-xs">
                      {connectionInfo.status}
                    </Badge>
                  </div>

                  {/* Información de fuente de datos */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Fuente de datos:</span>
                    <div className="flex items-center space-x-1">
                      {externalInfo?.mode === 'external' ? (
                        <>
                          <Globe className="h-3 w-3 text-blue-500" />
                          <span>JSON Externo</span>
                        </>
                      ) : externalInfo?.mode === 'fallback' ? (
                        <>
                          <FileJson className="h-3 w-3 text-orange-500" />
                          <span>Fallback Local</span>
                        </>
                      ) : externalInfo?.mode === 'disabled' ? (
                        <>
                          <FileJson className="h-3 w-3 text-gray-500" />
                          <span>JSON Deshabilitado</span>
                        </>
                      ) : (
                        <>
                          <Database className="h-3 w-3 text-green-500" />
                          <span>MariaDB</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Base de datos:</span>
                    <span className="font-mono text-xs">{connectionInfo.database}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Autenticación:</span>
                    <div className="flex items-center space-x-1">
                      {connectionInfo.hasToken ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                          <span>Autenticado</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-3 w-3 text-orange-500" />
                          <span>No autenticado</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {usuario && cliente && (
                  <div className="border-t pt-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Usuario activo:</span>
                      <span className="font-medium">{usuario.usu_login}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Cliente asignado:</span>
                      <div className="flex items-center space-x-1">
                        <Building2 className="h-3 w-3" />
                        <span className="font-medium">{cliente.nombre}</span>
                        <Badge variant="outline" className="text-xs px-1 py-0">
                          ID:{cliente.id}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}

                {isDemoMode && (
                  <div className="mt-2 p-3 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg text-xs">
                    <div className="flex items-start space-x-2">
                      <Zap className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-blue-700 dark:text-blue-300 font-medium mb-1">
                          Modo Demostración Activo
                        </p>
                        <p className="text-blue-600 dark:text-blue-400 leading-relaxed">
                          Experiencia completa del Portal LOGISAMB con datos de prueba.<br />
                          <span className="font-medium">Estaciones de Servicio</span> → Sucursales → Guías
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {externalInfo?.mode === 'disabled' && (
                  <div className="mt-2 p-3 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-900/20 dark:to-blue-900/20 rounded-lg text-xs">
                    <div className="flex items-start space-x-2">
                      <FileJson className="h-3 w-3 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-gray-700 dark:text-gray-300 font-medium mb-1">
                          JSON Externo Deshabilitado
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                          Para habilitar JSON externo, configurar baseUrl en ExternalDataService.tsx
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {!isDemoMode && externalInfo?.mode !== 'disabled' && (
                  <div className="mt-2 p-3 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg text-xs">
                    <div className="flex items-start space-x-2">
                      <CheckCircle2 className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-green-700 dark:text-green-300 font-medium mb-1">
                          Portal LOGISAMB - Producción
                        </p>
                        <p className="text-green-600 dark:text-green-400 leading-relaxed">
                          Conectado a servidor MariaDB:<br />
                          <span className="font-mono">livesoft.ddns.me</span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground pt-2 border-t">
                  {isDemoMode ? (
                    <WifiOff className="h-3 w-3" />
                  ) : (
                    <Wifi className="h-3 w-3" />
                  )}
                  <Database className="h-3 w-3" />
                  <span>LOGISAMB Portal v2.0</span>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </div>
    </Collapsible>
  );
}