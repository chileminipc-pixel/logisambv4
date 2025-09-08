import { useState, useEffect } from 'react';
import { ExternalDataService } from './services/ExternalDataService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Copy, ExternalLink, RefreshCw } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function ConnectionDebugInfo() {
  const [connectionInfo, setConnectionInfo] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    updateConnectionInfo();
  }, []);

  const updateConnectionInfo = () => {
    const info = ExternalDataService.getConnectionInfo();
    setConnectionInfo(info);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado al portapapeles`);
  };

  const refreshInfo = () => {
    setIsRefreshing(true);
    ExternalDataService.invalidateCache();
    setTimeout(() => {
      updateConnectionInfo();
      setIsRefreshing(false);
      toast.info('Información actualizada');
    }, 1000);
  };

  if (!connectionInfo) return null;

  const urls = [
    { label: 'Guías JSON', url: connectionInfo.guiasUrl, endpoint: '/data/guias.json' },
    { label: 'Facturas JSON', url: connectionInfo.facturasUrl, endpoint: '/data/facturas-impagas.json' },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Información de Conexión</CardTitle>
            <CardDescription>
              URLs y estado actual del servicio JSON externo
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshInfo}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium">Estado General</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Servicio:</span>
                <Badge variant={connectionInfo.enabled ? "default" : "secondary"}>
                  {connectionInfo.enabled ? 'Habilitado' : 'Deshabilitado'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Modo:</span>
                <Badge variant={
                  connectionInfo.mode === 'external' ? "default" :
                  connectionInfo.mode === 'fallback' ? "destructive" : "secondary"
                }>
                  {connectionInfo.mode.toUpperCase()}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Cache:</span>
                <span className={connectionInfo.cacheValid ? "text-green-600" : "text-muted-foreground"}>
                  {connectionInfo.cacheValid ? 'Válido' : 'Expirado'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Conexión:</span>
                {connectionInfo.externalAvailable === null ? (
                  <span className="text-muted-foreground">No probada</span>
                ) : connectionInfo.externalAvailable ? (
                  <span className="text-green-600">Exitosa</span>
                ) : (
                  <span className="text-red-600">Fallida</span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Configuración</h4>
            <div className="space-y-1 text-sm">
              <div>
                <span className="font-medium">Dominio base:</span>
                <div className="text-muted-foreground break-all">
                  https://livesoft.cl
                </div>
              </div>
              <div>
                <span className="font-medium">Cache TTL:</span>
                <span className="text-muted-foreground ml-2">5 minutos</span>
              </div>
              <div>
                <span className="font-medium">Timeout:</span>
                <span className="text-muted-foreground ml-2">10 segundos</span>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <h4 className="font-medium">URLs de Archivos JSON</h4>
          <div className="space-y-2">
            {urls.map((item, index) => (
              <div key={index} className="p-3 border rounded-lg bg-muted/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{item.label}</span>
                  <div className="flex space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(item.url, item.label)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    {connectionInfo.enabled && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(item.url, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground break-all font-mono">
                  {item.url}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <h4 className="font-medium">Instrucciones de Activación</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>1. Subir los archivos JSON a: <code>https://livesoft.cl/data/</code></p>
            <p>2. Verificar que los archivos son accesibles públicamente</p>
            <p>3. Configurar CORS en el servidor para permitir acceso desde tu dominio</p>
            <p>4. La aplicación detectará automáticamente los datos externos</p>
          </div>
        </div>

        {connectionInfo.mode === 'fallback' && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-sm font-medium text-orange-800">
                Usando datos mock como respaldo
              </span>
            </div>
            <p className="text-xs text-orange-700 mt-1">
              No se pudo conectar al servidor JSON externo. Verifica que los archivos estén disponibles en https://livesoft.cl/data/
            </p>
          </div>
        )}

        {connectionInfo.mode === 'external' && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-800">
                Conectado exitosamente al JSON externo
              </span>
            </div>
            <p className="text-xs text-green-700 mt-1">
              Los datos se están cargando desde https://livesoft.cl/data/
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}