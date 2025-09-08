// Interfaz que coincide exactamente con tu estructura de tabla MariaDB
export interface RegistroInforme {
  id: number;
  fecha: string; // date en MariaDB se maneja como string en JS
  clienteId: number;
  servicioId: number;
  nombreCliente: string;
  nombreServicio: string;
  frecuencia: string;
  total: number;
  volRetrirado: number; // decimal
  volLimite: number;
  valorAdicional: number; // decimal
  montoAdicional: number; // decimal
}

// Interfaz para estadísticas empresariales
export interface EstadisticasEmpresa {
  totalRegistros: number;
  valorTotalGeneral: number;
  serviciosMasUsados: { servicioId: number; nombreServicio: string; cantidad: number }[];
  clientesMasActivos: { clienteId: number; nombreCliente: string; registros: number; valorTotal: number }[];
  volumenTotalRetirado: number;
  volumenLimiteTotal: number;
  montoAdicionalTotal: number;
  frecuenciaDistribucion: { frecuencia: string; cantidad: number }[];
}

// Interfaz para respuestas de la API
interface APIResponse<T> {
  success: boolean;
  data: T;
  total?: number;
  message?: string;
  error?: string;
}

export class DatabaseService {
  // Función helper para obtener la URL de la API de manera segura
  private static getApiUrl(): string {
    // Intentar obtener variables de entorno de manera segura
    let apiUrl = '';
    
    try {
      // Para Vite/Vercel (import.meta.env)
      if (typeof window !== 'undefined' && (window as any).ENV?.VITE_API_URL) {
        apiUrl = (window as any).ENV.VITE_API_URL;
      }
      // Para desarrollo con Vite
      else if (typeof import !== 'undefined' && import.meta?.env?.VITE_API_URL) {
        apiUrl = import.meta.env.VITE_API_URL;
      }
      // Fallback si no hay variables de entorno (Figma Make)
      else {
        apiUrl = 'https://tu-servidor.com/api'; // Cambiar por tu URL real
      }
    } catch (error) {
      // Si hay cualquier error accediendo a variables de entorno, usar fallback
      console.warn('⚠️ No se pudieron cargar variables de entorno, usando configuración por defecto');
      apiUrl = 'https://tu-servidor.com/api'; // Cambiar por tu URL real
    }

    return apiUrl;
  }

  // Detectar si estamos en modo desarrollo/demo
  private static isDemoMode(): boolean {
    try {
      const apiUrl = this.getApiUrl();
      const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';
      
      // Si estamos en Figma Make o la URL es la por defecto, usar modo demo
      return (
        currentHost.includes('figma') || 
        apiUrl.includes('tu-servidor.com') ||
        currentHost === 'localhost'
      );
    } catch (error) {
      // Si hay error detectando, asumir modo demo
      return true;
    }
  }

  // Función helper para hacer llamadas HTTP
  private static async callAPI<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    // Si estamos en modo demo, usar datos mock directamente
    if (this.isDemoMode()) {
      console.log('🎭 Modo demo activado - usando datos mock');
      return this.getMockDataFallback<T>(endpoint);
    }

