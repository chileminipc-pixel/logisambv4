// Interfaces matching your real MariaDB database structure
export interface Usuario {
  id: number;
  usu_login: string;
  usu_pwd: string;
  usu_activo: 'SI' | 'NO';
  clienteId: number;
  nombre?: string;
  email?: string;
  rol?: string;
}

export interface Cliente {
  id: number;
  nombre: string;
  rut?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  logo?: string;
}

export interface Guia {
  id: number;
  fecha: string;
  numero_guia: string;
  clienteId: number;
  cliente_id?: number;
  cliente_nombre?: string;
  servicio?: string;
  origen?: string;
  destino?: string;
  volumen?: number;
  peso?: number;
  valor_declarado?: number;
  flete?: number;
  seguro?: number;
  otros_cargos?: number;
  total?: number;
  estado?: string;
  observaciones?: string;
  created_at?: string;
  updated_at?: string;
}

export interface GuiaStats {
  totalGuias: number;
  volumenTotal: number;
  pesoTotal: number;
  valorTotal: number;
  fleteTotal: number;
  guiasPorEstado: { estado: string; cantidad: number }[];
  guiasPorServicio: { servicio: string; cantidad: number }[];
  tendenciaMensual: { mes: string; cantidad: number; valor: number }[];
}

interface APIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  total?: number;
}

export class LogisticsService {
  // Real database connection configuration
  private static readonly DB_CONFIG = {
    host: 'livesoft.ddns.me',
    user: 'fadmin_fadmin',
    password: 'livesoft01',
    database: 'new_fadminspa_logis_paso',
    port: 3306
  };

