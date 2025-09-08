// Interfaces for waste collection system
export interface Usuario {
  id: number;
  usu_login: string;
  usu_pwd: string;
  usu_activo: 'SI' | 'NO';
  clienteId: number;
  nombre?: string;
  email?: string;
}

export interface Cliente {
  id: number;
  nombre: string;
  rut?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  tipo_cliente?: string;
}

export interface GuiaResiduos {
  id: number;
  guia: string;
  fecha: string;
  clienteId: number;
  sucursal: string;
  servicio: string;
  frecuencia: string;
  lts_limite: number;
  lts_retirados: number;
  valor_servicio: number;
  valor_lt_adic: number;
  patente: string;
  total: number;
  observaciones?: string;
  created_at?: string;
  updated_at?: string;
}

// Nueva interfaz para facturas impagas
export interface FacturaImpaga {
  id: number;
  fecha: string;
  empresa: string;
  sucursal: string;
  rut: string;
  no_guia: string;
  dias_mora: number;
  nro_factura: string;
  fecha_factura: string;
  clienteId: number;
  monto_factura: number;
  estado_mora: 'Baja' | 'Media' | 'Alta' | 'Crítica';
  observaciones?: string;
}

export interface ResidueStats {
  totalGuias: number;
  litrosRetirados: number;
  valorTotal: number;
  promedioLitrosPorGuia: number;
  guiasPorServicio: { servicio: string; cantidad: number; litros: number }[];
  guiasPorSucursal: { sucursal: string; cantidad: number; litros: number; valor: number }[];
  guiasPorFrecuencia: { frecuencia: string; cantidad: number }[];
  tendenciaMensual: { mes: string; cantidad: number; litros: number; valor: number }[];
  eficienciaRetiro: number;
  // Nuevas estadísticas de facturación
  totalFacturasImpagas: number;
  montoTotalImpago: number;
  promedioMoraCliente: number;
  facturasVencidas: { criticas: number; altas: number; medias: number; bajas: number };
}

interface APIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  total?: number;
}

export class ResidueService {
  // Production API configuration
  private static readonly API_BASE_URL = 
    process.env.NODE_ENV === 'production'
      ? 'https://your-api-domain.com/api'  // Replace with your production API URL
      : 'http://localhost:3001/api';

  // Environment detection
  private static readonly IS_DEMO_MODE = 
    typeof window !== 'undefined' && 
    (window.location.hostname.includes('figma') ||
     window.location.hostname.includes('make') ||
     !navigator.onLine);

  private static _connectionTested = false;
  private static _isApiAvailable = false;

  // Helper function for API calls
  private static async callAPI<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    
    if (this.IS_DEMO_MODE) {
      console.log('🎭 Demo mode active - using mock data for:', endpoint);
      return await this.getMockDataFallback<T>(endpoint);
    }

    if (!this._connectionTested) {
      this._isApiAvailable = await this.testConnection();
      this._connectionTested = true;
    }

    if (!this._isApiAvailable) {
      console.log('📊 API unavailable - using mock data for:', endpoint);
      return await this.getMockDataFallback<T>(endpoint);
    }

