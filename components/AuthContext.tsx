import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ResidueService, type Usuario, type Cliente } from './services/ResidueService';
import { toast } from 'sonner@2.0.3';

interface AuthContextType {
  usuario: Usuario | null;
  cliente: Cliente | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on app load
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        // Clear JSON cache on app start to ensure fresh data
        const { LocalDataService } = await import('./services/LocalDataService');
        LocalDataService.clearCache();
        
        const token = localStorage.getItem('residue_token');
        if (!token) {
          setIsLoading(false);
          return;
        }

        console.log('🔍 Checking existing session...');
        
        const userData = await ResidueService.getCurrentUser();
        if (userData) {
          setUsuario(userData.usuario);
          setCliente(userData.cliente);
          
          console.log('✅ Session restored:', userData.usuario.usu_login);
          
          const isDemoMode = ResidueService.isDemoMode();
          
          toast.success('Sesión restaurada', {
            description: `Bienvenido de vuelta, ${userData.usuario.nombre || userData.usuario.usu_login}${isDemoMode ? ' (Demo)' : ''}`,
            duration: 2000,
          });
        } else {
          // Invalid or expired token
          localStorage.removeItem('residue_token');
          localStorage.removeItem('mock_user_id');
        }
      } catch (error) {
        console.error('Error checking session:', error);
        localStorage.removeItem('residue_token');
        localStorage.removeItem('mock_user_id');
        
        // Don't show error toast on initial load in demo mode
        if (!ResidueService.isDemoMode()) {
          toast.error('Error al restaurar sesión', {
            description: 'Por favor, inicia sesión nuevamente',
            duration: 3000,
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingSession();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    if (!username?.trim() || !password?.trim()) {
      toast.error('Campos requeridos', {
        description: 'Por favor completa todos los campos',
        duration: 3000,
      });
      return false;
    }

    try {
      setIsLoading(true);
      console.log('🔐 Attempting login for:', username);

      // Clear cache before login to ensure fresh data
      const { LocalDataService } = await import('./services/LocalDataService');
      LocalDataService.clearCache();

      const loginData = await ResidueService.login(username.trim(), password.trim());
      
      // Verify user is active
      if (loginData.usuario.usu_activo !== 'SI') {
        throw new Error('Usuario inactivo. Contacte al administrador.');
      }
      
      setUsuario(loginData.usuario);
      setCliente(loginData.cliente);
      
      console.log('✅ Login successful:', loginData.usuario.usu_login);
      
      const isDemoMode = ResidueService.isDemoMode();
      
      toast.success('Inicio de sesión exitoso', {
        description: `Bienvenido ${loginData.usuario.nombre || loginData.usuario.usu_login} - ${loginData.cliente.nombre}${isDemoMode ? ' (Modo Demo)' : ''}`,
        duration: 3000,
      });

      // Show demo mode info on first login
      if (isDemoMode) {
        setTimeout(() => {
          toast.info('Modo Demostración Activo', {
            description: 'La aplicación usa datos de prueba. Cada cliente puede registrar y ver solo sus guías de retiro.',
            duration: 5000,
          });
        }, 1000);
      }

      return true;
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      
      let errorMessage = 'Error al iniciar sesión';
      let errorDescription = 'Verifica tus credenciales e intenta nuevamente';
      
      if (error.message.includes('Credenciales incorrectas') || error.message.includes('inactivo')) {
        errorMessage = error.message;
        errorDescription = 'Usa las credenciales de demostración disponibles';
      } else if (error.message.includes('fetch') || error.message.includes('network')) {
        errorMessage = 'Modo demo activado';
        errorDescription = 'No se puede conectar al servidor. Usando datos de demostración.';
      }
      
      toast.error(errorMessage, {
        description: errorDescription,
        duration: 4000,
      });

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      console.log('🚪 Logging out...');

      await ResidueService.logout();
      
      setUsuario(null);
      setCliente(null);
      
      console.log('✅ Logout successful');
      
      toast.success('Sesión cerrada correctamente', {
        description: 'Hasta luego',
        duration: 2000,
      });
    } catch (error) {
      console.error('Error during logout:', error);
      // Clear local state even if API call fails
      setUsuario(null);
      setCliente(null);
      localStorage.removeItem('residue_token');
      localStorage.removeItem('mock_user_id');
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    usuario,
    cliente,
    login,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}