  // Environment detection
  private static readonly IS_DEMO_MODE = 
    typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || 
     window.location.hostname.includes('figma') ||
     window.location.hostname.includes('make'));

  // API base URL (will be your backend endpoint)
  private static readonly API_BASE_URL = 
    this.IS_DEMO_MODE
      ? null // Skip API in demo mode
      : 'https://your-api-domain.com/api'; // Change to your actual API URL

  private static _connectionTested = false;
  private static _isApiAvailable = false;

  // Helper function for API calls
  private static async callAPI<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    
    // Skip API calls in demo mode
    if (this.IS_DEMO_MODE) {
      console.log('🎭 Demo mode active - using mock data for:', endpoint);
      return this.getMockDataFallback<T>(endpoint);
    }

    // Test connection first time
    if (!this._connectionTested) {
      this._isApiAvailable = await this.testConnection();
      this._connectionTested = true;
    }

    // If API not available, use mock data
    if (!this._isApiAvailable) {
      console.log('📊 API unavailable - using mock data for:', endpoint);
      return this.getMockDataFallback<T>(endpoint);
    }

    try {
      const token = localStorage.getItem('logistics_token');
      
      const defaultHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${this.API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.warn('⚠️ API call failed, falling back to mock data:', error.message);
      this._isApiAvailable = false;
      return this.getMockDataFallback<T>(endpoint);
    }
  }

  // Mock data for development/demo purposes - USANDO DATOS REALES DE LA IMAGEN
  private static readonly MOCK_USUARIOS: Usuario[] = [
    {
      id: 1,
      usu_login: 'admin@incean.com',
      usu_pwd: 'demo123',
      usu_activo: 'SI',
      clienteId: 93,
      nombre: 'María Elena Soto',
      email: 'admin@incean.com',
      rol: 'Administrador INCEAN'
    },
    {
      id: 2,
      usu_login: 'operador@acarlosangeles.com',
      usu_pwd: 'demo123',
      usu_activo: 'SI',
      clienteId: 58,
      nombre: 'Carlos Mendoza',
      email: 'operador@acarlosangeles.com',
      rol: 'Operador ACAR'
    },
    {
      id: 3,
      usu_login: 'supervisor@cocacola.com',
      usu_pwd: 'demo123',
      usu_activo: 'SI',
      clienteId: 68,
      nombre: 'Andrea Ruiz',
      email: 'supervisor@cocacola.com',
      rol: 'Supervisor Coca Cola'
    },
    {
      id: 4,
      usu_login: 'logistica@agroindustrias.com',
      usu_pwd: 'demo123',
      usu_activo: 'SI',
      clienteId: 61,
      nombre: 'Roberto Silva',
      email: 'logistica@agroindustrias.com',
      rol: 'Coordinador Logístico'
    }
  ];

  private static readonly MOCK_CLIENTES: Cliente[] = [
    {
      id: 93,
      nombre: 'INCEAN',
      rut: '96.500.000-1',
      direccion: 'Av. Industrial 1500, Santiago',
      telefono: '+56 2 2550 8000',
      email: 'contacto@incean.com'
    },
    {
      id: 58,
      nombre: 'ACAR LOS ANGELES',
      rut: '76.123.456-7',
      direccion: 'Ruta 5 Sur Km 502, Los Ángeles',
      telefono: '+56 43 2320 100',
      email: 'info@acarlosangeles.com'
    },
    {
      id: 59,
      nombre: 'NACAR LOS ANGELES',
      rut: '76.234.567-8',
      direccion: 'Av. Principal 890, Los Ángeles',
      telefono: '+56 43 2320 200',
      email: 'ventas@nacarlosangeles.com'
    },
    {
      id: 68,
      nombre: 'COCA COLA',
      rut: '90.150.000-K',
      direccion: 'Av. Vicuña Mackenna 1348, Santiago',
      telefono: '+56 2 2380 7000',
      email: 'chile@cocacola.com'
    },
    {
      id: 75,
      nombre: 'BORDE RIO',
      rut: '77.890.123-4',
      direccion: 'Camino Borde Río 2500, Temuco',
      telefono: '+56 45 2410 300',
      email: 'contacto@borderio.cl'
    },
    {
      id: 61,
      nombre: 'AGROINDUSTRIAS LOMAS COLORADAS',
      rut: '96.445.667-2',
      direccion: 'Fundo Lomas Coloradas, Rancagua',
      telefono: '+56 72 2890 500',
      email: 'ventas@lomascoloradas.cl'
    },
    {
      id: 152,
      nombre: 'PORTAL FRANCES',
      rut: '78.456.789-0',
      direccion: 'Portal Francés 1200, Las Condes',
      telefono: '+56 2 2750 4000',
      email: 'info@portalfrances.cl'
    },
    {
      id: 25,
      nombre: 'LOS CARRINEROS',
      rut: '76.112.334-5',
      direccion: 'Los Carrineros 567, Valparaíso',
      telefono: '+56 32 2450 800',
      email: 'logistica@loscarrineros.cl'
    }
  ];

  // Mock guías - USANDO DATOS REALES DE LA IMAGEN
  private static readonly MOCK_GUIAS: Guia[] = [
    // CLIENTE 93 - INCEAN
    {
      id: 1,
      fecha: '2025-06-02',
      numero_guia: 'INC-2025-001',
      clienteId: 93,
      cliente_id: 93,
      cliente_nombre: 'INCEAN',
      servicio: 'INCEAN',
      origen: 'Santiago',
      destino: 'Valparaíso',
      volumen: 33000,
      peso: 25000,
      valor_declarado: 18000000,
      flete: 550000,
      seguro: 180000,
      otros_cargos: 25000,
      total: 755000,
      estado: 'Entregado',
      observaciones: 'Entrega industrial programada'
    },
    {
      id: 11,
      fecha: '2025-06-03',
      numero_guia: 'INC-2025-002',
      clienteId: 93,
      cliente_id: 93,
      cliente_nombre: 'INCEAN',
      servicio: 'INCEAN',
      origen: 'Santiago',
      destino: 'Concepción',
      volumen: 41000,
      peso: 28000,
      valor_declarado: 22000000,
      flete: 680000,
      seguro: 220000,
      otros_cargos: 35000,
      total: 935000,
      estado: 'En Tránsito',
      observaciones: 'Carga especial - manipulación cuidadosa'
    },

    // CLIENTE 58 - ACAR LOS ANGELES
    {
      id: 2,
      fecha: '2025-06-02',
      numero_guia: 'ACR-2025-001',
      clienteId: 58,
      cliente_id: 58,
      cliente_nombre: 'ACAR LOS ANGELES',
      servicio: 'ACAR LOS ANGELES',
      origen: 'Los Ángeles',
      destino: 'Santiago',
      volumen: 44000,
      peso: 32000,
      valor_declarado: 26000000,
      flete: 720000,
      seguro: 260000,
      otros_cargos: 40000,
      total: 1020000,
      estado: 'Programado',
      observaciones: 'Transporte refrigerado requerido'
    },
    {
      id: 3,
      fecha: '2025-06-02',
      numero_guia: 'ACR-2025-002',
      clienteId: 58,
      cliente_id: 58,
      cliente_nombre: 'ACAR LOS ANGELES',
      servicio: 'ACAR LOS ANGELES',
      origen: 'Los Ángeles',
      destino: 'Temuco',
      volumen: 18000,
      peso: 12000,
      valor_declarado: 12000000,
      flete: 380000,
      seguro: 120000,
      otros_cargos: 18000,
      total: 518000,
      estado: 'En Tránsito',
      observaciones: 'Entrega urgente solicitada'
    },

    // CLIENTE 68 - COCA COLA
    {
      id: 4,
      fecha: '2025-06-02',
      numero_guia: 'COC-2025-001',
      clienteId: 68,
      cliente_id: 68,
      cliente_nombre: 'COCA COLA',
      servicio: 'COCA COLA',
      origen: 'Santiago',
      destino: 'Antofagasta',
      volumen: 35000,
      peso: 28000,
      valor_declarado: 20000000,
      flete: 850000,
      seguro: 200000,
      otros_cargos: 45000,
      total: 1095000,
      estado: 'Entregado',
      observaciones: 'Distribución bebidas - cadena de frío'
    },
    {
      id: 5,
      fecha: '2025-06-02',
      numero_guia: 'COC-2025-002',
      clienteId: 68,
      cliente_id: 68,
      cliente_nombre: 'COCA COLA',
      servicio: 'COCA COLA',
      origen: 'Santiago',
      destino: 'Valdivia',
      volumen: 28000,
      peso: 22000,
      valor_declarado: 16000000,
      flete: 620000,
      seguro: 160000,
      otros_cargos: 28000,
      total: 808000,
      estado: 'En Proceso',
      observaciones: 'Lote promocional temporada verano'
    },

    // CLIENTE 61 - AGROINDUSTRIAS LOMAS COLORADAS
    {
      id: 6,
      fecha: '2025-06-03',
      numero_guia: 'AGR-2025-001',
      clienteId: 61,
      cliente_id: 61,
      cliente_nombre: 'AGROINDUSTRIAS LOMAS COLORADAS',
      servicio: 'AGROINDUSTRIAS LOMAS COLORADAS',
      origen: 'Rancagua',
      destino: 'Puerto Montt',
      volumen: 162000,
      peso: 95000,
      valor_declarado: 45000000,
      flete: 1200000,
      seguro: 450000,
      otros_cargos: 85000,
      total: 1735000,
      estado: 'Programado',
      observaciones: 'Productos agroindustriales - manejo especializado'
    },
    {
      id: 8,
      fecha: '2025-06-04',
      numero_guia: 'AGR-2025-002',
      clienteId: 61,
      cliente_id: 61,
      cliente_nombre: 'AGROINDUSTRIAS LOMAS COLORADAS',
      servicio: 'AGROINDUSTRIAS LOMAS COLORADAS',
      origen: 'Rancagua',
      destino: 'Iquique',
      volumen: 88000,
      peso: 52000,
      valor_declarado: 28000000,
      flete: 950000,
      seguro: 280000,
      otros_cargos: 55000,
      total: 1285000,
      estado: 'En Tránsito',
      observaciones: 'Exportación vía puerto - documentos OK'
    },

    // CLIENTE 152 - PORTAL FRANCES
    {
      id: 9,
      fecha: '2025-06-04',
      numero_guia: 'PRT-2025-001',
      clienteId: 152,
      cliente_id: 152,
      cliente_nombre: 'PORTAL FRANCES',
      servicio: 'PORTAL FRANCES',
      origen: 'Las Condes',
      destino: 'Viña del Mar',
      volumen: 8500,
      peso: 4200,
      valor_declarado: 5500000,
      flete: 185000,
      seguro: 55000,
      otros_cargos: 12000,
      total: 252000,
      estado: 'Entregado',
      observaciones: 'Mercadería de lujo - manejo delicado'
    },

    // CLIENTE 25 - LOS CARRINEROS
    {
      id: 10,
      fecha: '2025-06-04',
      numero_guia: 'CAR-2025-001',
      clienteId: 25,
      cliente_id: 25,
      cliente_nombre: 'LOS CARRINEROS',
      servicio: 'LOS CARRINEROS',
      origen: 'Valparaíso',
      destino: 'Santiago',
      volumen: 28000,
      peso: 18500,
      valor_declarado: 15000000,
      flete: 420000,
      seguro: 150000,
      otros_cargos: 22000,
      total: 592000,
      estado: 'En Tránsito',
      observaciones: 'Consolidación múltiples pedidos'
    },
    {
      id: 12,
      fecha: '2025-06-02',
      numero_guia: 'CAR-2025-002',
      clienteId: 25,
      cliente_id: 25,
      cliente_nombre: 'LOS CARRINEROS',
      servicio: 'LOS CARRINEROS',
      origen: 'Valparaíso',
      destino: 'La Serena',
      volumen: 22000,
      peso: 14000,
      valor_declarado: 11000000,
      flete: 350000,
      seguro: 110000,
      otros_cargos: 18000,
      total: 478000,
      estado: 'Programado',
      observaciones: 'Ruta norte - coordinación especial'
    }
  ];

  private static getMockDataFallback<T>(endpoint: string): APIResponse<T> {
    console.log('📊 Processing mock data for endpoint:', endpoint);
    
    if (endpoint.includes('/auth/login')) {
      // This should not be reached as login is handled separately
      return { success: false, data: null as T, error: 'Use mockLogin method' };
    }
    
    if (endpoint.includes('/guias/stats')) {
      const clienteIdMatch = endpoint.match(/clienteId=(\d+)/);
      const clienteId = clienteIdMatch ? parseInt(clienteIdMatch[1]) : 93;
      
      console.log(`📊 Calculating stats for cliente ${clienteId}`);
      const stats = this.calculateMockStats(clienteId);
      
      return { success: true, data: stats as T };
    }
    
    if (endpoint.includes('/guias')) {
      const clienteIdMatch = endpoint.match(/clienteId=(\d+)/);
      const clienteId = clienteIdMatch ? parseInt(clienteIdMatch[1]) : 93;
      
      console.log(`🚛 Filtering guías for cliente ${clienteId}`);
      
      // FILTRADO CRÍTICO: Solo guías del cliente del usuario
      const filteredGuias = this.MOCK_GUIAS.filter(g => {
        const belongsToCliente = g.clienteId === clienteId;
        console.log(`Guía ${g.numero_guia}: clienteId=${g.clienteId}, requested=${clienteId}, included=${belongsToCliente}`);
        return belongsToCliente;
      });
      
      console.log(`✅ Cliente ${clienteId} puede ver ${filteredGuias.length} guías de ${this.MOCK_GUIAS.length} totales`);
      
      return { success: true, data: filteredGuias as T, total: filteredGuias.length };
    }
    
    if (endpoint.includes('/clientes')) {
      return { success: true, data: this.MOCK_CLIENTES as T };
    }
    
    if (endpoint.includes('/auth/me')) {
      // Return current user based on stored token
      const mockUserId = localStorage.getItem('mock_user_id');
      const userId = mockUserId ? parseInt(mockUserId) : 1;
      
      const usuario = this.MOCK_USUARIOS.find(u => u.id === userId) || this.MOCK_USUARIOS[0];
      const cliente = this.MOCK_CLIENTES.find(c => c.id === usuario.clienteId);
      
      console.log(`👤 Current user: ${usuario.usu_login} (cliente: ${cliente?.nombre})`);
      
      return { success: true, data: { usuario, cliente } as T };
    }
    
    return { success: true, data: [] as T };
  }

  private static calculateMockStats(clienteId: number): GuiaStats {
    // FILTRADO CRÍTICO: Solo incluir guías del cliente específico
    const guiasCliente = this.MOCK_GUIAS.filter(g => g.clienteId === clienteId);
    
    console.log(`📊 Calculating stats for cliente ${clienteId}: ${guiasCliente.length} guías found`);
    
    const totalGuias = guiasCliente.length;
    const volumenTotal = guiasCliente.reduce((sum, g) => sum + (g.volumen || 0), 0);
    const pesoTotal = guiasCliente.reduce((sum, g) => sum + (g.peso || 0), 0);
    const valorTotal = guiasCliente.reduce((sum, g) => sum + (g.total || 0), 0);
    const fleteTotal = guiasCliente.reduce((sum, g) => sum + (g.flete || 0), 0);

    // Group by estado - filter out null/undefined states
    const estadosCount = guiasCliente.reduce((acc, g) => {
      const estado = g.estado;
      if (estado && estado.trim() !== '') {
        acc[estado] = (acc[estado] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const guiasPorEstado = Object.entries(estadosCount)
      .map(([estado, cantidad]) => ({ estado, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad);

    // Group by servicio - filter out null/undefined services
    const serviciosCount = guiasCliente.reduce((acc, g) => {
      const servicio = g.servicio;
      if (servicio && servicio.trim() !== '') {
        acc[servicio] = (acc[servicio] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const guiasPorServicio = Object.entries(serviciosCount)
      .map(([servicio, cantidad]) => ({ servicio, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad);

    // Mock monthly trend based on current data
    const tendenciaMensual = [
      { mes: 'May', cantidad: Math.floor(totalGuias * 0.7), valor: Math.floor(valorTotal * 0.65) },
      { mes: 'Jun', cantidad: totalGuias, valor: valorTotal }
    ];

    const stats = {
      totalGuias,
      volumenTotal,
      pesoTotal,
      valorTotal,
      fleteTotal,
      guiasPorEstado,
      guiasPorServicio,
      tendenciaMensual
    };

    console.log(`📊 Stats for cliente ${clienteId}:`, {
      totalGuias: stats.totalGuias,
      valorTotal: stats.valorTotal,
      estados: stats.guiasPorEstado.length,
      servicios: stats.guiasPorServicio.length
    });

    return stats;
  }

  // Authentication methods
  static async login(username: string, password: string): Promise<{usuario: Usuario, cliente: Cliente, token: string}> {
    console.log('🔐 Attempting login for:', username);

    // In demo mode or if API unavailable, use mock login directly
    if (this.IS_DEMO_MODE || !this._isApiAvailable) {
      return this.mockLogin(username, password);
    }

    try {
      // Try API login first
      const response = await fetch(`${this.API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          usu_login: username, 
          usu_pwd: password 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.token) {
          localStorage.setItem('logistics_token', data.data.token);
          return data.data;
        }
      }
    } catch (error) {
      console.log('API login unavailable, using demo mode');
    }

    // Fallback to mock login
    return this.mockLogin(username, password);
  }

  private static mockLogin(username: string, password: string): {usuario: Usuario, cliente: Cliente, token: string} {
    console.log('🎭 Using demo login for:', username);

    // Find user by username and password
    const usuario = this.MOCK_USUARIOS.find(u => 
      u.usu_login === username && u.usu_pwd === password && u.usu_activo === 'SI'
    );

    if (!usuario) {
      throw new Error('Credenciales incorrectas o usuario inactivo');
    }

    const cliente = this.MOCK_CLIENTES.find(c => c.id === usuario.clienteId);

    if (!cliente) {
      throw new Error('Cliente no encontrado');
    }

    const token = 'mock-token-' + Date.now();
    localStorage.setItem('logistics_token', token);
    localStorage.setItem('mock_user_id', usuario.id.toString());

    console.log('✅ Demo login successful:', { 
      usuario: usuario.usu_login, 
      cliente: cliente.nombre,
      clienteId: cliente.id,
      userId: usuario.id
    });

    return { usuario, cliente, token };
  }

  static async logout(): Promise<void> {
    try {
      if (!this.IS_DEMO_MODE && this._isApiAvailable) {
        await fetch(`${this.API_BASE_URL}/auth/logout`, { 
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('logistics_token')}`
          }
        });
      }
    } catch (error) {
      // Ignore logout errors in demo mode
    } finally {
      localStorage.removeItem('logistics_token');
      localStorage.removeItem('mock_user_id');
    }
  }

  static async getCurrentUser(): Promise<{usuario: Usuario, cliente: Cliente} | null> {
    try {
      const token = localStorage.getItem('logistics_token');
      if (!token) return null;

      // If mock token or demo mode, return mock data
      if (token.startsWith('mock-token-') || this.IS_DEMO_MODE) {
        const mockUserId = localStorage.getItem('mock_user_id');
        const userId = mockUserId ? parseInt(mockUserId) : 1;
        
        const usuario = this.MOCK_USUARIOS.find(u => u.id === userId) || this.MOCK_USUARIOS[0];
        const cliente = this.MOCK_CLIENTES.find(c => c.id === usuario.clienteId);
        
        if (usuario && cliente) {
          console.log(`🔍 Current session: ${usuario.usu_login} -> ${cliente.nombre} (ID: ${cliente.id})`);
          return { usuario, cliente };
        }
        return null;
      }

      // Try API if available
      if (this._isApiAvailable) {
        const response = await fetch(`${this.API_BASE_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            return data.data;
          }
        }
      }
      
      return null;
    } catch (error) {
      console.warn('Get current user error, clearing session:', error.message);
      localStorage.removeItem('logistics_token');
      localStorage.removeItem('mock_user_id');
      return null;
    }
  }

  // Data retrieval methods - SEGURIDAD CRÍTICA: Siempre filtrar por cliente
  static async getGuiasByCliente(clienteId: number, filters?: {
    fechaInicio?: string;
    fechaFin?: string;
    estado?: string;
    servicio?: string;
    cliente?: string;
  }): Promise<Guia[]> {
    console.log(`🚛 Loading guías for cliente ${clienteId}...`);
    
    // VALIDACIÓN DE SEGURIDAD: Verificar que clienteId es válido
    if (!clienteId || clienteId <= 0) {
      throw new Error('ID de cliente inválido');
    }
    
    const params = new URLSearchParams();
    params.append('clienteId', clienteId.toString()); // SIEMPRE incluir clienteId
    
    if (filters?.fechaInicio) params.append('fechaInicio', filters.fechaInicio);
    if (filters?.fechaFin) params.append('fechaFin', filters.fechaFin);
    if (filters?.estado) params.append('estado', filters.estado);
    if (filters?.servicio) params.append('servicio', filters.servicio);
    if (filters?.cliente) params.append('cliente', filters.cliente);

    const queryString = params.toString();
    const endpoint = `/guias?${queryString}`;
    
    const response = await this.callAPI<Guia[]>(endpoint);
    
    if (response.success) {
      // DOBLE VALIDACIÓN: Verificar que todas las guías pertenecen al cliente
      const invalidGuias = response.data.filter(g => g.clienteId !== clienteId);
      if (invalidGuias.length > 0) {
        console.error('🚨 SECURITY ALERT: Found guías from other clients!', invalidGuias);
        throw new Error('Error de seguridad: datos de cliente incorrecta');
      }
      
      console.log(`✅ Loaded ${response.data.length} guías for cliente ${clienteId}`);
      return response.data;
    }
    
    throw new Error(response.error || 'Error loading guías');
  }

  static async getGuiaStats(clienteId: number): Promise<GuiaStats> {
    console.log(`📊 Calculating stats for cliente ${clienteId}...`);
    
    // VALIDACIÓN DE SEGURIDAD: Verificar que clienteId es válido
    if (!clienteId || clienteId <= 0) {
      throw new Error('ID de cliente inválido');
    }
    
    const response = await this.callAPI<GuiaStats>(`/guias/stats?clienteId=${clienteId}`);
    
    if (response.success) {
      console.log(`✅ Stats calculated for cliente ${clienteId}`);
      return response.data;
    }
    
    throw new Error(response.error || 'Error calculating stats');
  }

  // Utility methods
  static async testConnection(): Promise<boolean> {
    if (this.IS_DEMO_MODE) {
      console.log('🎭 Demo mode - skipping connection test');
      return false;
    }

    try {
      console.log('🔌 Testing database connection...');
      
      const response = await fetch(`${this.API_BASE_URL?.replace('/api', '') || ''}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Connection test successful:', data);
        return true;
      }
      
      return false;
    } catch (error) {
      console.log('⚠️ API connection test failed - using demo mode');
      return false;
    }
  }

  static getConnectionInfo(): { 
    apiUrl: string; 
    hasToken: boolean; 
    database: string; 
    status: string;
    mode: 'demo' | 'production';
  } {
    const token = localStorage.getItem('logistics_token');
    const isDemo = this.IS_DEMO_MODE || token?.startsWith('mock-token-') || !this._isApiAvailable;
    
    return {
      apiUrl: this.API_BASE_URL || 'Demo Mode',
      hasToken: !!token,
      database: this.DB_CONFIG.database,
      status: isDemo ? 'Demo Mode Active' : 'Production Ready',
      mode: isDemo ? 'demo' : 'production'
    };
  }

  // Export utilities
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  static formatNumber(num: number): string {
    return new Intl.NumberFormat('es-CL', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  }

  static formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  // Get unique values for filters (helper method) - FILTRAR POR CLIENTE
  static getUniqueFilterValues(guias: Guia[]): {
    estados: string[];
    servicios: string[];
    clientes: string[];
  } {
    const estados = [...new Set(
      guias.map(g => g.estado).filter(estado => estado && estado.trim() !== '')
    )] as string[];
    
    const servicios = [...new Set(
      guias.map(g => g.servicio).filter(servicio => servicio && servicio.trim() !== '')
    )] as string[];
    
    const clientes = [...new Set(
      guias.map(g => g.cliente_nombre).filter(cliente => cliente && cliente.trim() !== '')
    )] as string[];

    return { estados, servicios, clientes };
  }

  // Demo mode status
  static isDemoMode(): boolean {
    return this.IS_DEMO_MODE || !this._isApiAvailable;
  }

  // Helper method to get client-specific data summary
  static getClientDataSummary(): {
    cliente93: { guias: number; valor: number };
    cliente58: { guias: number; valor: number };
    cliente68: { guias: number; valor: number };
    cliente61: { guias: number; valor: number };
    cliente152: { guias: number; valor: number };
    cliente25: { guias: number; valor: number };
  } {
    const cliente93Guias = this.MOCK_GUIAS.filter(g => g.clienteId === 93);
    const cliente58Guias = this.MOCK_GUIAS.filter(g => g.clienteId === 58);
    const cliente68Guias = this.MOCK_GUIAS.filter(g => g.clienteId === 68);
    const cliente61Guias = this.MOCK_GUIAS.filter(g => g.clienteId === 61);
    const cliente152Guias = this.MOCK_GUIAS.filter(g => g.clienteId === 152);
    const cliente25Guias = this.MOCK_GUIAS.filter(g => g.clienteId === 25);
    
    return {
      cliente93: {
        guias: cliente93Guias.length,
        valor: cliente93Guias.reduce((sum, g) => sum + (g.total || 0), 0)
      },
      cliente58: {
        guias: cliente58Guias.length,
        valor: cliente58Guias.reduce((sum, g) => sum + (g.total || 0), 0)
      },
      cliente68: {
        guias: cliente68Guias.length,
        valor: cliente68Guias.reduce((sum, g) => sum + (g.total || 0), 0)
      },
      cliente61: {
        guias: cliente61Guias.length,
        valor: cliente61Guias.reduce((sum, g) => sum + (g.total || 0), 0)
      },
      cliente152: {
        guias: cliente152Guias.length,
        valor: cliente152Guias.reduce((sum, g) => sum + (g.total || 0), 0)
      },
      cliente25: {
        guias: cliente25Guias.length,
        valor: cliente25Guias.reduce((sum, g) => sum + (g.total || 0), 0)
      }
    };
  }
}