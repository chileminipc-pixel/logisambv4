import { useState, useEffect } from 'react';
import { ExternalDataService } from './services/ExternalDataService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Globe, RefreshCw, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function ExternalServiceStatus() {
  const [connectionInfo, setConnectionInfo] = useState<any>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  useEffect(() => {
    updateConnectionInfo();
  }, []);

  const updateConnectionInfo = () => {
    const info = ExternalDataService.getConnectionInfo();
    setConnectionInfo(info);
  };

  const testConnection = async () => {
    setIsTestingConnection(true);
    try {
      const isConnected = await ExternalDataService.testExternalConnection();
      updateConnectionInfo();
      
      if (isConnected) {
        toast.success('🌐 Conectado a https://livesoft.cl');
      } else {
        toast.info('📦 Usando datos mock internos');
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      toast.error('Error al probar la conexión');
    } finally {
      setIsTestingConnection(false);
    }
  };

  if (!connectionInfo) return null;

  const getStatusIcon = () => {
    if (!connectionInfo.enabled) return <XCircle className="h-4 w-4 text-gray-500" />;
    if (connectionInfo.externalAvailable === true) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (connectionInfo.externalAvailable === false) return <AlertCircle className="h-4 w-4 text-orange-500" />;
    return <Globe className="h-4 w-4 text-blue-500" />;
  };

  const getStatusText = () => {
    if (!connectionInfo.enabled) return 'JSON externo deshabilitado';
    if (connectionInfo.mode === 'external') return 'Conectado a JSON externo';
    if (connectionInfo.mode === 'fallback') return 'Usando datos mock';
    return 'Estado desconocido';
  };

  const getStatusBadge = () => {
    if (!connectionInfo.enabled) return <Badge variant="secondary">OFF</Badge>;
    if (connectionInfo.mode === 'external') return <Badge className="bg-green-100 text-green-800 border-green-200">EXTERNO</Badge>;
    if (connectionInfo.mode === 'fallback') return <Badge variant="outline">MOCK</Badge>;
    return <Badge variant="secondary">?</Badge>;
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <CardTitle className="text-sm">{getStatusText()}</CardTitle>
            {getStatusBadge()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={testConnection}
            disabled={isTestingConnection}
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${isTestingConnection ? 'animate-spin' : ''}`} />
            Test
          </Button>
        </div>
        <CardDescription className="text-xs">
          {connectionInfo.enabled ? 'https://livesoft.cl/data/' : 'Servicio JSON externo no configurado'}
        </CardDescription>
      </CardHeader>
      {connectionInfo.mode === 'fallback' && (
        <CardContent className="pt-0">
          <div className="text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded-md p-2">
            💡 Para activar el JSON externo, sube los archivos a https://livesoft.cl/data/ y configura CORS
          </div>
        </CardContent>
      )}
    </Card>
  );
}