import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { LocalDataService } from './services/LocalDataService';
import { LogoLogisamb } from './LogoLogisamb';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { toast } from 'sonner@2.0.3';
import { 
  Eye, 
  EyeOff, 
  LogIn, 
  Shield, 
  BarChart3,
  Globe,
  Building2,
  Trash2,
  DropletIcon,
  MapPin,
  Zap
} from 'lucide-react';

export function LoginPage() {
  const { login, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dataStatus, setDataStatus] = useState<string>('Verificando datos...');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username.trim() || !formData.password.trim()) {
      return; // AuthContext will handle the validation
    }

    setIsSubmitting(true);
    
    try {
      await login(formData.username.trim(), formData.password.trim());
    } catch (error) {
      console.error('Login form error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const loadDemoCredentials = (clienteType: 'copec' | 'shell' | 'petrobras') => {
    if (clienteType === 'copec') {
      setFormData({
        username: 'copec_admin',
        password: 'demo123'
      });
    } else if (clienteType === 'shell') {
      setFormData({
        username: 'shell_admin',
        password: 'demo123'
      });
    } else if (clienteType === 'petrobras') {
      setFormData({
        username: 'petrobras_admin',
        password: 'demo123'
      });
    }
    
    toast.success('Credenciales demo cargadas', {
      description: 'Presiona "Iniciar Sesión" para continuar',
      duration: 2000,
    });
  };

  const isFormValid = formData.username.trim() && formData.password.trim();

  useEffect(() => {
    const checkDataStatus = async () => {
      try {
        const usuarios = await LocalDataService.loadUsuarios();
        const clientes = await LocalDataService.loadClientes();
        setDataStatus(`✅ ${usuarios.length} usuarios y ${clientes.length} clientes cargados`);
      } catch (error) {
        setDataStatus(`❌ Error cargando datos: ${error.message}`);
      }
    };
    checkDataStatus();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-green-900 dark:to-blue-900 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <LogoLogisamb variant="compact" size="md" />
            
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="hidden sm:flex items-center gap-2">
                <Globe className="h-3 w-3" />
                Portal Cliente v2.0
              </Badge>
              
              <Badge variant="secondary" className="hidden md:flex items-center gap-2">
                <Zap className="h-3 w-3" />
                Powered by LOGISAMB
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Login Form */}
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg border-white/20 shadow-2xl">
            <CardHeader className="space-y-4 text-center">
              <div className="flex justify-center">
                <LogoLogisamb variant="icon" size="xl" />
              </div>
              
              <div>
                <CardTitle className="text-2xl bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  Portal Cliente
                </CardTitle>
                <CardDescription className="mt-2">
                  Accede al sistema de gestión integral de residuos por sucursal
                </CardDescription>
              </div>

              {/* Company Info */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-4 rounded-lg">
                <LogoLogisamb variant="compact" size="sm" className="justify-center mb-2" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Sistema especializado en manejo integral de residuos industriales, 
                  peligrosos y domiciliarios con gestión por sucursales.
                </p>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Usuario</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="ej: copec_admin"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    disabled={isSubmitting || isLoading}
                    className="h-12"
                    autoComplete="username"
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      disabled={isSubmitting || isLoading}
                      className="h-12 pr-12"
                      autoComplete="current-password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isSubmitting || isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-medium"
                  disabled={isSubmitting || isLoading || !isFormValid}
                >
                  {isSubmitting || isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Accediendo al sistema...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4 mr-2" />
                      Acceder al Portal
                    </>
                  )}
                </Button>
              </form>

              <Separator className="my-6" />

              {/* Data Status */}
              <div className="text-center p-2 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  {dataStatus}
                </p>
              </div>

              {/* Demo Credentials */}
              <div className="space-y-3">
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">
                    Credenciales de Demostración
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Estaciones de Servicio - Gestión por Sucursales
                  </p>
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadDemoCredentials('copec')}
                    disabled={isSubmitting || isLoading}
                    className="text-xs justify-start h-10 bg-gradient-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 border-orange-200"
                  >
                    <Building2 className="w-4 h-4 mr-3 text-orange-600" />
                    <div className="text-left">
                      <div className="font-medium text-orange-700">COPEC</div>
                      <div className="text-xs text-orange-600">15 sucursales • 15 guías</div>
                    </div>
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadDemoCredentials('shell')}
                    disabled={isSubmitting || isLoading}
                    className="text-xs justify-start h-10 bg-gradient-to-r from-yellow-50 to-red-50 hover:from-yellow-100 hover:to-red-100 border-yellow-200"
                  >
                    <Trash2 className="w-4 h-4 mr-3 text-yellow-600" />
                    <div className="text-left">
                      <div className="font-medium text-yellow-700">SHELL</div>
                      <div className="text-xs text-yellow-600">2 sucursales • 2 guías</div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadDemoCredentials('petrobras')}
                    disabled={isSubmitting || isLoading}
                    className="text-xs justify-start h-10 bg-gradient-to-r from-green-50 to-blue-50 hover:from-green-100 hover:to-blue-100 border-green-200"
                  >
                    <DropletIcon className="w-4 h-4 mr-3 text-green-600" />
                    <div className="text-left">
                      <div className="font-medium text-green-700">PETROBRAS</div>
                      <div className="text-xs text-green-600">2 sucursales • 2 guías</div>
                    </div>
                  </Button>
                </div>
              </div>

              {/* Features */}
              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground mb-3 text-center font-medium">
                  Funciones del Portal LOGISAMB:
                </p>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <MapPin className="h-3 w-3 text-green-500" />
                    <span>Gestión por Sucursal</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <BarChart3 className="h-3 w-3 text-blue-500" />
                    <span>Reportes Integrados</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Shield className="h-3 w-3 text-purple-500" />
                    <span>Datos Seguros</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Zap className="h-3 w-3 text-orange-500" />
                    <span>Gestión Integral</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="mt-8 text-center">
            <LogoLogisamb variant="compact" size="sm" className="justify-center mb-2" showText={false} />
            <p className="text-sm text-muted-foreground">
              LOGISAMB © 2025 - Sistema de Gestión Integral
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Manejo profesional de residuos por sucursales
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}