    try {
      const token = localStorage.getItem('residue_token');
      
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
      return await this.getMockDataFallback<T>(endpoint);
    }
  }

  // Mock data - DATOS REALES BASADOS EN LA IMAGEN CON SUCURSALES
  private static readonly MOCK_USUARIOS: Usuario[] = [
    {
      id: 1,
      usu_login: 'admin@copec.cl',
      usu_pwd: 'demo123',
      usu_activo: 'SI',
      clienteId: 57,
      nombre: 'Administrador COPEC',
      email: 'admin@copec.cl'
    },
    {
      id: 2,
      usu_login: 'operador@shell.cl',
      usu_pwd: 'demo123',
      usu_activo: 'SI',
      clienteId: 58,
      nombre: 'Operador SHELL',
      email: 'operador@shell.cl'
    },
    {
      id: 3,
      usu_login: 'supervisor@petrobras.cl',
      usu_pwd: 'demo123',
      usu_activo: 'SI',
      clienteId: 59,
      nombre: 'Supervisor PETROBRAS',
      email: 'supervisor@petrobras.cl'
    }
  ];

  private static readonly MOCK_CLIENTES: Cliente[] = [
    {
      id: 57,
      nombre: 'COPEC',
      rut: '99.500.000-1',
      direccion: 'Av. El Golf 150, Las Condes',
      telefono: '+56 2 2461 7000',
      email: 'contacto@copec.cl',
      tipo_cliente: 'Estaciones de Servicio'
    },
    {
      id: 58,
      nombre: 'SHELL',
      rut: '96.800.570-7',
      direccion: 'Av. Apoquindo 3721, Las Condes',
      telefono: '+56 2 2750 3000',
      email: 'info@shell.cl',
      tipo_cliente: 'Estaciones de Servicio'
    },
    {
      id: 59,
      nombre: 'PETROBRAS',
      rut: '96.511.310-2',
      direccion: 'Av. Vitacura 2939, Las Condes',
      telefono: '+56 2 2422 5000',
      email: 'chile@petrobras.com',
      tipo_cliente: 'Estaciones de Servicio'
    }
  ];

  // Mock guías - BASADO EXACTAMENTE EN LA IMAGEN CON SUCURSALES DE COPEC
  private static readonly MOCK_GUIAS: GuiaResiduos[] = [
    // TODAS LAS GUÍAS PARA COPEC (ID: 57) CON SUCURSALES
    {
      id: 1,
      guia: '112',
      fecha: '2025-07-01',
      clienteId: 57,
      sucursal: 'COPEC PEDRO DE VALDIVIA',
      servicio: 'RESIDUOS SOLIDOS POR RETIRO',
      frecuencia: 'MENSUAL',
      lts_limite: 3300,
      lts_retirados: 3000,
      valor_servicio: 88299,
      valor_lt_adic: 0,
      patente: 'ABC-123',
      total: 88299,
      observaciones: 'Retiro estación Pedro de Valdivia'
    },
    {
      id: 2,
      guia: '117',
      fecha: '2025-07-01',
      clienteId: 57,
      sucursal: 'COPEC LOS CARRERA',
      servicio: 'RESIDUOS SOLIDOS POR RETIRO',
      frecuencia: 'MENSUAL',
      lts_limite: 1100,
      lts_retirados: 4000,
      valor_servicio: 93818,
      valor_lt_adic: 0,
      patente: 'DEF-456',
      total: 93818,
      observaciones: 'Retiro estación Los Carrera'
    },
    {
      id: 3,
      guia: '114',
      fecha: '2025-07-01',
      clienteId: 57,
      sucursal: 'COPEC PAICAVI',
      servicio: 'RESIDUOS SOLIDOS POR RETIRO',
      frecuencia: 'MENSUAL',
      lts_limite: 2200,
      lts_retirados: 3000,
      valor_servicio: 79941,
      valor_lt_adic: 0,
      patente: 'GHI-789',
      total: 79941,
      observaciones: 'Retiro estación Paicavi'
    },
    {
      id: 4,
      guia: '113',
      fecha: '2025-07-02',
      clienteId: 57,
      sucursal: 'COPEC PALOMARES',
      servicio: 'RESIDUOS SOLIDOS POR RETIRO',
      frecuencia: 'MENSUAL',
      lts_limite: 3300,
      lts_retirados: 4500,
      valor_servicio: 117612,
      valor_lt_adic: 0,
      patente: 'JKL-012',
      total: 117612,
      observaciones: 'Retiro estación Palomares'
    },
    {
      id: 5,
      guia: '110',
      fecha: '2025-07-02',
      clienteId: 57,
      sucursal: 'COPEC SAN CARLOS',
      servicio: 'RESIDUOS SOLIDOS POR RETIRO',
      frecuencia: 'MENSUAL',
      lts_limite: 4400,
      lts_retirados: 13000,
      valor_servicio: 104735,
      valor_lt_adic: 0,
      patente: 'MNO-345',
      total: 104735,
      observaciones: 'Retiro estación San Carlos'
    },
    {
      id: 6,
      guia: '118',
      fecha: '2025-07-02',
      clienteId: 57,
      sucursal: 'COPEC LOS ANGELES SUR',
      servicio: 'RESIDUOS SOLIDOS POR RETIRO',
      frecuencia: 'MENSUAL',
      lts_limite: 5500,
      lts_retirados: 15500,
      valor_servicio: 119691,
      valor_lt_adic: 0,
      patente: 'PQR-678',
      total: 119691,
      observaciones: 'Retiro estación Los Angeles Sur'
    },
    {
      id: 7,
      guia: '120',
      fecha: '2025-07-02',
      clienteId: 57,
      sucursal: 'COPEC LOS ANGELES CENTRO',
      servicio: 'RESIDUOS SOLIDOS POR RETIRO',
      frecuencia: 'MENSUAL',
      lts_limite: 1100,
      lts_retirados: 4000,
      valor_servicio: 101256,
      valor_lt_adic: 0,
      patente: 'STU-901',
      total: 101256,
      observaciones: 'Retiro estación Los Angeles Centro'
    },
    {
      id: 8,
      guia: '119',
      fecha: '2025-07-02',
      clienteId: 57,
      sucursal: 'COPEC LOS ANGELES NORTE',
      servicio: 'RESIDUOS SOLIDOS POR RETIRO',
      frecuencia: 'MENSUAL',
      lts_limite: 4400,
      lts_retirados: 15000,
      valor_servicio: 124250,
      valor_lt_adic: 0,
      patente: 'VWX-234',
      total: 124250,
      observaciones: 'Retiro estación Los Angeles Norte'
    },
    {
      id: 9,
      guia: '109',
      fecha: '2025-07-02',
      clienteId: 57,
      sucursal: 'COPEC TALCAHUANO',
      servicio: 'RESIDUOS SOLIDOS POR RETIRO',
      frecuencia: 'MENSUAL',
      lts_limite: 2200,
      lts_retirados: 4000,
      valor_servicio: 90179,
      valor_lt_adic: 0,
      patente: 'YZA-567',
      total: 90179,
      observaciones: 'Retiro estación Talcahuano'
    },
    {
      id: 10,
      guia: '125',
      fecha: '2025-07-03',
      clienteId: 57,
      sucursal: 'COPEC ALEMANIA A',
      servicio: 'RESIDUOS SOLIDOS POR RETIRO',
      frecuencia: 'MENSUAL',
      lts_limite: 2200,
      lts_retirados: 4000,
      valor_servicio: 44709,
      valor_lt_adic: 0,
      patente: 'BCD-890',
      total: 44709,
      observaciones: 'Retiro estación Alemania A'
    },
    {
      id: 11,
      guia: '121',
      fecha: '2025-07-02',
      clienteId: 57,
      sucursal: 'COPEC CONCEPCION',
      servicio: 'RESIDUOS SOLIDOS POR RETIRO',
      frecuencia: 'MENSUAL',
      lts_limite: 3300,
      lts_retirados: 7000,
      valor_servicio: 108774,
      valor_lt_adic: 0,
      patente: 'EFG-123',
      total: 108774,
      observaciones: 'Retiro estación Concepción'
    },
    {
      id: 12,
      guia: '116',
      fecha: '2025-07-02',
      clienteId: 57,
      sucursal: 'COPEC MARQUINA',
      servicio: 'RESIDUOS SOLIDOS POR RETIRO',
      frecuencia: 'MENSUAL',
      lts_limite: 4400,
      lts_retirados: 6000,
      valor_servicio: 119651,
      valor_lt_adic: 0,
      patente: 'HIJ-456',
      total: 119651,
      observaciones: 'Retiro estación Marquina'
    },
    {
      id: 13,
      guia: '124',
      fecha: '2025-07-02',
      clienteId: 57,
      sucursal: 'COPEC FREIRE',
      servicio: 'RESIDUOS SOLIDOS POR RETIRO',
      frecuencia: 'MENSUAL',
      lts_limite: 5500,
      lts_retirados: 14000,
      valor_servicio: 110454,
      valor_lt_adic: 0,
      patente: 'KLM-789',
      total: 110454,
      observaciones: 'Retiro estación Freire'
    },
    {
      id: 14,
      guia: '108',
      fecha: '2025-07-02',
      clienteId: 57,
      sucursal: 'COPEC VICTORIA',
      servicio: 'RESIDUOS SOLIDOS POR RETIRO',
      frecuencia: 'MENSUAL',
      lts_limite: 6600,
      lts_retirados: 10000,
      valor_servicio: 129929,
      valor_lt_adic: 0,
      patente: 'NOP-012',
      total: 129929,
      observaciones: 'Retiro estación Victoria'
    },
    {
      id: 15,
      guia: '122',
      fecha: '2025-07-02',
      clienteId: 57,
      sucursal: 'COPEC LAUTARO',
      servicio: 'RESIDUOS SOLIDOS POR RETIRO',
      frecuencia: 'MENSUAL',
      lts_limite: 5500,
      lts_retirados: 9000,
      valor_servicio: 45949,
      valor_lt_adic: 0,
      patente: 'QRS-345',
      total: 45949,
      observaciones: 'Retiro estación Lautaro'
    },

    // CLIENTE SHELL (ID: 58) - Datos diferentes
    {
      id: 16,
      guia: 'SH001',
      fecha: '2025-07-05',
      clienteId: 58,
      sucursal: 'SHELL PROVIDENCIA',
      servicio: 'RESIDUOS SOLIDOS POR RETIRO',
      frecuencia: 'SEMANAL',
      lts_limite: 5000,
      lts_retirados: 4800,
      valor_servicio: 125000,
      valor_lt_adic: 0,
      patente: 'SHL-100',
      total: 125000,
      observaciones: 'Retiro estación Providencia'
    },
    {
      id: 17,
      guia: 'SH002',
      fecha: '2025-07-06',
      clienteId: 58,
      sucursal: 'SHELL LAS CONDES',
      servicio: 'RESIDUOS SOLIDOS POR RETIRO',
      frecuencia: 'SEMANAL',
      lts_limite: 6000,
      lts_retirados: 5500,
      valor_servicio: 145000,
      valor_lt_adic: 0,
      patente: 'SHL-200',
      total: 145000,
      observaciones: 'Retiro estación Las Condes'
    },

    // CLIENTE PETROBRAS (ID: 59) - Datos diferentes
    {
      id: 18,
      guia: 'PB001',
      fecha: '2025-07-07',
      clienteId: 59,
      sucursal: 'PETROBRAS VITACURA',
      servicio: 'RESIDUOS SOLIDOS POR RETIRO',
      frecuencia: 'QUINCENAL',
      lts_limite: 4000,
      lts_retirados: 3800,
      valor_servicio: 95000,
      valor_lt_adic: 0,
      patente: 'PTB-300',
      total: 95000,
      observaciones: 'Retiro estación Vitacura'
    },
    {
      id: 19,
      guia: 'PB002',
      fecha: '2025-07-08',
      clienteId: 59,
      sucursal: 'PETROBRAS HUECHURABA',
      servicio: 'RESIDUOS SOLIDOS POR RETIRO',
      frecuencia: 'QUINCENAL',
      lts_limite: 3500,
      lts_retirados: 3200,
      valor_servicio: 85000,
      valor_lt_adic: 0,
      patente: 'PTB-400',
      total: 85000,
      observaciones: 'Retiro estación Huechuraba'
    }
  ];

  // MOCK FACTURAS IMPAGAS - BASADO EN LA IMAGEN
  private static readonly MOCK_FACTURAS_IMPAGAS: FacturaImpaga[] = [
    // COPEC (Cliente 57) - Facturas vencidas
    {
      id: 1,
      fecha: '2025-06-15',
      empresa: 'COPEC',
      sucursal: 'COPEC PEDRO DE VALDIVIA',
      rut: '99.500.000-1',
      no_guia: '90002',
      dias_mora: 45,
      nro_factura: '7658',
      fecha_factura: '2025-06-15',
      clienteId: 57,
      monto_factura: 88299,
      estado_mora: 'Alta',
      observaciones: 'Cliente no responde'
    },
    {
      id: 2,
      fecha: '2025-06-18',
      empresa: 'COPEC',
      sucursal: 'COPEC LOS CARRERA',
      rut: '99.500.000-1',
      no_guia: '90734',
      dias_mora: 42,
      nro_factura: '7660',
      fecha_factura: '2025-06-18',
      clienteId: 57,
      monto_factura: 93818,
      estado_mora: 'Alta',
      observaciones: 'En proceso de cobranza'
    },
    {
      id: 3,
      fecha: '2025-06-20',
      empresa: 'COPEC',
      sucursal: 'COPEC PAICAVI',
      rut: '99.500.000-1',
      no_guia: '90051',
      dias_mora: 40,
      nro_factura: '7662',
      fecha_factura: '2025-06-20',
      clienteId: 57,
      monto_factura: 79941,
      estado_mora: 'Media',
      observaciones: 'Seguimiento telefónico'
    },
    {
      id: 4,
      fecha: '2025-07-01',
      empresa: 'COPEC',
      sucursal: 'COPEC PALOMARES',
      rut: '99.500.000-1',
      no_guia: '90563',
      dias_mora: 29,
      nro_factura: '7665',
      fecha_factura: '2025-07-01',
      clienteId: 57,
      monto_factura: 117612,
      estado_mora: 'Media',
      observaciones: 'Compromiso de pago'
    },
    {
      id: 5,
      fecha: '2025-07-05',
      empresa: 'COPEC',
      sucursal: 'COPEC SAN CARLOS',
      rut: '99.500.000-1',
      no_guia: '90114',
      dias_mora: 25,
      nro_factura: '7668',
      fecha_factura: '2025-07-05',
      clienteId: 57,
      monto_factura: 104735,
      estado_mora: 'Baja',
      observaciones: 'Recibido'
    },
    {
      id: 6,
      fecha: '2025-05-10',
      empresa: 'COPEC',
      sucursal: 'COPEC LOS ANGELES SUR',
      rut: '99.500.000-1',
      no_guia: '90157',
      dias_mora: 81,
      nro_factura: '7515',
      fecha_factura: '2025-05-10',
      clienteId: 57,
      monto_factura: 119691,
      estado_mora: 'Crítica',
      observaciones: 'Derivado a cobranza judicial'
    },
    {
      id: 7,
      fecha: '2025-07-10',
      empresa: 'COPEC',
      sucursal: 'COPEC CONCEPCION',
      rut: '99.500.000-1',
      no_guia: '90574',
      dias_mora: 20,
      nro_factura: '7675',
      fecha_factura: '2025-07-10',
      clienteId: 57,
      monto_factura: 108774,
      estado_mora: 'Baja',
      observaciones: 'En proceso'
    },

    // SHELL (Cliente 58) - Pocas facturas pero con mora
    {
      id: 8,
      fecha: '2025-06-25',
      empresa: 'SHELL',
      sucursal: 'SHELL PROVIDENCIA',
      rut: '96.800.570-7',
      no_guia: 'SH001',
      dias_mora: 35,
      nro_factura: '8100',
      fecha_factura: '2025-06-25',
      clienteId: 58,
      monto_factura: 125000,
      estado_mora: 'Media',
      observaciones: 'Contactar gerencia'
    },
    {
      id: 9,
      fecha: '2025-07-15',
      empresa: 'SHELL',
      sucursal: 'SHELL LAS CONDES',
      rut: '96.800.570-7',
      no_guia: 'SH002',
      dias_mora: 15,
      nro_factura: '8105',
      fecha_factura: '2025-07-15',
      clienteId: 58,
      monto_factura: 145000,
      estado_mora: 'Baja',
      observaciones: 'Recordatorio enviado'
    },

    // PETROBRAS (Cliente 59) - Una factura crítica
    {
      id: 10,
      fecha: '2025-04-20',
      empresa: 'PETROBRAS',
      sucursal: 'PETROBRAS VITACURA',
      rut: '96.511.310-2',
      no_guia: 'PB001',
      dias_mora: 101,
      nro_factura: '9200',
      fecha_factura: '2025-04-20',
      clienteId: 59,
      monto_factura: 95000,
      estado_mora: 'Crítica',
      observaciones: 'Cuenta por cobrar problemática'
    }
  ];

  private static async getMockDataFallback<T>(endpoint: string): Promise<APIResponse<T>> {
    console.log('📊 Processing mock data for endpoint:', endpoint);
    
    if (endpoint.includes('/auth/login')) {
      return { success: false, data: null as T, error: 'Use mockLogin method' };
    }
    
    if (endpoint.includes('/informes/guias/stats')) {
      const clienteIdMatch = endpoint.match(/clienteId=(\d+)/);
      const clienteId = clienteIdMatch ? parseInt(clienteIdMatch[1]) : 57;
      
      console.log(`💰 Calculating stats for cliente ${clienteId}`);
      const stats = await this.calculateMockStats(clienteId);
      
      return { success: true, data: stats as T };
    }
    
    if (endpoint.includes('/informes/facturas-impagas')) {
      const clienteIdMatch = endpoint.match(/clienteId=(\d+)/);
      const clienteId = clienteIdMatch ? parseInt(clienteIdMatch[1]) : 57;
      
      console.log(`💳 Filtering facturas impagas for cliente ${clienteId}`);
      
      const { LocalDataService } = await import('./LocalDataService');
      const filteredFacturas = await LocalDataService.getFacturasByClienteId(clienteId);
      
      console.log(`✅ Cliente ${clienteId} puede ver ${filteredFacturas.length} facturas impagas`);
      
      return { success: true, data: filteredFacturas as T, total: filteredFacturas.length };
    }
    
    if (endpoint.includes('/informes/guias')) {
      const clienteIdMatch = endpoint.match(/clienteId=(\d+)/);
      const clienteId = clienteIdMatch ? parseInt(clienteIdMatch[1]) : 57;
      
      console.log(`🗑️ Filtering guías for cliente ${clienteId}`);
      
      const { LocalDataService } = await import('./LocalDataService');
      const filteredGuias = await LocalDataService.getGuiasByClienteId(clienteId);
      
      console.log(`✅ Cliente ${clienteId} puede ver ${filteredGuias.length} guías`);
      
      return { success: true, data: filteredGuias as T, total: filteredGuias.length };
    }
    
    if (endpoint.includes('/informes/clientes')) {
      const { LocalDataService } = await import('./LocalDataService');
      const clientes = await LocalDataService.loadClientes();
      return { success: true, data: clientes as T };
    }
    
    if (endpoint.includes('/auth/me')) {
      const mockUserId = localStorage.getItem('mock_user_id');
      const userId = mockUserId ? parseInt(mockUserId) : 1;
      
      const { LocalDataService } = await import('./LocalDataService');
      const usuario = await LocalDataService.findUsuarioById(userId);
      const cliente = usuario ? await LocalDataService.findClienteById(usuario.clienteId) : null;
      
      if (!usuario || !cliente) {
        return { success: false, data: null as T, error: 'Usuario o cliente no encontrado' };
      }
      
      console.log(`👤 Current user: ${usuario.usu_login} (cliente: ${cliente.nombre})`);
      
      return { success: true, data: { usuario, cliente } as T };
    }
    
    return { success: true, data: [] as T };
  }

  private static async calculateMockStats(clienteId: number): Promise<ResidueStats> {
    const { LocalDataService } = await import('./LocalDataService');
    const guiasCliente = await LocalDataService.getGuiasByClienteId(clienteId);
    const facturasCliente = await LocalDataService.getFacturasByClienteId(clienteId);
    
    console.log(`📊 Calculating stats for cliente ${clienteId}: ${guiasCliente.length} guías found`);
    
    const totalGuias = guiasCliente.length;
    const litrosRetirados = guiasCliente.reduce((sum, g) => sum + g.lts_retirados, 0);
    const valorTotal = guiasCliente.reduce((sum, g) => sum + g.total, 0);
    const promedioLitrosPorGuia = totalGuias > 0 ? litrosRetirados / totalGuias : 0;

    // Calcular eficiencia de retiro
    const totalLimite = guiasCliente.reduce((sum, g) => sum + g.lts_limite, 0);
    const eficienciaRetiro = totalLimite > 0 ? (litrosRetirados / totalLimite) * 100 : 100;

    // Group by servicio
    const serviciosCount = guiasCliente.reduce((acc, g) => {
      const servicio = g.servicio;
      if (!acc[servicio]) {
        acc[servicio] = { cantidad: 0, litros: 0 };
      }
      acc[servicio].cantidad += 1;
      acc[servicio].litros += g.lts_retirados;
      return acc;
    }, {} as Record<string, { cantidad: number; litros: number }>);

    const guiasPorServicio = Object.entries(serviciosCount)
      .map(([servicio, data]) => ({ servicio, cantidad: data.cantidad, litros: data.litros }))
      .sort((a, b) => b.cantidad - a.cantidad);

    // Group by sucursal
    const sucursalesCount = guiasCliente.reduce((acc, g) => {
      const sucursal = g.sucursal;
      if (!acc[sucursal]) {
        acc[sucursal] = { cantidad: 0, litros: 0, valor: 0 };
      }
      acc[sucursal].cantidad += 1;
      acc[sucursal].litros += g.lts_retirados;
      acc[sucursal].valor += g.total;
      return acc;
    }, {} as Record<string, { cantidad: number; litros: number; valor: number }>);

    const guiasPorSucursal = Object.entries(sucursalesCount)
      .map(([sucursal, data]) => ({ sucursal, cantidad: data.cantidad, litros: data.litros, valor: data.valor }))
      .sort((a, b) => b.valor - a.valor);

    // Group by frecuencia
    const frecuenciaCount = guiasCliente.reduce((acc, g) => {
      const frecuencia = g.frecuencia;
      acc[frecuencia] = (acc[frecuencia] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const guiasPorFrecuencia = Object.entries(frecuenciaCount)
      .map(([frecuencia, cantidad]) => ({ frecuencia, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad);

    // Mock monthly trend
    const tendenciaMensual = [
      { 
        mes: 'Jun', 
        cantidad: Math.floor(totalGuias * 0.8), 
        litros: Math.floor(litrosRetirados * 0.75),
        valor: Math.floor(valorTotal * 0.8)
      },
      { 
        mes: 'Jul', 
        cantidad: totalGuias, 
        litros: litrosRetirados,
        valor: valorTotal
      }
    ];

    // Estadísticas de facturas impagas
    const totalFacturasImpagas = facturasCliente.length;
    const montoTotalImpago = facturasCliente.reduce((sum, f) => sum + f.monto_factura, 0);
    const promedioMoraCliente = facturasCliente.length > 0 
      ? facturasCliente.reduce((sum, f) => sum + f.dias_mora, 0) / facturasCliente.length 
      : 0;

    const facturasVencidas = {
      criticas: facturasCliente.filter(f => f.estado_mora === 'Crítica').length,
      altas: facturasCliente.filter(f => f.estado_mora === 'Alta').length,
      medias: facturasCliente.filter(f => f.estado_mora === 'Media').length,
      bajas: facturasCliente.filter(f => f.estado_mora === 'Baja').length
    };

    const stats = {
      totalGuias,
      litrosRetirados,
      valorTotal,
      promedioLitrosPorGuia,
      guiasPorServicio,
      guiasPorSucursal,
      guiasPorFrecuencia,
      tendenciaMensual,
      eficienciaRetiro,
      totalFacturasImpagas,
      montoTotalImpago,
      promedioMoraCliente,
      facturasVencidas
    };

    console.log(`📊 Stats for cliente ${clienteId}:`, {
      totalGuias: stats.totalGuias,
      litrosRetirados: stats.litrosRetirados,
      valorTotal: stats.valorTotal,
      sucursales: stats.guiasPorSucursal.length,
      eficiencia: stats.eficienciaRetiro.toFixed(1) + '%',
      facturasImpagas: stats.totalFacturasImpagas,
      montoImpago: stats.montoTotalImpago
    });

    return stats;
  }

  // Authentication methods
  static async login(username: string, password: string): Promise<{usuario: Usuario, cliente: Cliente, token: string}> {
    console.log('🔐 Attempting login for:', username);

    if (this.IS_DEMO_MODE || !this._isApiAvailable) {
      return await this.mockLogin(username, password);
    }

    try {
      const response = await this.callAPI<{usuario: Usuario, cliente: Cliente, token: string}>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ 
          usu_login: username, 
          usu_pwd: password 
        }),
      });

      if (response.success && response.data.token) {
        localStorage.setItem('residue_token', response.data.token);
        console.log('✅ Production login successful:', { 
          usuario: response.data.usuario.usu_login, 
          cliente: response.data.cliente.nombre 
        });
        return response.data;
      }
      
      throw new Error(response.error || 'Login failed');
    } catch (error) {
      console.log('API login failed, using demo mode:', error.message);
      return await this.mockLogin(username, password);
    }
  }

  private static async mockLogin(username: string, password: string): Promise<{usuario: Usuario, cliente: Cliente, token: string}> {
    console.log('🎭 Using demo login for:', username);

    // Importar LocalDataService dinámicamente para evitar problemas de dependencias circulares
    const { LocalDataService } = await import('./LocalDataService');

    const usuario = await LocalDataService.findUsuarioByCredentials(username, password);

    if (!usuario) {
      console.log('❌ Usuario no encontrado o inactivo para:', username);
      throw new Error('Credenciales incorrectas o usuario inactivo');
    }

    const cliente = await LocalDataService.findClienteById(usuario.clienteId);

    if (!cliente) {
      console.log('❌ Cliente no encontrado para clienteId:', usuario.clienteId);
      throw new Error('Cliente no encontrado');
    }

    const token = 'mock-token-' + Date.now();
    localStorage.setItem('residue_token', token);
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
        await this.callAPI('/auth/logout', { 
          method: 'POST'
        });
      }
    } catch (error) {
      // Ignore logout errors in demo mode
    } finally {
      localStorage.removeItem('residue_token');
      localStorage.removeItem('mock_user_id');
    }
  }

  static async getCurrentUser(): Promise<{usuario: Usuario, cliente: Cliente} | null> {
    try {
      const token = localStorage.getItem('residue_token');
      if (!token) return null;

      if (token.startsWith('mock-token-') || this.IS_DEMO_MODE) {
        const mockUserId = localStorage.getItem('mock_user_id');
        const userId = mockUserId ? parseInt(mockUserId) : 1;
        
        // Importar LocalDataService dinámicamente
        const { LocalDataService } = await import('./LocalDataService');
        
        const usuario = await LocalDataService.findUsuarioById(userId);
        const cliente = usuario ? await LocalDataService.findClienteById(usuario.clienteId) : null;
        
        if (usuario && cliente) {
          console.log(`🔍 Current session: ${usuario.usu_login} -> ${cliente.nombre} (ID: ${cliente.id})`);
          return { usuario, cliente };
        }
        return null;
      }

      if (this._isApiAvailable) {
        const response = await this.callAPI<{usuario: Usuario, cliente: Cliente}>('/auth/me');
        
        if (response.success) {
          return response.data;
        }
      }
      
      return null;
    } catch (error) {
      console.warn('Get current user error, clearing session:', error.message);
      localStorage.removeItem('residue_token');
      localStorage.removeItem('mock_user_id');
      return null;
    }
  }

  // Data retrieval methods
  static async getGuiasByCliente(clienteId: number, filters?: {
    fechaInicio?: string;
    fechaFin?: string;
    servicio?: string;
    frecuencia?: string;
    sucursal?: string;
  }): Promise<GuiaResiduos[]> {
    console.log(`🗑️ Loading guías for cliente ${clienteId}...`);
    
    if (!clienteId || clienteId <= 0) {
      throw new Error('ID de cliente inválido');
    }

    // NUEVO: Usar ExternalDataService para leer desde JSON externo
    try {
      const { ExternalDataService } = await import('./ExternalDataService');
      const result = await ExternalDataService.getGuiasByCliente(clienteId, filters);
      console.log('🌐 Successfully loaded guías from external service');
      return result;
    } catch (externalError) {
      // Solo mostrar warning si no es por servicio deshabilitado
      if (!externalError.message.includes('disabled')) {
        console.warn('⚠️ External JSON failed, falling back to API/Mock:', externalError.message);
      }
      
      // Fallback al método original (API o mock)
      const params = new URLSearchParams();
      
      if (filters?.fechaInicio) params.append('fechaInicio', filters.fechaInicio);
      if (filters?.fechaFin) params.append('fechaFin', filters.fechaFin);
      if (filters?.servicio) params.append('servicio', filters.servicio);
      if (filters?.frecuencia) params.append('frecuencia', filters.frecuencia);
      if (filters?.sucursal) params.append('sucursal', filters.sucursal);

      const queryString = params.toString();
      const endpoint = `/informes/guias${queryString ? '?' + queryString : ''}`;
      
      const response = await this.callAPI<GuiaResiduos[]>(endpoint);
      
      if (response.success) {
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
  }

  static async getGuiaStats(clienteId: number): Promise<ResidueStats> {
    console.log(`📊 Calculating stats for cliente ${clienteId}...`);
    
    if (!clienteId || clienteId <= 0) {
      throw new Error('ID de cliente inválido');
    }

    // NUEVO: Usar ExternalDataService para calcular stats desde JSON externo
    try {
      const { ExternalDataService } = await import('./ExternalDataService');
      const result = await ExternalDataService.getGuiaStats(clienteId);
      console.log('🌐 Successfully calculated stats from external service');
      return result;
    } catch (externalError) {
      // Solo mostrar warning si no es por servicio deshabilitado
      if (!externalError.message.includes('disabled')) {
        console.warn('⚠️ External JSON failed for stats, falling back to API/Mock:', externalError.message);
      }
      
      // Fallback al método original (API o mock)
      const response = await this.callAPI<ResidueStats>(`/informes/guias/stats`);
      
      if (response.success) {
        console.log(`✅ Stats calculated for cliente ${clienteId}`);
        return response.data;
      }
      
      throw new Error(response.error || 'Error calculating stats');
    }
  }

  // NUEVOS MÉTODOS PARA FACTURAS IMPAGAS
  static async getFacturasImpagasByCliente(clienteId: number, filters?: {
    fechaInicio?: string;
    fechaFin?: string;
    sucursal?: string;
    estadoMora?: string;
    diasMoraMin?: number;
    diasMoraMax?: number;
  }): Promise<FacturaImpaga[]> {
    console.log(`💳 Loading facturas impagas for cliente ${clienteId}...`);
    
    if (!clienteId || clienteId <= 0) {
      throw new Error('ID de cliente inválido');
    }

    // NUEVO: Usar ExternalDataService para leer facturas desde JSON externo
    try {
      const { ExternalDataService } = await import('./ExternalDataService');
      const result = await ExternalDataService.getFacturasImpagasByCliente(clienteId, filters);
      console.log('🌐 Successfully loaded facturas from external service');
      return result;
    } catch (externalError) {
      // Solo mostrar warning si no es por servicio deshabilitado
      if (!externalError.message.includes('disabled')) {
        console.warn('⚠️ External JSON failed for facturas, falling back to API/Mock:', externalError.message);
      }
      
      // Fallback al método original (API o mock)
      const params = new URLSearchParams();
      
      if (filters?.fechaInicio) params.append('fechaInicio', filters.fechaInicio);
      if (filters?.fechaFin) params.append('fechaFin', filters.fechaFin);
      if (filters?.sucursal) params.append('sucursal', filters.sucursal);
      if (filters?.estadoMora) params.append('estadoMora', filters.estadoMora);
      if (filters?.diasMoraMin) params.append('diasMoraMin', filters.diasMoraMin.toString());
      if (filters?.diasMoraMax) params.append('diasMoraMax', filters.diasMoraMax.toString());

      const queryString = params.toString();
      const endpoint = `/informes/facturas-impagas${queryString ? '?' + queryString : ''}`;
      
      const response = await this.callAPI<FacturaImpaga[]>(endpoint);
      
      if (response.success) {
        const invalidFacturas = response.data.filter(f => f.clienteId !== clienteId);
        if (invalidFacturas.length > 0) {
          console.error('🚨 SECURITY ALERT: Found facturas from other clients!', invalidFacturas);
          throw new Error('Error de seguridad: datos de cliente incorrecta');
        }
        
        console.log(`✅ Loaded ${response.data.length} facturas impagas for cliente ${clienteId}`);
        return response.data;
      }
      
      throw new Error(response.error || 'Error loading facturas impagas');
    }
  }

  // Utility methods
  static async testConnection(): Promise<boolean> {
    if (this.IS_DEMO_MODE) {
      console.log('🎭 Demo mode - skipping connection test');
      return false;
    }

    try {
      console.log('🔌 Testing API connection...');
      
      const response = await fetch(`${this.API_BASE_URL.replace('/api', '')}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(5000) // 5 second timeout
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
    const token = localStorage.getItem('residue_token');
    const isDemo = this.IS_DEMO_MODE || token?.startsWith('mock-token-') || !this._isApiAvailable;
    
    return {
      apiUrl: this.API_BASE_URL || 'Demo Mode',
      hasToken: !!token,
      database: 'new_fadminspa_logis_paso',
      status: isDemo ? 'Demo Mode Active' : 'Production Ready',
      mode: isDemo ? 'demo' : 'production'
    };
  }

  // Formatting utilities
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

  static getEstadoMoraColor(estado: string): string {
    switch (estado) {
      case 'Crítica': return 'text-red-600 bg-red-50';
      case 'Alta': return 'text-orange-600 bg-orange-50';
      case 'Media': return 'text-yellow-600 bg-yellow-50';
      case 'Baja': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  }

  static getMoraVariant(estado: string): 'destructive' | 'default' | 'secondary' | 'outline' {
    switch (estado) {
      case 'Crítica': return 'destructive';
      case 'Alta': return 'default';
      case 'Media': return 'secondary';
      case 'Baja': return 'outline';
      default: return 'outline';
    }
  }

  // Get unique values for filters (AHORA CON SUCURSAL)
  static getUniqueFilterValues(guias: GuiaResiduos[]): {
    servicios: string[];
    frecuencias: string[];
    sucursales: string[];
  } {
    const servicios = [...new Set(
      guias.map(g => g.servicio).filter(servicio => servicio && servicio.trim() !== '')
    )] as string[];
    
    const frecuencias = [...new Set(
      guias.map(g => g.frecuencia).filter(frecuencia => frecuencia && frecuencia.trim() !== '')
    )] as string[];
    
    const sucursales = [...new Set(
      guias.map(g => g.sucursal).filter(sucursal => sucursal && sucursal.trim() !== '')
    )] as string[];

    return { servicios, frecuencias, sucursales };
  }

  static getUniqueFacturaFilterValues(facturas: FacturaImpaga[]): {
    sucursales: string[];
    estadosMora: string[];
  } {
    const sucursales = [...new Set(
      facturas.map(f => f.sucursal).filter(sucursal => sucursal && sucursal.trim() !== '')
    )] as string[];
    
    const estadosMora = [...new Set(
      facturas.map(f => f.estado_mora).filter(estado => estado && estado.trim() !== '')
    )] as string[];

    return { sucursales, estadosMora };
  }

  static isDemoMode(): boolean {
    return this.IS_DEMO_MODE || !this._isApiAvailable;
  }

  // Helper method to get client-specific data summary
  static getClientDataSummary(): {
    cliente57: { guias: number; litros: number; valor: number; sucursales: number; facturasImpagas: number };
    cliente58: { guias: number; litros: number; valor: number; sucursales: number; facturasImpagas: number };
    cliente59: { guias: number; litros: number; valor: number; sucursales: number; facturasImpagas: number };
  } {
    const cliente57Guias = this.MOCK_GUIAS.filter(g => g.clienteId === 57);
    const cliente58Guias = this.MOCK_GUIAS.filter(g => g.clienteId === 58);
    const cliente59Guias = this.MOCK_GUIAS.filter(g => g.clienteId === 59);
    
    const cliente57Facturas = this.MOCK_FACTURAS_IMPAGAS.filter(f => f.clienteId === 57);
    const cliente58Facturas = this.MOCK_FACTURAS_IMPAGAS.filter(f => f.clienteId === 58);
    const cliente59Facturas = this.MOCK_FACTURAS_IMPAGAS.filter(f => f.clienteId === 59);
    
    const sucursales57 = new Set(cliente57Guias.map(g => g.sucursal)).size;
    const sucursales58 = new Set(cliente58Guias.map(g => g.sucursal)).size;
    const sucursales59 = new Set(cliente59Guias.map(g => g.sucursal)).size;
    
    return {
      cliente57: {
        guias: cliente57Guias.length,
        litros: cliente57Guias.reduce((sum, g) => sum + g.lts_retirados, 0),
        valor: cliente57Guias.reduce((sum, g) => sum + g.total, 0),
        sucursales: sucursales57,
        facturasImpagas: cliente57Facturas.length
      },
      cliente58: {
        guias: cliente58Guias.length,
        litros: cliente58Guias.reduce((sum, g) => sum + g.lts_retirados, 0),
        valor: cliente58Guias.reduce((sum, g) => sum + g.total, 0),
        sucursales: sucursales58,
        facturasImpagas: cliente58Facturas.length
      },
      cliente59: {
        guias: cliente59Guias.length,
        litros: cliente59Guias.reduce((sum, g) => sum + g.lts_retirados, 0),
        valor: cliente59Guias.reduce((sum, g) => sum + g.total, 0),
        sucursales: sucursales59,
        facturasImpagas: cliente59Facturas.length
      }
    };
  }
}