import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { LocalDataService } from './services/LocalDataService';
import { ResidueService } from './services/ResidueService';
import { Check, X, RefreshCw, AlertCircle } from 'lucide-react';

export function JSONStatusChecker() {
  const [status, setStatus] = useState<{
    loading: boolean;
    jsonFiles: {
      usuarios: boolean;
      clientes: boolean;
      guias: boolean;
      facturas: boolean;
    };
    dataLoaded: {
      usuarios: number;
      clientes: number;
      guias: number;
      facturas: number;
    };
    loginTest: string;
    error?: string;
  }>({
    loading: false,
    jsonFiles: { usuarios: false, clientes: false, guias: false, facturas: false },
    dataLoaded: { usuarios: 0, clientes: 0, guias: 0, facturas: 0 },
    loginTest: ''
  });

  const checkJSONFiles = async () => {
    setStatus(prev => ({ ...prev, loading: true, error: undefined }));
    
    try {
      // Test JSON file accessibility
      const jsonTests = await Promise.allSettled([
        fetch('/data/usuarios.json').then(r => r.ok),
        fetch('/data/clientes.json').then(r => r.ok),
        fetch('/data/guias.json').then(r => r.ok),
        fetch('/data/facturas-impagas.json').then(r => r.ok)
      ]);

      const jsonFiles = {
        usuarios: jsonTests[0].status === 'fulfilled' && jsonTests[0].value,
        clientes: jsonTests[1].status === 'fulfilled' && jsonTests[1].value,
        guias: jsonTests[2].status === 'fulfilled' && jsonTests[2].value,
        facturas: jsonTests[3].status === 'fulfilled' && jsonTests[3].value
      };

      // Clear cache and load fresh data
      LocalDataService.clearCache();
      
      const [usuarios, clientes, guias, facturas] = await Promise.all([
        LocalDataService.loadUsuarios(),
        LocalDataService.loadClientes(),
        LocalDataService.loadGuias(),
        LocalDataService.loadFacturas()
      ]);

      const dataLoaded = {
        usuarios: usuarios.length,
        clientes: clientes.length,
        guias: guias.length,
        facturas: facturas.length
      };

      // Test login with demo credentials
      let loginTest = '';
      try {
        const testUser = await LocalDataService.findUsuarioByCredentials('copec_admin', 'demo123');
        if (testUser) {
          loginTest = `✅ Login test OK - Usuario: ${testUser.nombre} (Cliente ID: ${testUser.clienteId})`;
        } else {
          loginTest = '❌ Login test failed - Usuario no encontrado';
        }
      } catch (error) {
        loginTest = `❌ Login test error: ${error.message}`;
      }

      setStatus({
        loading: false,
        jsonFiles,
        dataLoaded,
        loginTest
      });

    } catch (error) {
      console.error('Error checking status:', error);
      setStatus(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
    }
  };

  const testFullLogin = async () => {
    try {
      setStatus(prev => ({ ...prev, loading: true }));
      
      console.log('🧪 Testing full login flow...');
      const result = await ResidueService.login('copec_admin', 'demo123');
      
      setStatus(prev => ({
        ...prev,
        loading: false,
        loginTest: `✅ Full login test OK - ${result.usuario.nombre} @ ${result.cliente.nombre}`
      }));
      
      // Logout after test
      await ResidueService.logout();
      
    } catch (error) {
      console.error('Full login test failed:', error);
      setStatus(prev => ({
        ...prev,
        loading: false,
        loginTest: `❌ Full login test failed: ${error.message}`
      }));
    }
  };

  useEffect(() => {
    checkJSONFiles();
  }, []);

  const allJSONOK = Object.values(status.jsonFiles).every(Boolean);
  const hasData = Object.values(status.dataLoaded).every(count => count > 0);

  return (
    <div className="fixed top-4 right-4 z-50">
      <Card className="w-80 bg-white/95 backdrop-blur-sm border shadow-xl">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <AlertCircle className="h-4 w-4" />
            Estado Sistema JSON
            {allJSONOK && hasData ? (
              <Badge variant="default" className="bg-green-600">Activo</Badge>
            ) : (
              <Badge variant="destructive">Error</Badge>
            )}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="xs"
              onClick={checkJSONFiles}
              disabled={status.loading}
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${status.loading ? 'animate-spin' : ''}`} />
              Verificar
            </Button>
            <Button
              variant="default"
              size="xs"
              onClick={testFullLogin}
              disabled={status.loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Test Login
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4 text-xs">
          {status.loading ? (
            <div className="text-center py-4">
              <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
              Verificando sistema...
            </div>
          ) : (
            <>
              {/* JSON Files Status */}
              <div>
                <div className="font-medium mb-2">Archivos JSON</div>
                <div className="space-y-1">
                  {Object.entries(status.jsonFiles).map(([file, ok]) => (
                    <div key={file} className="flex items-center justify-between">
                      <span>{file}.json</span>
                      {ok ? (
                        <Check className="h-3 w-3 text-green-600" />
                      ) : (
                        <X className="h-3 w-3 text-red-600" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Data Loaded */}
              <div>
                <div className="font-medium mb-2">Datos Cargados</div>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(status.dataLoaded).map(([type, count]) => (
                    <div key={type} className="flex justify-between">
                      <span>{type}:</span>
                      <Badge variant={count > 0 ? "default" : "destructive"} className="text-xs">
                        {count}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Login Test */}
              {status.loginTest && (
                <div>
                  <div className="font-medium mb-2">Test de Login</div>
                  <div className={`p-2 rounded text-xs ${
                    status.loginTest.startsWith('✅') 
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    {status.loginTest}
                  </div>
                </div>
              )}

              {/* Error */}
              {status.error && (
                <div className="p-2 bg-red-50 border border-red-200 rounded text-red-800">
                  Error: {status.error}
                </div>
              )}

              {/* Summary */}
              <div className={`p-2 rounded text-center ${
                allJSONOK && hasData 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-orange-50 text-orange-800 border border-orange-200'
              }`}>
                {allJSONOK && hasData 
                  ? '✅ Sistema funcionando con JSON externo'
                  : '⚠️ Revisión necesaria'
                }
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}