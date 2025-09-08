import { Usuario, Cliente, GuiaResiduos, FacturaImpaga } from './ResidueService';

export class LocalDataService {
  private static _usuarios: Usuario[] | null = null;
  private static _clientes: Cliente[] | null = null;
  private static _guias: GuiaResiduos[] | null = null;
  private static _facturas: FacturaImpaga[] | null = null;

  // Cargar datos desde archivos JSON locales
  static async loadUsuarios(): Promise<Usuario[]> {
    if (this._usuarios) {
      console.log('📋 Usuarios ya cargados desde cache:', this._usuarios.length);
      return this._usuarios;
    }
    
    try {
      console.log('🔍 Cargando usuarios desde archivo JSON externo...');
      console.log('🌐 URL completa:', window.location.origin + '/data/usuarios.json');
      
      const response = await fetch('/data/usuarios.json', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        cache: 'no-cache'
      });
      
      console.log('📡 Respuesta del servidor:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('Archivo de usuarios vacío o formato incorrecto');
      }
      
      this._usuarios = data;
      console.log('✅ Usuarios cargados desde archivo JSON externo:', this._usuarios.length);
      console.log('📋 Usuarios disponibles:', this._usuarios.map(u => ({ 
        id: u.id,
        login: u.usu_login, 
        nombre: u.nombre,
        clienteId: u.clienteId,
        activo: u.usu_activo
      })));
      
      return this._usuarios;
    } catch (error) {
      console.warn('⚠️ No se pudo cargar usuarios desde archivo JSON, usando datos integrados como fallback:', error.message);
      this._usuarios = this.getIntegratedUsuarios();
      console.log('✅ Usuarios cargados desde datos integrados (fallback):', this._usuarios.length);
      console.log('📋 Usuarios disponibles:', this._usuarios.map(u => ({ 
        id: u.id,
        login: u.usu_login, 
        nombre: u.nombre,
        clienteId: u.clienteId,
        activo: u.usu_activo
      })));
      
      return this._usuarios;
    }
  }

  static async loadClientes(): Promise<Cliente[]> {
    if (this._clientes) return this._clientes;
    
    try {
      console.log('🔍 Cargando clientes desde archivo JSON externo...');
      const response = await fetch('/data/clientes.json', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        cache: 'no-cache'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('Archivo de clientes vacío o formato incorrecto');
      }
      
      this._clientes = data;
      console.log('✅ Clientes cargados desde archivo JSON externo:', this._clientes.length);
      return this._clientes;
    } catch (error) {
      console.warn('⚠️ No se pudo cargar clientes desde archivo JSON, usando datos integrados como fallback:', error.message);
      this._clientes = this.getIntegratedClientes();
      console.log('✅ Clientes cargados desde datos integrados (fallback):', this._clientes.length);
      return this._clientes;
    }
  }

  static async loadGuias(): Promise<GuiaResiduos[]> {
    if (this._guias) return this._guias;
    
    try {
      console.log('🔍 Cargando guías desde archivo JSON externo...');
      const response = await fetch('/data/guias.json', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        cache: 'no-cache'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('Archivo de guías vacío o formato incorrecto');
      }
      
      this._guias = data;
      console.log('✅ Guías cargadas desde archivo JSON externo:', this._guias.length);
      return this._guias;
    } catch (error) {
      console.warn('⚠️ No se pudo cargar guías desde archivo JSON, usando datos integrados como fallback:', error.message);
      this._guias = this.getIntegratedGuias();
      console.log('✅ Guías cargadas desde datos integrados (fallback):', this._guias.length);
      return this._guias;
    }
  }

  static async loadFacturas(): Promise<FacturaImpaga[]> {
    if (this._facturas) return this._facturas;
    
    try {
      console.log('🔍 Cargando facturas desde archivo JSON externo...');
      const response = await fetch('/data/facturas-impagas.json', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        cache: 'no-cache'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('Archivo de facturas vacío o formato incorrecto');
      }
      
      this._facturas = data;
      console.log('✅ Facturas cargadas desde archivo JSON externo:', this._facturas.length);
      return this._facturas;
    } catch (error) {
      console.warn('⚠️ No se pudo cargar facturas desde archivo JSON, usando datos integrados como fallback:', error.message);
      this._facturas = this.getIntegratedFacturas();
      console.log('✅ Facturas cargadas desde datos integrados (fallback):', this._facturas.length);
      return this._facturas;
    }
  }

  // Métodos para obtener datos específicos
  static async findUsuarioByCredentials(username: string, password: string): Promise<Usuario | null> {
    console.log(`🔍 Buscando usuario: "${username}" con contraseña: "${password}"`);
    
    const usuarios = await this.loadUsuarios();
    console.log('📋 Usuarios disponibles:', usuarios.map(u => ({ 
      login: u.usu_login, 
      pwd: u.usu_pwd, 
      activo: u.usu_activo,
      clienteId: u.clienteId 
    })));
    
    const foundUser = usuarios.find(u => {
      const loginMatch = u.usu_login === username;
      const passwordMatch = u.usu_pwd === password;
      const isActive = u.usu_activo === 'SI';
      
      console.log(`🔍 Verificando usuario ${u.usu_login}:`, {
        loginMatch,
        passwordMatch,
        isActive,
        inputLogin: username,
        inputPassword: password,
        storedLogin: u.usu_login,
        storedPassword: u.usu_pwd,
        storedActive: u.usu_activo
      });
      
      return loginMatch && passwordMatch && isActive;
    });
    
    console.log('✅ Usuario encontrado:', foundUser ? { 
      login: foundUser.usu_login, 
      nombre: foundUser.nombre,
      clienteId: foundUser.clienteId 
    } : 'No encontrado');
    
    return foundUser || null;
  }

  static async findClienteById(clienteId: number): Promise<Cliente | null> {
    const clientes = await this.loadClientes();
    return clientes.find(c => c.id === clienteId) || null;
  }

  static async findUsuarioById(userId: number): Promise<Usuario | null> {
    const usuarios = await this.loadUsuarios();
    return usuarios.find(u => u.id === userId) || null;
  }

  static async getGuiasByClienteId(clienteId: number): Promise<GuiaResiduos[]> {
    const guias = await this.loadGuias();
    return guias.filter(g => g.clienteId === clienteId);
  }

  static async getFacturasByClienteId(clienteId: number): Promise<FacturaImpaga[]> {
    const facturas = await this.loadFacturas();
    return facturas.filter(f => f.clienteId === clienteId);
  }

  // Limpiar cache para forzar recarga
  static clearCache(): void {
    this._usuarios = null;
    this._clientes = null;
    this._guias = null;
    this._facturas = null;
    console.log('🧹 Cache de datos locales limpiado');
  }

  // Método para forzar recarga completa desde JSON
  static async forceReloadFromJSON(): Promise<void> {
    console.log('🔄 Forzando recarga completa desde archivos JSON...');
    this.clearCache();
    
    // Pre-cargar todos los datos para verificar que están disponibles
    await Promise.all([
      this.loadUsuarios(),
      this.loadClientes(),
      this.loadGuias(),
      this.loadFacturas()
    ]);
    
    console.log('✅ Recarga completa finalizada');
  }

  // Datos integrados (siempre disponibles)
  private static getIntegratedUsuarios(): Usuario[] {
    return [
      {
        id: 1,
        usu_login: 'copec_admin',
        usu_pwd: 'demo123',
        usu_activo: 'SI',
        clienteId: 57,
        nombre: 'María González',
        email: 'maria.gonzalez@copec.cl'
      },
      {
        id: 2,
        usu_login: 'copec_operador',
        usu_pwd: 'demo123',
        usu_activo: 'SI',
        clienteId: 57,
        nombre: 'Carlos Rodríguez',
        email: 'carlos.rodriguez@copec.cl'
      },
      {
        id: 3,
        usu_login: 'shell_admin',
        usu_pwd: 'demo123',
        usu_activo: 'SI',
        clienteId: 58,
        nombre: 'Ana Patricia Silva',
        email: 'ana.silva@shell.com'
      },
      {
        id: 4,
        usu_login: 'shell_supervisor',
        usu_pwd: 'demo123',
        usu_activo: 'SI',
        clienteId: 58,
        nombre: 'Roberto Mendoza',
        email: 'roberto.mendoza@shell.com'
      },
      {
        id: 5,
        usu_login: 'petrobras_admin',
        usu_pwd: 'demo123',
        usu_activo: 'SI',
        clienteId: 59,
        nombre: 'Fernando Castro',
        email: 'fernando.castro@petrobras.com'
      },
      {
        id: 6,
        usu_login: 'petrobras_operador',
        usu_pwd: 'demo123',
        usu_activo: 'NO',
        clienteId: 59,
        nombre: 'Luis Herrera',
        email: 'luis.herrera@petrobras.com'
      },
      {
        id: 7,
        usu_login: 'exxon_admin',
        usu_pwd: 'demo123',
        usu_activo: 'SI',
        clienteId: 60,
        nombre: 'Patricia Morales',
        email: 'patricia.morales@exxonmobil.com'
      },
      {
        id: 8,
        usu_login: 'exxon_finanzas',
        usu_pwd: 'demo123',
        usu_activo: 'SI',
        clienteId: 60,
        nombre: 'Andrés Vargas',
        email: 'andres.vargas@exxonmobil.com'
      },
      {
        id: 9,
        usu_login: 'copec_finanzas',
        usu_pwd: 'demo123',
        usu_activo: 'SI',
        clienteId: 57,
        nombre: 'Valentina López',
        email: 'valentina.lopez@copec.cl'
      },
      {
        id: 10,
        usu_login: 'shell_calidad',
        usu_pwd: 'demo123',
        usu_activo: 'SI',
        clienteId: 58,
        nombre: 'Sebastián Torres',
        email: 'sebastian.torres@shell.com'
      },
      {
        id: 11,
        usu_login: 'copec_avv',
        usu_pwd: 'demo123456',
        usu_activo: 'SI',
        clienteId: 57,
        nombre: 'Alvaro Vega',
        email: 'avega@copec.com'
      }
    ];
  }

  // Datos de fallback en caso de error (compatibilidad con el sistema anterior)
  private static getFallbackUsuarios(): Usuario[] {
    return this.getIntegratedUsuarios();
  }

  // Datos integrados de clientes
  private static getIntegratedClientes(): Cliente[] {
    return [
      {
        id: 57,
        nombre: 'COPEC',
        rut: '99.500.000-1',
        direccion: 'Av. El Bosque Norte 500, Las Condes, Santiago',
        telefono: '+56 2 2461 8000',
        email: 'contacto@copec.cl',
        tipo_cliente: 'Estaciones de Servicio'
      },
      {
        id: 58,
        nombre: 'SHELL',
        rut: '96.800.570-7',
        direccion: 'Av. Vitacura 2939, Las Condes, Santiago',
        telefono: '+56 2 2750 7000',
        email: 'contacto@shell.com',
        tipo_cliente: 'Estaciones de Servicio'
      },
      {
        id: 59,
        nombre: 'PETROBRAS',
        rut: '77.123.456-8',
        direccion: 'Av. Providencia 1208, Providencia, Santiago',
        telefono: '+56 2 2384 5000',
        email: 'contacto@petrobras.com',
        tipo_cliente: 'Estaciones de Servicio'
      },
      {
        id: 60,
        nombre: 'EXXON MOBIL',
        rut: '88.987.654-3',
        direccion: 'Av. Andrés Bello 2457, Providencia, Santiago',
        telefono: '+56 2 2290 3000',
        email: 'contacto@exxonmobil.com',
        tipo_cliente: 'Operaciones Industriales'
      }
    ];
  }

  private static getFallbackClientes(): Cliente[] {
    return this.getIntegratedClientes();
  }

  // Datos integrados de guías
  private static getIntegratedGuias(): GuiaResiduos[] {
    return [
      // COPEC (Cliente 57)
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
        valor_lt_adic: 15000,
        patente: 'DEF-456',
        total: 108818,
        observaciones: 'Retiro estación Los Carrera - Exceso de litros'
      },
      {
        id: 3,
        guia: '118',
        fecha: '2025-07-02',
        clienteId: 57,
        sucursal: 'COPEC MAIPÚ',
        servicio: 'RESIDUOS SOLIDOS POR RETIRO',
        frecuencia: 'QUINCENAL',
        lts_limite: 2500,
        lts_retirados: 2100,
        valor_servicio: 75500,
        valor_lt_adic: 0,
        patente: 'GHI-789',
        total: 75500,
        observaciones: 'Retiro estación Maipú'
      },
      {
        id: 4,
        guia: '119',
        fecha: '2025-07-03',
        clienteId: 57,
        sucursal: 'COPEC PROVIDENCIA',
        servicio: 'RESIDUOS PELIGROSOS',
        frecuencia: 'SEMANAL',
        lts_limite: 500,
        lts_retirados: 750,
        valor_servicio: 45000,
        valor_lt_adic: 8500,
        patente: 'JKL-012',
        total: 53500,
        observaciones: 'Retiro residuos peligrosos - Exceso controlado'
      },
      // SHELL (Cliente 58)
      {
        id: 5,
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
        id: 6,
        guia: 'SH002',
        fecha: '2025-07-06',
        clienteId: 58,
        sucursal: 'SHELL LAS CONDES',
        servicio: 'RESIDUOS SOLIDOS POR RETIRO',
        frecuencia: 'SEMANAL',
        lts_limite: 4000,
        lts_retirados: 4200,
        valor_servicio: 110000,
        valor_lt_adic: 2500,
        patente: 'SHL-101',
        total: 112500,
        observaciones: 'Retiro estación Las Condes - Leve exceso'
      },
      // PETROBRAS (Cliente 59)
      {
        id: 8,
        guia: 'PE001',
        fecha: '2025-07-08',
        clienteId: 59,
        sucursal: 'PETROBRAS CENTRO',
        servicio: 'RESIDUOS SOLIDOS POR RETIRO',
        frecuencia: 'MENSUAL',
        lts_limite: 3000,
        lts_retirados: 2800,
        valor_servicio: 95000,
        valor_lt_adic: 0,
        patente: 'PET-200',
        total: 95000,
        observaciones: 'Retiro estación centro'
      },
      {
        id: 9,
        guia: 'PE002',
        fecha: '2025-07-09',
        clienteId: 59,
        sucursal: 'PETROBRAS ÑUÑOA',
        servicio: 'RESIDUOS PELIGROSOS',
        frecuencia: 'QUINCENAL',
        lts_limite: 800,
        lts_retirados: 950,
        valor_servicio: 55000,
        valor_lt_adic: 7500,
        patente: 'PET-201',
        total: 62500,
        observaciones: 'Retiro residuos peligrosos - Exceso autorizado'
      },
      // EXXON MOBIL (Cliente 60)
      {
        id: 10,
        guia: 'EX001',
        fecha: '2025-07-10',
        clienteId: 60,
        sucursal: 'EXXON MOBIL SANTIAGO',
        servicio: 'RESIDUOS SOLIDOS POR RETIRO',
        frecuencia: 'SEMANAL',
        lts_limite: 6000,
        lts_retirados: 5500,
        valor_servicio: 150000,
        valor_lt_adic: 0,
        patente: 'EXX-300',
        total: 150000,
        observaciones: 'Retiro estación Santiago'
      }
    ];
  }

  private static getFallbackGuias(): GuiaResiduos[] {
    return this.getIntegratedGuias();
  }

  // Datos integrados de facturas impagas
  private static getIntegratedFacturas(): FacturaImpaga[] {
    return [
      // COPEC (Cliente 57)
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
        observaciones: 'Cliente no responde a llamadas'
      },
      {
        id: 2,
        fecha: '2025-06-20',
        empresa: 'COPEC',
        sucursal: 'COPEC LOS CARRERA',
        rut: '99.500.000-1',
        no_guia: '90003',
        dias_mora: 40,
        nro_factura: '7659',
        fecha_factura: '2025-06-20',
        clienteId: 57,
        monto_factura: 93818,
        estado_mora: 'Alta',
        observaciones: 'Pendiente autorización pago'
      },
      {
        id: 3,
        fecha: '2025-07-01',
        empresa: 'COPEC',
        sucursal: 'COPEC MAIPÚ',
        rut: '99.500.000-1',
        no_guia: '90004',
        dias_mora: 29,
        nro_factura: '7660',
        fecha_factura: '2025-07-01',
        clienteId: 57,
        monto_factura: 75500,
        estado_mora: 'Media',
        observaciones: 'Cliente solicitó extensión de plazo'
      },
      // SHELL (Cliente 58)
      {
        id: 5,
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
        observaciones: 'Contactar gerencia regional'
      },
      {
        id: 6,
        fecha: '2025-07-05',
        empresa: 'SHELL',
        sucursal: 'SHELL LAS CONDES',
        rut: '96.800.570-7',
        no_guia: 'SH002',
        dias_mora: 25,
        nro_factura: '8101',
        fecha_factura: '2025-07-05',
        clienteId: 58,
        monto_factura: 112500,
        estado_mora: 'Baja',
        observaciones: 'Pago programado para próxima semana'
      },
      // PETROBRAS (Cliente 59)
      {
        id: 8,
        fecha: '2025-06-30',
        empresa: 'PETROBRAS',
        sucursal: 'PETROBRAS CENTRO',
        rut: '77.123.456-8',
        no_guia: 'PE001',
        dias_mora: 30,
        nro_factura: '9200',
        fecha_factura: '2025-06-30',
        clienteId: 59,
        monto_factura: 95000,
        estado_mora: 'Media',
        observaciones: 'Cliente en proceso de reestructuración'
      },
      {
        id: 9,
        fecha: '2025-07-05',
        empresa: 'PETROBRAS',
        sucursal: 'PETROBRAS ÑUÑOA',
        rut: '77.123.456-8',
        no_guia: 'PE002',
        dias_mora: 25,
        nro_factura: '9201',
        fecha_factura: '2025-07-05',
        clienteId: 59,
        monto_factura: 62500,
        estado_mora: 'Baja',
        observaciones: 'Acuerdo de pago en 3 cuotas'
      },
      // EXXON MOBIL (Cliente 60)
      {
        id: 10,
        fecha: '2025-04-20',
        empresa: 'EXXON MOBIL',
        sucursal: 'EXXON MOBIL SANTIAGO',
        rut: '88.987.654-3',
        no_guia: 'EX-OLD-001',
        dias_mora: 107,
        nro_factura: '1500',
        fecha_factura: '2025-04-20',
        clienteId: 60,
        monto_factura: 180000,
        estado_mora: 'Crítica',
        observaciones: 'Cuenta bloqueada - gestión legal'
      }
    ];
  }

  private static getFallbackFacturas(): FacturaImpaga[] {
    return this.getIntegratedFacturas();
  }
}