    try {
      const apiUrl = this.getApiUrl();
      console.log(`🔗 Conectando a API: ${apiUrl}${endpoint}`);
      
      // Obtener token de autenticación
      const token = localStorage.getItem('authToken');
      
      const defaultHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${apiUrl}${endpoint}`, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log(`✅ API response for ${endpoint}:`, result);
      return result;
    } catch (error) {
      console.error('❌ API Call Error:', error);
      
      // Si hay error de conexión, usar datos mock como fallback
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.warn('🔄 API no disponible, usando datos mock como fallback');
        return this.getMockDataFallback<T>(endpoint);
      }
      
      throw error;
    }
  }

  // Datos mock como fallback cuando no hay conexión al backend
  private static readonly MOCK_DATA: RegistroInforme[] = [
    {
      id: 1,
      fecha: '2024-01-15',
      clienteId: 101,
      servicioId: 1,
      nombreCliente: 'Empresa ABC S.A.S.',
      nombreServicio: 'Transporte Terrestre',
      frecuencia: 'Semanal',
      total: 250000,
      volRetrirado: 1500.50,
      volLimite: 2000,
      valorAdicional: 50000.00,
      montoAdicional: 15000.00
    },
    {
      id: 2,
      fecha: '2024-01-20',
      clienteId: 102,
      servicioId: 2,
      nombreCliente: 'Corporación XYZ Ltda.',
      nombreServicio: 'Transporte Aéreo',
      frecuencia: 'Quincenal',
      total: 850000,
      volRetrirado: 750.25,
      volLimite: 1000,
      valorAdicional: 120000.00,
      montoAdicional: 35000.00
    },
    {
      id: 3,
      fecha: '2024-01-25',
      clienteId: 103,
      servicioId: 3,
      nombreServicio: 'Almacenamiento',
      nombreCliente: 'Industrias DEF S.A.',
      frecuencia: 'Mensual',
      total: 180000,
      volRetrirado: 2200.75,
      volLimite: 3000,
      valorAdicional: 25000.00,
      montoAdicional: 8000.00
    },
    {
      id: 4,
      fecha: '2024-02-01',
      clienteId: 101,
      servicioId: 1,
      nombreCliente: 'Empresa ABC S.A.S.',
      nombreServicio: 'Transporte Terrestre',
      frecuencia: 'Semanal',
      total: 275000,
      volRetrirado: 1650.00,
      volLimite: 2000,
      valorAdicional: 55000.00,
      montoAdicional: 18000.00
    },
    {
      id: 5,
      fecha: '2024-02-05',
      clienteId: 104,
      servicioId: 4,
      nombreCliente: 'Logística Global S.A.S.',
      nombreServicio: 'Transporte Marítimo',
      frecuencia: 'Diaria',
      total: 1200000,
      volRetrirado: 3500.00,
      volLimite: 4000,
      valorAdicional: 200000.00,
      montoAdicional: 75000.00
    },
    {
      id: 6,
      fecha: '2024-02-10',
      clienteId: 102,
      servicioId: 5,
      nombreCliente: 'Corporación XYZ Ltda.',
      nombreServicio: 'Courier Express',
      frecuencia: 'Diaria',
      total: 95000,
      volRetrirado: 125.50,
      volLimite: 200,
      valorAdicional: 15000.00,
      montoAdicional: 5000.00
    },
    {
      id: 7,
      fecha: '2024-02-12',
      clienteId: 105,
      servicioId: 1,
      nombreCliente: 'Transportes del Norte Ltda.',
      nombreServicio: 'Transporte Terrestre',
      frecuencia: 'Semanal',
      total: 320000,
      volRetrirado: 1800.00,
      volLimite: 2500,
      valorAdicional: 40000.00,
      montoAdicional: 12000.00
    },
    {
      id: 8,
      fecha: '2024-02-15',
      clienteId: 106,
      servicioId: 3,
      nombreCliente: 'Almacenes Centrales S.A.',
      nombreServicio: 'Almacenamiento',
      frecuencia: 'Mensual',
      total: 450000,
      volRetrirado: 2800.25,
      volLimite: 3500,
      valorAdicional: 60000.00,
      montoAdicional: 20000.00
    },
    {
      id: 9,
      fecha: '2024-02-18',
      clienteId: 101,
      servicioId: 2,
      nombreCliente: 'Empresa ABC S.A.S.',
      nombreServicio: 'Transporte Aéreo',
      frecuencia: 'Quincenal',
      total: 920000,
      volRetrirado: 850.75,
      volLimite: 1200,
      valorAdicional: 140000.00,
      montoAdicional: 45000.00
    },
    {
      id: 10,
      fecha: '2024-02-20',
      clienteId: 103,
      servicioId: 4,
      nombreCliente: 'Industrias DEF S.A.',
      nombreServicio: 'Transporte Marítimo',
      frecuencia: 'Mensual',
      total: 1100000,
      volRetrirado: 3200.50,
      volLimite: 4000,
      valorAdicional: 180000.00,
      montoAdicional: 65000.00
    }
  ];

  private static getMockDataFallback<T>(endpoint: string): APIResponse<T> {
    console.log('📊 Generando datos mock para endpoint:', endpoint);
    
    if (endpoint.includes('/estadisticas')) {
      const mockStats = this.calculateMockStatistics();
      return { success: true, data: mockStats as T };
    }
    
    if (endpoint.includes('/clientes')) {
      const clientes = this.MOCK_DATA.reduce((acc, r) => {
        if (!acc.find(c => c.clienteId === r.clienteId)) {
          acc.push({ clienteId: r.clienteId, nombreCliente: r.nombreCliente });
        }
        return acc;
      }, [] as {clienteId: number, nombreCliente: string}[]);
      return { success: true, data: clientes as T };
    }
    
    if (endpoint.includes('/servicios')) {
      const servicios = this.MOCK_DATA.reduce((acc, r) => {
        if (!acc.find(s => s.servicioId === r.servicioId)) {
          acc.push({ servicioId: r.servicioId, nombreServicio: r.nombreServicio });
        }
        return acc;
      }, [] as {servicioId: number, nombreServicio: string}[]);
      return { success: true, data: servicios as T };
    }
    
    return { success: true, data: this.MOCK_DATA as T, total: this.MOCK_DATA.length };
  }

  private static calculateMockStatistics(): EstadisticasEmpresa {
    const registros = this.MOCK_DATA;
    const totalRegistros = registros.length;
    const valorTotalGeneral = registros.reduce((sum, r) => sum + r.total + r.valorAdicional + r.montoAdicional, 0);
    const volumenTotalRetirado = registros.reduce((sum, r) => sum + r.volRetrirado, 0);
    const volumenLimiteTotal = registros.reduce((sum, r) => sum + r.volLimite, 0);
    const montoAdicionalTotal = registros.reduce((sum, r) => sum + r.montoAdicional, 0);

    const serviciosCount = registros.reduce((acc, r) => {
      const key = `${r.servicioId}_${r.nombreServicio}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const serviciosMasUsados = Object.entries(serviciosCount)
      .map(([key, cantidad]) => {
        const [servicioId, nombreServicio] = key.split('_');
        return { servicioId: parseInt(servicioId), nombreServicio, cantidad };
      })
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);

