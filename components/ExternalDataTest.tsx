import { useState, useEffect } from 'react';
import { ExternalDataService } from './services/ExternalDataService';
import { ConnectionDebugInfo } from './ConnectionDebugInfo';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { toast } from 'sonner@2.0.3';
import { 
  Globe, 
  Database, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Clock,
  FileText,
  Users,
  Building2,
  Receipt
} from 'lucide-react';

export function ExternalDataTest() {
  const [connectionInfo, setConnectionInfo] = useState<any>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<boolean | null>(null);
  const [sampleData, setSampleData] = useState<{
    guias: any[];
    facturas: any[];
    usuarios: any[];
    clientes: any[];
  }>({
    guias: [],
    facturas: [],
    usuarios: [],
    clientes: []
  });

  // Cargar información de conexión al montar
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
      toast.info('🔌 Probando conexión con servidor externo...');
      
      const isConnected = await ExternalDataService.testExternalConnection();
      setTestResult(isConnected);
      
      if (isConnected) {
        toast.success('✅ Conexión exitosa con https://livesoft.cl');
      } else {
        toast.warning('⚠️ No se pudo conectar al servidor externo, usando datos mock');
      }
      
      updateConnectionInfo();
    } catch (error) {
      console.error('Error testing connection:', error);
      setTestResult(false);
      toast.error('❌ Error al probar la conexión');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const loadSampleData = async () => {
    try {
      toast.info('📦 Cargando datos de ejemplo...');
      
      const [guias, facturas, usuarios, clientes] = await Promise.all([
        ExternalDataService.getAllGuias().then(data => data.slice(0, 3)),
        ExternalDataService.getAllFacturasImpagas().then(data => data.slice(0, 3)),
        // Note: We don't have methods for usuarios and clientes in the service yet
        Promise.resolve([]),
        Promise.resolve([])
      ]);

      setSampleData({
        guias,
        facturas,
        usuarios,
        clientes
      });

      toast.success('✅ Datos cargados exitosamente');
    } catch (error) {
      console.error('Error loading sample data:', error);
      toast.error('❌ Error al cargar los datos');
    }
  };

  const clearCache = () => {
    ExternalDataService.invalidateCache();
    setSampleData({
      guias: [],
      facturas: [],
      usuarios: [],
      clientes: []
    });
    updateConnectionInfo();
    toast.info('🗑️ Cache limpiado');
  };

  const getStatusBadge = (enabled: boolean, available: boolean | null) => {
    if (!enabled) {
      return <Badge variant="secondary">Deshabilitado</Badge>;
    }
    
    if (available === null) {
      return <Badge variant="outline">No probado</Badge>;
    }
    
    return available ? 
      <Badge className="bg-green-100 text-green-800 border-green-200">Conectado</Badge> :
      <Badge variant="destructive">Sin conexión</Badge>;
  };

  const getModeDescription = (mode: string) => {
    switch (mode) {
      case 'external':
        return 'Leyendo datos desde JSON externo';
      case 'fallback':
        return 'Usando datos mock como respaldo';
      case 'disabled':
        return 'Servicio JSON externo deshabilitado';
      default:
        return 'Estado desconocido';
    }
  };

  return (
    <div className="space-y-6">
      <ConnectionDebugInfo />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Conexión de Datos Externos
          </CardTitle>
          <CardDescription>
            Prueba y monitoreo del servicio JSON externo de https://livesoft.cl
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {connectionInfo && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Estado:</span>
                  {getStatusBadge(connectionInfo.enabled, connectionInfo.externalAvailable)}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Modo:</span>
                  <span className="text-sm text-muted-foreground capitalize">
                    {connectionInfo.mode}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Cache:</span>
                  <span className="text-sm text-muted-foreground">
                    {connectionInfo.cacheValid ? 'Válido' : 'Expirado'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {getModeDescription(connectionInfo.mode)}
                </p>
                
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>📊 Guías: {connectionInfo.guiasUrl}</div>
                  <div>💳 Facturas: {connectionInfo.facturasUrl}</div>
                </div>
              </div>
            </div>
          )}

          <Separator />

          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={testConnection} 
              disabled={isTestingConnection}
              size="sm"
              variant="outline"
            >
              {isTestingConnection ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Probar Conexión
            </Button>

            <Button 
              onClick={loadSampleData}
              size="sm"
              variant="outline"
            >
              <Database className="h-4 w-4 mr-2" />
              Cargar Datos
            </Button>

            <Button 
              onClick={clearCache}
              size="sm"
              variant="outline"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Limpiar Cache
            </Button>
          </div>

          {testResult !== null && (
            <div className={`p-3 rounded-lg border ${
              testResult 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-orange-50 border-orange-200 text-orange-800'
            }`}>
              <div className="flex items-center gap-2">
                {testResult ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">
                  {testResult 
                    ? 'Conexión exitosa con el servidor JSON externo' 
                    : 'No se pudo conectar, usando datos mock como respaldo'
                  }
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Datos de ejemplo cargados */}
      {(sampleData.guias.length > 0 || sampleData.facturas.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Datos de Ejemplo Cargados
            </CardTitle>
            <CardDescription>
              Muestra de los datos obtenidos desde el JSON externo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {sampleData.guias.length > 0 && (
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Receipt className="h-4 w-4" />
                  Guías ({sampleData.guias.length} registros de ejemplo)
                </h4>
                <div className="grid gap-3">
                  {sampleData.guias.map((guia, index) => (
                    <div key={index} className="p-3 border rounded-lg bg-muted/30">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        <div>
                          <span className="font-medium">Guía:</span> {guia.guia}
                        </div>
                        <div>
                          <span className="font-medium">Fecha:</span> {guia.fecha}
                        </div>
                        <div>
                          <span className="font-medium">Cliente ID:</span> {guia.clienteId}
                        </div>
                        <div>
                          <span className="font-medium">Total:</span> ${guia.total.toLocaleString()}
                        </div>
                        <div className="md:col-span-2">
                          <span className="font-medium">Sucursal:</span> {guia.sucursal}
                        </div>
                        <div className="md:col-span-2">
                          <span className="font-medium">Servicio:</span> {guia.servicio}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {sampleData.facturas.length > 0 && (
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Facturas Impagas ({sampleData.facturas.length} registros de ejemplo)
                </h4>
                <div className="grid gap-3">
                  {sampleData.facturas.map((factura, index) => (
                    <div key={index} className="p-3 border rounded-lg bg-muted/30">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        <div>
                          <span className="font-medium">Factura:</span> {factura.nro_factura}
                        </div>
                        <div>
                          <span className="font-medium">Fecha:</span> {factura.fecha}
                        </div>
                        <div>
                          <span className="font-medium">Cliente ID:</span> {factura.clienteId}
                        </div>
                        <div>
                          <span className="font-medium">Monto:</span> ${factura.monto_factura.toLocaleString()}
                        </div>
                        <div>
                          <span className="font-medium">Días Mora:</span> {factura.dias_mora}
                        </div>
                        <div>
                          <span className="font-medium">Estado:</span> 
                          <Badge 
                            variant={
                              factura.estado_mora === 'Crítica' ? 'destructive' :
                              factura.estado_mora === 'Alta' ? 'outline' :
                              factura.estado_mora === 'Media' ? 'secondary' : 'default'
                            }
                            className="ml-1"
                          >
                            {factura.estado_mora}
                          </Badge>
                        </div>
                        <div className="md:col-span-2">
                          <span className="font-medium">Empresa:</span> {factura.empresa}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}