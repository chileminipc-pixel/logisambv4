import React, { useState, useEffect } from 'react';
import { LocalDataService } from './services/LocalDataService';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { ChevronDown, RefreshCw, Database, Users, Building2, FileText, CreditCard } from 'lucide-react';

export function DataDebugInfo() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const loadDebugInfo = async () => {
    setIsLoading(true);
    try {
      const usuarios = await LocalDataService.loadUsuarios();
      const clientes = await LocalDataService.loadClientes();
      const guias = await LocalDataService.loadGuias();
      const facturas = await LocalDataService.loadFacturas();

      // Test de credenciales específicas
      const copecUser = await LocalDataService.findUsuarioByCredentials('copec_admin', 'demo123');
      const shellUser = await LocalDataService.findUsuarioByCredentials('shell_admin', 'demo123');
      const petrobrasUser = await LocalDataService.findUsuarioByCredentials('petrobras_admin', 'demo123');

      setDebugInfo({
        source: 'JSON Externo',
        timestamp: new Date().toLocaleString(),
        usuarios: {
          total: usuarios.length,
          activos: usuarios.filter(u => u.usu_activo === 'SI').length,
          inactivos: usuarios.filter(u => u.usu_activo === 'NO').length,
          sample: usuarios.slice(0, 3).map(u => ({ 
            login: u.usu_login, 
            nombre: u.nombre, 
            clienteId: u.clienteId,
            activo: u.usu_activo 
          }))
        },
        clientes: {
          total: clientes.length,
          sample: clientes.slice(0, 3).map(c => ({ 
            id: c.id, 
            nombre: c.nombre, 
            rut: c.rut 
          }))
        },
        guias: {
          total: guias.length,
          porCliente: {
            copec: guias.filter(g => g.clienteId === 57).length,
            shell: guias.filter(g => g.clienteId === 58).length,
            petrobras: guias.filter(g => g.clienteId === 59).length,
            exxon: guias.filter(g => g.clienteId === 60).length
          }
        },
        facturas: {
          total: facturas.length,
          porCliente: {
            copec: facturas.filter(f => f.clienteId === 57).length,
            shell: facturas.filter(f => f.clienteId === 58).length,
            petrobras: facturas.filter(f => f.clienteId === 59).length,
            exxon: facturas.filter(f => f.clienteId === 60).length
          }
        },
        credenciales: {
          copec: copecUser ? '✅ VÁLIDAS' : '❌ INVÁLIDAS',
          shell: shellUser ? '✅ VÁLIDAS' : '❌ INVÁLIDAS',
          petrobras: petrobrasUser ? '✅ VÁLIDAS' : '❌ INVÁLIDAS'
        }
      });
    } catch (error) {
      console.error('Error loading debug info:', error);
      setDebugInfo({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const clearCache = () => {
    LocalDataService.clearCache();
    setDebugInfo(null);
  };

  const forceReloadFromJSON = async () => {
    setIsLoading(true);
    try {
      // Limpiar cache primero
      LocalDataService.clearCache();
      
      // Forzar recarga de datos desde JSON
      const [usuarios, clientes, guias, facturas] = await Promise.all([
        LocalDataService.loadUsuarios(),
        LocalDataService.loadClientes(), 
        LocalDataService.loadGuias(),
        LocalDataService.loadFacturas()
      ]);
      
      console.log('🔄 Datos recargados desde JSON:', {
        usuarios: usuarios.length,
        clientes: clientes.length,
        guias: guias.length,
        facturas: facturas.length
      });
      
      // Recargar debug info
      await loadDebugInfo();
    } catch (error) {
      console.error('Error recargando desde JSON:', error);
      setDebugInfo({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !debugInfo) {
      loadDebugInfo();
    }
  }, [isOpen, debugInfo]);

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="bg-white/90 backdrop-blur-sm border shadow-lg"
          >
            <Database className="h-4 w-4 mr-2" />
            Debug Data
            <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="mt-2">
          <Card className="w-80 bg-white/95 backdrop-blur-sm border shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Database className="h-4 w-4" />
                Información de Datos
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="xs"
                  onClick={loadDebugInfo}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                  Actualizar
                </Button>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={clearCache}
                >
                  Limpiar Cache
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4 text-xs">
              {isLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                  Cargando datos...
                </div>
              ) : debugInfo?.error ? (
                <div className="text-red-600 p-2 bg-red-50 rounded">
                  Error: {debugInfo.error}
                </div>
              ) : debugInfo ? (
                <>
                  {/* Source Info */}
                  <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded text-center">
                    <div className="text-xs font-medium text-green-800">
                      📡 {debugInfo.source}
                    </div>
                    <div className="text-xs text-green-600 mt-1">
                      {debugInfo.timestamp}
                    </div>
                  </div>

                  {/* Usuarios */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-3 w-3" />
                      <span className="font-medium">Usuarios</span>
                      <Badge variant="secondary" className="text-xs">
                        {debugInfo.usuarios.total}
                      </Badge>
                    </div>
                    <div className="ml-5 space-y-1 text-xs text-muted-foreground">
                      <div>Activos: {debugInfo.usuarios.activos}</div>
                      <div>Inactivos: {debugInfo.usuarios.inactivos}</div>
                      {debugInfo.usuarios.sample.map((u: any, i: number) => (
                        <div key={i} className="text-xs">
                          • {u.login} ({u.nombre}) - Cliente {u.clienteId}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Clientes */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="h-3 w-3" />
                      <span className="font-medium">Clientes</span>
                      <Badge variant="secondary" className="text-xs">
                        {debugInfo.clientes.total}
                      </Badge>
                    </div>
                    <div className="ml-5 space-y-1 text-xs text-muted-foreground">
                      {debugInfo.clientes.sample.map((c: any, i: number) => (
                        <div key={i}>• {c.nombre} (ID: {c.id})</div>
                      ))}
                    </div>
                  </div>

                  {/* Guías */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-3 w-3" />
                      <span className="font-medium">Guías</span>
                      <Badge variant="secondary" className="text-xs">
                        {debugInfo.guias.total}
                      </Badge>
                    </div>
                    <div className="ml-5 grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                      <div>COPEC: {debugInfo.guias.porCliente.copec}</div>
                      <div>SHELL: {debugInfo.guias.porCliente.shell}</div>
                      <div>PETROBRAS: {debugInfo.guias.porCliente.petrobras}</div>
                      <div>EXXON: {debugInfo.guias.porCliente.exxon}</div>
                    </div>
                  </div>

                  {/* Facturas */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="h-3 w-3" />
                      <span className="font-medium">Facturas Impagas</span>
                      <Badge variant="secondary" className="text-xs">
                        {debugInfo.facturas.total}
                      </Badge>
                    </div>
                    <div className="ml-5 grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                      <div>COPEC: {debugInfo.facturas.porCliente.copec}</div>
                      <div>SHELL: {debugInfo.facturas.porCliente.shell}</div>
                      <div>PETROBRAS: {debugInfo.facturas.porCliente.petrobras}</div>
                      <div>EXXON: {debugInfo.facturas.porCliente.exxon}</div>
                    </div>
                  </div>

                  {/* Credenciales */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">Test Credenciales</span>
                    </div>
                    <div className="ml-5 space-y-1 text-xs">
                      <div>copec_admin: {debugInfo.credenciales.copec}</div>
                      <div>shell_admin: {debugInfo.credenciales.shell}</div>
                      <div>petrobras_admin: {debugInfo.credenciales.petrobras}</div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  Click "Actualizar" para cargar información
                </div>
              )}
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}