    const clientesStats = registros.reduce((acc, r) => {
      const key = `${r.clienteId}_${r.nombreCliente}`;
      if (!acc[key]) {
        acc[key] = { registros: 0, valorTotal: 0 };
      }
      acc[key].registros += 1;
      acc[key].valorTotal += r.total + r.valorAdicional + r.montoAdicional;
      return acc;
    }, {} as Record<string, { registros: number; valorTotal: number }>);

    const clientesMasActivos = Object.entries(clientesStats)
      .map(([key, stats]) => {
        const [clienteId, nombreCliente] = key.split('_');
        return { clienteId: parseInt(clienteId), nombreCliente, ...stats };
      })
      .sort((a, b) => b.valorTotal - a.valorTotal)
      .slice(0, 5);

    const frecuenciaCount = registros.reduce((acc, r) => {
      acc[r.frecuencia] = (acc[r.frecuencia] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const frecuenciaDistribucion = Object.entries(frecuenciaCount)
      .map(([frecuencia, cantidad]) => ({ frecuencia, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad);

    return {
      totalRegistros,
      valorTotalGeneral,
      serviciosMasUsados,
      clientesMasActivos,
      volumenTotalRetirado,
      volumenLimiteTotal,
      montoAdicionalTotal,
      frecuenciaDistribucion
    };
  }

  // Autenticación
  static async login(email: string, password: string): Promise<{user: any, empresa: any, token: string}> {
    // Si estamos en modo demo, usar autenticación local
    if (this.isDemoMode()) {
      return this.loginDemo(email, password);
    }

    try {
      const response = await this.callAPI<{user: any, empresa: any, token: string}>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (response.success && response.data.token) {
        // Guardar token en localStorage
        localStorage.setItem('authToken', response.data.token);
        return response.data;
      }

      throw new Error('Credenciales incorrectas');
    } catch (error) {
      console.error('Login error:', error);
      // Fallback a demo si falla la API
      return this.loginDemo(email, password);
    }
  }

  // Función de login demo
  private static loginDemo(email: string, password: string): {user: any, empresa: any, token: string} {
    const demoUsers = [
      {
        user: {
          id: 1,
          nombre: 'Juan Pérez',
          email: 'admin@empresa-abc.com',
          rol: 'Administrador',
          empresaId: 1
        },
        empresa: {
          id: 1,
          nombre: 'Empresa ABC S.A.S.',
          direccion: 'Calle 123 #45-67, Bogotá'
        }
      },
      {
        user: {
          id: 2,
          nombre: 'María García',
          email: 'admin@corporacion-xyz.com',
          rol: 'Administrador',
          empresaId: 2
        },
        empresa: {
          id: 2,
          nombre: 'Corporación XYZ Ltda.',
          direccion: 'Carrera 78 #90-12, Medellín'
        }
      },
      {
        user: {
          id: 3,
          nombre: 'Carlos López',
          email: 'gerente@industrias-def.com',
          rol: 'Gerente',
          empresaId: 3
        },
        empresa: {
          id: 3,
          nombre: 'Industrias DEF S.A.',
          direccion: 'Avenida 34 #56-78, Cali'
        }
      }
    ];

    if (password === 'demo123') {
      const demoUser = demoUsers.find(u => u.user.email === email);
      if (demoUser) {
        // Simular token para el modo demo
        const token = 'demo-token-' + Date.now();
        localStorage.setItem('authToken', token);
        
        return {
          ...demoUser,
          token
        };
      }
    }

    throw new Error('Credenciales incorrectas');
  }

  static async logout(): Promise<void> {
    try {
      if (!this.isDemoMode()) {
        await this.callAPI('/auth/logout', { method: 'POST' });
      }
    } catch (error) {
      console.warn('Logout error (ignorando):', error);
    } finally {
      localStorage.removeItem('authToken');
    }
  }

  static async getCurrentUser(): Promise<{user: any, empresa: any} | null> {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return null;

      // En modo demo, simular respuesta
      if (this.isDemoMode() || token.startsWith('demo-token-')) {
        // Retornar usuario demo basado en el timestamp del token
        return {
          user: {
            id: 1,
            nombre: 'Juan Pérez',
            email: 'admin@empresa-abc.com',
            rol: 'Administrador',
            empresaId: 1
          },
          empresa: {
            id: 1,
            nombre: 'Empresa ABC S.A.S.',
            direccion: 'Calle 123 #45-67, Bogotá'
          }
        };
      }

      const response = await this.callAPI<{user: any, empresa: any}>('/auth/me');
      
      if (response.success) {
        return response.data;
      }
      
      return null;
    } catch (error) {
      console.error('Get current user error:', error);
      // Limpiar token inválido
      localStorage.removeItem('authToken');
      return null;
    }
  }

  // Obtener todos los registros (filtrado por empresa)
  static async getRegistrosByEmpresa(empresaId: number): Promise<RegistroInforme[]> {
    try {
      console.log(`🔍 Loading data for empresa ${empresaId}...`);
      
      const response = await this.callAPI<RegistroInforme[]>('/informes');
      
      if (response.success) {
        console.log(`✅ Loaded ${response.data.length} registros`);
        return response.data;
      }
      
      throw new Error(response.error || 'Error obteniendo registros');
    } catch (error) {
      console.error('Error getting registros by empresa:', error);
      throw error;
    }
  }

  // Obtener registros filtrados por cliente específico
  static async getRegistrosByCliente(clienteId: number): Promise<RegistroInforme[]> {
    try {
      console.log(`🔍 Loading data for cliente ${clienteId}...`);
      
      const response = await this.callAPI<RegistroInforme[]>(`/informes?clienteId=${clienteId}`);
      
      if (response.success) {
        return response.data;
      }
      
      throw new Error(response.error || 'Error obteniendo registros por cliente');
    } catch (error) {
      console.error('Error getting registros by cliente:', error);
      throw error;
    }
  }

  // Obtener registros filtrados por servicio
  static async getRegistrosByServicio(servicioId: number): Promise<RegistroInforme[]> {
    try {
      console.log(`🔍 Loading data for servicio ${servicioId}...`);
      
      const response = await this.callAPI<RegistroInforme[]>(`/informes?servicioId=${servicioId}`);
      
      if (response.success) {
        return response.data;
      }
      
      throw new Error(response.error || 'Error obteniendo registros por servicio');
    } catch (error) {
      console.error('Error getting registros by servicio:', error);
      throw error;
    }
  }

  // Obtener estadísticas completas de la empresa
  static async getEstadisticasEmpresa(empresaId: number): Promise<EstadisticasEmpresa> {
    try {
      console.log(`📊 Calculating statistics for empresa ${empresaId}...`);
      
      const response = await this.callAPI<EstadisticasEmpresa>('/informes/estadisticas');
      
      if (response.success) {
        return response.data;
      }
      
      throw new Error(response.error || 'Error obteniendo estadísticas');
    } catch (error) {
      console.error('Error getting estadisticas:', error);
      throw error;
    }
  }

  // Obtener lista única de clientes para filtros
  static async getClientesUnicos(empresaId: number): Promise<{clienteId: number, nombreCliente: string}[]> {
    try {
      console.log(`👥 Loading unique clients for empresa ${empresaId}...`);
      
      const response = await this.callAPI<{clienteId: number, nombreCliente: string}[]>('/informes/clientes');
      
      if (response.success) {
        return response.data.sort((a, b) => a.nombreCliente.localeCompare(b.nombreCliente));
      }
      
      throw new Error(response.error || 'Error obteniendo clientes');
    } catch (error) {
      console.error('Error getting clientes:', error);
      throw error;
    }
  }

  // Obtener lista única de servicios para filtros
  static async getServiciosUnicos(): Promise<{servicioId: number, nombreServicio: string}[]> {
    try {
      console.log('🛠️ Loading unique services...');
      
      const response = await this.callAPI<{servicioId: number, nombreServicio: string}[]>('/informes/servicios');
      
      if (response.success) {
        return response.data.sort((a, b) => a.nombreServicio.localeCompare(b.nombreServicio));
      }
      
      throw new Error(response.error || 'Error obteniendo servicios');
    } catch (error) {
      console.error('Error getting servicios:', error);
      throw error;
    }
  }

  // Método para testing de conexión
  static async testConnection(): Promise<boolean> {
    if (this.isDemoMode()) {
      console.log('🎭 Demo mode - simulando conexión exitosa');
      return true;
    }

    try {
      console.log('🔌 Testing API connection...');
      
      const apiUrl = this.getApiUrl().replace('/api', '');
      const response = await fetch(`${apiUrl}/health`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API connection test successful:', data);
        return true;
      }
      
      return false;
    } catch (error) {
      console.warn('⚠️ API connection test failed, using demo mode:', error);
      return false;
    }
  }

  // Método para obtener información de conexión (para debugging)
  static getConnectionInfo(): { apiUrl: string; hasToken: boolean; status: string; mode: string } {
    const isDemo = this.isDemoMode();
    return {
      apiUrl: this.getApiUrl(),
      hasToken: !!localStorage.getItem('authToken'),
      status: isDemo ? 'Demo mode with mock data' : 'Connected to real MariaDB via API',
      mode: isDemo ? 'demo' : 'production'
    };
  }
}