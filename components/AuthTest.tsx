import React, { useState } from 'react';
import { LocalDataService } from './services/LocalDataService';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';

export function AuthTest() {
  const [testResults, setTestResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testCredentials, setTestCredentials] = useState({
    username: 'copec_admin',
    password: 'demo123'
  });

  const runAuthTests = async () => {
    setIsLoading(true);
    try {
      console.log('🧪 Iniciando tests de autenticación...');
      
      // Test 1: Cargar usuarios
      const usuarios = await LocalDataService.loadUsuarios();
      console.log('📋 Usuarios cargados:', usuarios.length);
      
      // Test 2: Cargar clientes
      const clientes = await LocalDataService.loadClientes();
      console.log('🏢 Clientes cargados:', clientes.length);
      
      // Test 3: Probar credenciales específicas
      const testCases = [
        { username: 'copec_admin', password: 'demo123' },
        { username: 'shell_admin', password: 'demo123' },
        { username: 'petrobras_admin', password: 'demo123' },
        { username: 'invalid_user', password: 'wrong_pass' }
      ];
      
      const authResults = [];
      for (const testCase of testCases) {
        console.log(`🔍 Probando: ${testCase.username}/${testCase.password}`);
        const user = await LocalDataService.findUsuarioByCredentials(testCase.username, testCase.password);
        const cliente = user ? await LocalDataService.findClienteById(user.clienteId) : null;
        
        authResults.push({
          ...testCase,
          success: !!user,
          user: user ? { 
            id: user.id, 
            login: user.usu_login, 
            nombre: user.nombre,
            clienteId: user.clienteId 
          } : null,
          cliente: cliente ? { 
            id: cliente.id, 
            nombre: cliente.nombre 
          } : null
        });
      }
      
      setTestResults({
        usuarios: {
          total: usuarios.length,
          muestra: usuarios.slice(0, 3).map(u => ({
            id: u.id,
            login: u.usu_login,
            nombre: u.nombre,
            clienteId: u.clienteId,
            activo: u.usu_activo
          }))
        },
        clientes: {
          total: clientes.length,
          muestra: clientes.slice(0, 3).map(c => ({
            id: c.id,
            nombre: c.nombre,
            rut: c.rut
          }))
        },
        authResults
      });
      
      console.log('✅ Tests completados');
      
    } catch (error) {
      console.error('❌ Error en tests:', error);
      setTestResults({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const testSpecificCredentials = async () => {
    setIsLoading(true);
    try {
      console.log(`🔍 Probando credenciales específicas: ${testCredentials.username}/${testCredentials.password}`);
      
      const user = await LocalDataService.findUsuarioByCredentials(testCredentials.username, testCredentials.password);
      
      if (user) {
        const cliente = await LocalDataService.findClienteById(user.clienteId);
        console.log('✅ Login exitoso:', { user, cliente });
        alert(`Login exitoso!\nUsuario: ${user.nombre}\nCliente: ${cliente?.nombre}`);
      } else {
        console.log('❌ Login fallido');
        alert('Credenciales incorrectas');
      }
    } catch (error) {
      console.error('❌ Error:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <Card className="w-96 bg-white/95 backdrop-blur-sm border shadow-xl">
        <CardHeader>
          <CardTitle className="text-sm">🧪 Test de Autenticación</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Test específico */}
          <div className="space-y-2">
            <Label className="text-xs">Test Credenciales Específicas:</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Usuario"
                value={testCredentials.username}
                onChange={(e) => setTestCredentials(prev => ({ ...prev, username: e.target.value }))}
                className="text-xs h-8"
              />
              <Input
                placeholder="Contraseña"
                value={testCredentials.password}
                onChange={(e) => setTestCredentials(prev => ({ ...prev, password: e.target.value }))}
                className="text-xs h-8"
              />
            </div>
            <Button
              onClick={testSpecificCredentials}
              disabled={isLoading}
              size="sm"
              className="w-full text-xs h-8"
              variant="outline"
            >
              {isLoading ? 'Probando...' : 'Probar Login'}
            </Button>
          </div>

          {/* Test completo */}
          <Button
            onClick={runAuthTests}
            disabled={isLoading}
            size="sm"
            className="w-full text-xs h-8"
          >
            {isLoading ? 'Ejecutando Tests...' : 'Ejecutar Tests Completos'}
          </Button>
          
          {/* Resultados */}
          {testResults && (
            <div className="space-y-2 text-xs">
              {testResults.error ? (
                <div className="text-red-600 p-2 bg-red-50 rounded">
                  Error: {testResults.error}
                </div>
              ) : (
                <>
                  {testResults.usuarios && (
                    <div className="p-2 bg-blue-50 rounded">
                      <div className="font-medium">Usuarios: {testResults.usuarios.total}</div>
                      {testResults.usuarios.muestra.map((u: any, i: number) => (
                        <div key={i} className="text-xs text-muted-foreground">
                          • {u.login} ({u.nombre}) - {u.activo}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {testResults.authResults && (
                    <div className="p-2 bg-green-50 rounded">
                      <div className="font-medium">Tests de Login:</div>
                      {testResults.authResults.map((result: any, i: number) => (
                        <div key={i} className="text-xs">
                          {result.success ? '✅' : '❌'} {result.username}
                          {result.user && ` -> ${result.user.nombre} (${result.cliente?.nombre})`}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}