// Servicio para leer datos de guías y facturas desde archivos JSON externos
// Este servicio reemplaza la lectura desde MariaDB por archivos JSON alojados en otro dominio

import {
  GuiaResiduos,
  FacturaImpaga,
  ResidueStats,
  Usuario,
  Cliente,
} from "./ResidueService";

interface ExternalDataConfig {
  baseUrl: string;
  guiasEndpoint: string;
  facturasEndpoint: string;
  clientesEndpoint?: string;
  usuariosEndpoint?: string;
}

interface APIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  total?: number;
}

export class ExternalDataService {
  // Configuración de URLs externas - ACTUALIZAR ESTAS URLs CON TUS DATOS REALES
  private static readonly EXTERNAL_CONFIG: ExternalDataConfig =
    {
      baseUrl: "https://livesoft.cl", // VACÍO = DESHABILITADO. Cambiar por tu dominio real para habilitar
      guiasEndpoint: "/data/guias.json",
      facturasEndpoint: "/data/facturas-impagas.json",
      clientesEndpoint: "/data/clientes.json",
      usuariosEndpoint: "/data/usuarios.json",
    };

  // URLs completas para los archivos JSON
  private static readonly GUIAS_URL = `${this.EXTERNAL_CONFIG.baseUrl}${this.EXTERNAL_CONFIG.guiasEndpoint}`;
  private static readonly FACTURAS_URL = `${this.EXTERNAL_CONFIG.baseUrl}${this.EXTERNAL_CONFIG.facturasEndpoint}`;
  private static readonly CLIENTES_URL = `${this.EXTERNAL_CONFIG.baseUrl}${this.EXTERNAL_CONFIG.clientesEndpoint}`;
  private static readonly USUARIOS_URL = `${this.EXTERNAL_CONFIG.baseUrl}${this.EXTERNAL_CONFIG.usuariosEndpoint}`;

  // Cache interno para evitar múltiples requests
  private static _guiasCache: GuiaResiduos[] | null = null;
  private static _facturasCache: FacturaImpaga[] | null = null;
  private static _clientesCache: Cliente[] | null = null;
  private static _usuariosCache: Usuario[] | null = null;
  private static _cacheExpiry = 0;
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  // Detectar si el JSON externo está disponible
  private static _externalAvailable: boolean | null = null;
  private static _fallbackToMock = false;

  /**
   * Verificar si el servicio externo está habilitado
   */
  private static isExternalEnabled(): boolean {
    return (
      this.EXTERNAL_CONFIG.baseUrl &&
      this.EXTERNAL_CONFIG.baseUrl.trim() !== ""
    );
  }

  /**
   * Función helper para hacer requests HTTP con manejo de CORS y errores
   */
  private static async fetchExternalData<T>(
    url: string,
  ): Promise<T> {
    // Verificar si el servicio externo está habilitado
    if (!this.isExternalEnabled()) {
      throw new Error(
        "External JSON service is disabled (baseUrl is empty)",
      );
    }

    try {
      console.log(`🌐 Fetching external data from: ${url}`);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        // Configuración para CORS
        mode: "cors",
        cache: "no-cache",
        // Timeout de 10 segundos
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        throw new Error(
          `HTTP Error: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      console.log(
        `✅ Successfully loaded external data from: ${url}`,
      );

      this._externalAvailable = true;
      return data as T;
    } catch (error) {
      // Solo mostrar warning si el servicio está habilitado y no es el primer intento
      if (this.isExternalEnabled() && this._externalAvailable !== false) {
        console.warn(
          `⚠️ Failed to load external data from ${url}:`,
          error.message,
        );
        console.info('🔄 Falling back to mock data automatically...');
      }

      // Marcar como no disponible
      this._externalAvailable = false;

      throw error;
    }
  }

  /**
   * Verificar si el cache está válido
   */
  private static isCacheValid(): boolean {
    return Date.now() < this._cacheExpiry;
  }

  /**
   * Limpiar cache
   */
  private static clearCache(): void {
    this._guiasCache = null;
    this._facturasCache = null;
    this._clientesCache = null;
    this._usuariosCache = null;
    this._cacheExpiry = 0;
  }

  /**
   * Obtener todas las guías desde el JSON externo
   */
  static async getAllGuias(): Promise<GuiaResiduos[]> {
    // Si el servicio externo no está habilitado, usar mock directamente
    if (!this.isExternalEnabled()) {
      console.log(
        "📦 External JSON service disabled, using mock data for guías",
      );
      return this.getMockGuias();
    }

    // Verificar cache primero
    if (this._guiasCache && this.isCacheValid()) {
      console.log("📦 Using cached guías data");
      return this._guiasCache;
    }

    try {
      // Intentar cargar desde JSON externo
      const guias = await this.fetchExternalData<
        GuiaResiduos[]
      >(this.GUIAS_URL);

      // Validar estructura de datos
      if (!Array.isArray(guias)) {
        throw new Error(
          "Invalid guías data format: expected array",
        );
      }

      // Verificar que cada guía tenga las propiedades necesarias
      const invalidGuias = guias.filter(
        (g) =>
          !g.id ||
          !g.guia ||
          !g.fecha ||
          !g.clienteId ||
          typeof g.clienteId !== "number",
      );

      if (invalidGuias.length > 0) {
        console.warn("⚠️ Found invalid guías:", invalidGuias);
      }

      // Guardar en cache
      this._guiasCache = guias;
      this._cacheExpiry = Date.now() + this.CACHE_DURATION;

      console.log(
        `✅ Loaded ${guias.length} guías from external JSON`,
      );
      return guias;
    } catch (error) {
      // Solo mostrar warning en el primer intento, luego es comportamiento esperado
      if (this.isExternalEnabled() && this._externalAvailable !== false) {
        console.warn(
          "⚠️ Could not load guías from external JSON:",
          error.message,
        );
      }

      // Fallback a datos mock
      console.log("🔄 Using mock data for guías (external source unavailable)");
      return this.getMockGuias();
    }
  }

  /**
   * Obtener todas las facturas impagas desde el JSON externo
   */
  static async getAllFacturasImpagas(): Promise<
    FacturaImpaga[]
  > {
    // Si el servicio externo no está habilitado, usar mock directamente
    if (!this.isExternalEnabled()) {
      console.log(
        "📦 External JSON service disabled, using mock data for facturas",
      );
      return this.getMockFacturas();
    }

    // Verificar cache primero
    if (this._facturasCache && this.isCacheValid()) {
      console.log("📦 Using cached facturas data");
      return this._facturasCache;
    }

    try {
      // Intentar cargar desde JSON externo
      const facturas = await this.fetchExternalData<
        FacturaImpaga[]
      >(this.FACTURAS_URL);

      // Validar estructura de datos
      if (!Array.isArray(facturas)) {
        throw new Error(
          "Invalid facturas data format: expected array",
        );
      }

      // Verificar que cada factura tenga las propiedades necesarias
      const invalidFacturas = facturas.filter(
        (f) =>
          !f.id ||
          !f.nro_factura ||
          !f.fecha ||
          !f.clienteId ||
          typeof f.clienteId !== "number",
      );

      if (invalidFacturas.length > 0) {
        console.warn(
          "⚠️ Found invalid facturas:",
          invalidFacturas,
        );
      }

      // Guardar en cache
      this._facturasCache = facturas;
      this._cacheExpiry = Date.now() + this.CACHE_DURATION;

      console.log(
        `✅ Loaded ${facturas.length} facturas from external JSON`,
      );
      return facturas;
    } catch (error) {
      // Solo mostrar warning en el primer intento, luego es comportamiento esperado
      if (this.isExternalEnabled() && this._externalAvailable !== false) {
        console.warn(
          "⚠️ Could not load facturas from external JSON:",
          error.message,
        );
      }

      // Fallback a datos mock
      console.log("🔄 Using mock data for facturas (external source unavailable)");
      return this.getMockFacturas();
    }
  }

  /**
   * Obtener guías filtradas por cliente
   */
  static async getGuiasByCliente(
    clienteId: number,
    filters?: {
      fechaInicio?: string;
      fechaFin?: string;
      servicio?: string;
      frecuencia?: string;
      sucursal?: string;
    },
  ): Promise<GuiaResiduos[]> {
    console.log(
      `🗑️ Loading guías for cliente ${clienteId} from external JSON...`,
    );

    if (!clienteId || clienteId <= 0) {
      throw new Error("ID de cliente inválido");
    }

    try {
      const todasLasGuias = await this.getAllGuias();

      // Filtrar por cliente
      let guiasCliente = todasLasGuias.filter(
        (g) => g.clienteId === clienteId,
      );

      // Aplicar filtros adicionales si se proporcionan
      if (filters) {
        if (filters.fechaInicio) {
          guiasCliente = guiasCliente.filter(
            (g) => g.fecha >= filters.fechaInicio!,
          );
        }

        if (filters.fechaFin) {
          guiasCliente = guiasCliente.filter(
            (g) => g.fecha <= filters.fechaFin!,
          );
        }

        if (filters.servicio) {
          guiasCliente = guiasCliente.filter((g) =>
            g.servicio
              .toLowerCase()
              .includes(filters.servicio!.toLowerCase()),
          );
        }

        if (filters.frecuencia) {
          guiasCliente = guiasCliente.filter(
            (g) =>
              g.frecuencia.toLowerCase() ===
              filters.frecuencia!.toLowerCase(),
          );
        }

        if (filters.sucursal) {
          guiasCliente = guiasCliente.filter((g) =>
            g.sucursal
              .toLowerCase()
              .includes(filters.sucursal!.toLowerCase()),
          );
        }
      }

      console.log(
        `✅ Filtered ${guiasCliente.length} guías for cliente ${clienteId}`,
      );
      return guiasCliente;
    } catch (error) {
      console.error(
        `Error loading guías for cliente ${clienteId}:`,
        error.message,
      );
      throw new Error(
        `No se pudieron cargar las guías: ${error.message}`,
      );
    }
  }

  /**
   * Obtener facturas impagas filtradas por cliente
   */
  static async getFacturasImpagasByCliente(
    clienteId: number,
    filters?: {
      fechaInicio?: string;
      fechaFin?: string;
      sucursal?: string;
      estadoMora?: string;
      diasMoraMin?: number;
      diasMoraMax?: number;
    },
  ): Promise<FacturaImpaga[]> {
    console.log(
      `💳 Loading facturas impagas for cliente ${clienteId} from external JSON...`,
    );

    if (!clienteId || clienteId <= 0) {
      throw new Error("ID de cliente inválido");
    }

    try {
      const todasLasFacturas =
        await this.getAllFacturasImpagas();

      // Filtrar por cliente
      let facturasCliente = todasLasFacturas.filter(
        (f) => f.clienteId === clienteId,
      );

      // Aplicar filtros adicionales si se proporcionan
      if (filters) {
        if (filters.fechaInicio) {
          facturasCliente = facturasCliente.filter(
            (f) => f.fecha >= filters.fechaInicio!,
          );
        }

        if (filters.fechaFin) {
          facturasCliente = facturasCliente.filter(
            (f) => f.fecha <= filters.fechaFin!,
          );
        }

        if (filters.sucursal) {
          facturasCliente = facturasCliente.filter((f) =>
            f.sucursal
              .toLowerCase()
              .includes(filters.sucursal!.toLowerCase()),
          );
        }

        if (filters.estadoMora) {
          facturasCliente = facturasCliente.filter(
            (f) =>
              f.estado_mora.toLowerCase() ===
              filters.estadoMora!.toLowerCase(),
          );
        }

        if (filters.diasMoraMin !== undefined) {
          facturasCliente = facturasCliente.filter(
            (f) => f.dias_mora >= filters.diasMoraMin!,
          );
        }

        if (filters.diasMoraMax !== undefined) {
          facturasCliente = facturasCliente.filter(
            (f) => f.dias_mora <= filters.diasMoraMax!,
          );
        }
      }

      console.log(
        `✅ Filtered ${facturasCliente.length} facturas impagas for cliente ${clienteId}`,
      );
      return facturasCliente;
    } catch (error) {
      console.error(
        `Error loading facturas for cliente ${clienteId}:`,
        error.message,
      );
      throw new Error(
        `No se pudieron cargar las facturas impagas: ${error.message}`,
      );
    }
  }

  /**
   * Calcular estadísticas basadas en los datos del JSON externo
   */
  static async getGuiaStats(
    clienteId: number,
  ): Promise<ResidueStats> {
    console.log(
      `📊 Calculating stats for cliente ${clienteId} from external data...`,
    );

    try {
      const [guiasCliente, facturasCliente] = await Promise.all(
        [
          this.getGuiasByCliente(clienteId),
          this.getFacturasImpagasByCliente(clienteId),
        ],
      );

      return this.calculateStatsFromData(
        guiasCliente,
        facturasCliente,
      );
    } catch (error) {
      console.error(
        `Error calculating stats for cliente ${clienteId}:`,
        error.message,
      );
      throw new Error(
        `No se pudieron calcular las estadísticas: ${error.message}`,
      );
    }
  }

  /**
   * Función helper para calcular estadísticas
   */
  private static calculateStatsFromData(
    guias: GuiaResiduos[],
    facturas: FacturaImpaga[],
  ): ResidueStats {
    const totalGuias = guias.length;
    const litrosRetirados = guias.reduce(
      (sum, g) => sum + g.lts_retirados,
      0,
    );
    const valorTotal = guias.reduce(
      (sum, g) => sum + g.total,
      0,
    );
    const promedioLitrosPorGuia =
      totalGuias > 0 ? litrosRetirados / totalGuias : 0;

    // Calcular eficiencia de retiro
    const totalLimite = guias.reduce(
      (sum, g) => sum + g.lts_limite,
      0,
    );
    const eficienciaRetiro =
      totalLimite > 0
        ? (litrosRetirados / totalLimite) * 100
        : 100;

    // Agrupar por servicio
    const serviciosCount = guias.reduce(
      (acc, g) => {
        const servicio = g.servicio;
        if (!acc[servicio]) {
          acc[servicio] = { cantidad: 0, litros: 0 };
        }
        acc[servicio].cantidad += 1;
        acc[servicio].litros += g.lts_retirados;
        return acc;
      },
      {} as Record<
        string,
        { cantidad: number; litros: number }
      >,
    );

    const guiasPorServicio = Object.entries(serviciosCount)
      .map(([servicio, data]) => ({
        servicio,
        cantidad: data.cantidad,
        litros: data.litros,
      }))
      .sort((a, b) => b.cantidad - a.cantidad);

    // Agrupar por sucursal
    const sucursalesCount = guias.reduce(
      (acc, g) => {
        const sucursal = g.sucursal;
        if (!acc[sucursal]) {
          acc[sucursal] = { cantidad: 0, litros: 0, valor: 0 };
        }
        acc[sucursal].cantidad += 1;
        acc[sucursal].litros += g.lts_retirados;
        acc[sucursal].valor += g.total;
        return acc;
      },
      {} as Record<
        string,
        { cantidad: number; litros: number; valor: number }
      >,
    );

    const guiasPorSucursal = Object.entries(sucursalesCount)
      .map(([sucursal, data]) => ({
        sucursal,
        cantidad: data.cantidad,
        litros: data.litros,
        valor: data.valor,
      }))
      .sort((a, b) => b.valor - a.valor);

    // Agrupar por frecuencia
    const frecuenciaCount = guias.reduce(
      (acc, g) => {
        const frecuencia = g.frecuencia;
        acc[frecuencia] = (acc[frecuencia] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const guiasPorFrecuencia = Object.entries(frecuenciaCount)
      .map(([frecuencia, cantidad]) => ({
        frecuencia,
        cantidad,
      }))
      .sort((a, b) => b.cantidad - a.cantidad);

    // Tendencia mensual (simplificada)
    const tendenciaMensual = [
      {
        mes: "Jun",
        cantidad: Math.floor(totalGuias * 0.8),
        litros: Math.floor(litrosRetirados * 0.75),
        valor: Math.floor(valorTotal * 0.8),
      },
      {
        mes: "Jul",
        cantidad: totalGuias,
        litros: litrosRetirados,
        valor: valorTotal,
      },
    ];

    // Estadísticas de facturas impagas
    const totalFacturasImpagas = facturas.length;
    const montoTotalImpago = facturas.reduce(
      (sum, f) => sum + f.monto_factura,
      0,
    );
    const promedioMoraCliente =
      facturas.length > 0
        ? facturas.reduce((sum, f) => sum + f.dias_mora, 0) /
          facturas.length
        : 0;

    const facturasVencidas = {
      criticas: facturas.filter(
        (f) => f.estado_mora === "Crítica",
      ).length,
      altas: facturas.filter((f) => f.estado_mora === "Alta")
        .length,
      medias: facturas.filter((f) => f.estado_mora === "Media")
        .length,
      bajas: facturas.filter((f) => f.estado_mora === "Baja")
        .length,
    };

    return {
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
      facturasVencidas,
    };
  }

  /**
   * Verificar disponibilidad del JSON externo
   */
  static async testExternalConnection(): Promise<boolean> {
    // Si el servicio no está habilitado, retornar false sin intentar conexión
    if (!this.isExternalEnabled()) {
      console.log(
        "🔌 External JSON service disabled (baseUrl is empty)",
      );
      this._externalAvailable = false;
      return false;
    }

    try {
      console.log("🔌 Testing external JSON connection...");

      // Probar con un simple HEAD request para no descargar datos
      const response = await fetch(this.GUIAS_URL, {
        method: "HEAD",
        mode: "cors",
        signal: AbortSignal.timeout(5000), // 5 segundos timeout
      });

      const isAvailable = response.ok;
      this._externalAvailable = isAvailable;

      if (isAvailable) {
        console.log("✅ External JSON connection successful");
      } else {
        console.log(
          "⚠️ External JSON not available, will use fallback",
        );
      }

      return isAvailable;
    } catch (error) {
      console.log(
        "⚠️ External JSON connection failed:",
        error.message,
      );
      this._externalAvailable = false;
      return false;
    }
  }

  /**
   * Obtener información de conexión para debugging
   */
  static getConnectionInfo(): {
    guiasUrl: string;
    facturasUrl: string;
    externalAvailable: boolean | null;
    cacheValid: boolean;
    mode: "external" | "fallback" | "disabled";
    enabled: boolean;
  } {
    const enabled = this.isExternalEnabled();
    return {
      guiasUrl: enabled
        ? this.GUIAS_URL
        : "Disabled (baseUrl is empty)",
      facturasUrl: enabled
        ? this.FACTURAS_URL
        : "Disabled (baseUrl is empty)",
      externalAvailable: enabled
        ? this._externalAvailable
        : null,
      cacheValid: this.isCacheValid(),
      mode: !enabled
        ? "disabled"
        : this._externalAvailable === false
          ? "fallback"
          : "external",
      enabled,
    };
  }

  /**
   * Limpiar cache manualmente
   */
  static invalidateCache(): void {
    this.clearCache();
    console.log("🗑️ External data cache cleared");
  }

  /**
   * Configurar URLs externas dinámicamente
   */
  static setExternalUrls(
    config: Partial<ExternalDataConfig>,
  ): void {
    Object.assign(this.EXTERNAL_CONFIG, config);
    this.clearCache(); // Limpiar cache al cambiar URLs
    this._externalAvailable = null; // Reset connection status

    console.log(
      "⚙️ External URLs updated:",
      this.EXTERNAL_CONFIG,
    );
  }

  // DATOS MOCK COMO FALLBACK - Importados del ResidueService
  private static getMockGuias(): GuiaResiduos[] {
    // Los mismos datos del ResidueService para compatibilidad
    return [
      {
        id: 1,
        guia: "112",
        fecha: "2025-07-01",
        clienteId: 57,
        sucursal: "COPEC PEDRO DE VALDIVIA",
        servicio: "RESIDUOS SOLIDOS POR RETIRO",
        frecuencia: "MENSUAL",
        lts_limite: 3300,
        lts_retirados: 3000,
        valor_servicio: 88299,
        valor_lt_adic: 0,
        patente: "ABC-123",
        total: 88299,
        observaciones: "Retiro estación Pedro de Valdivia",
      },
      {
        id: 2,
        guia: "117",
        fecha: "2025-07-01",
        clienteId: 57,
        sucursal: "COPEC LOS CARRERA",
        servicio: "RESIDUOS SOLIDOS POR RETIRO",
        frecuencia: "MENSUAL",
        lts_limite: 1100,
        lts_retirados: 4000,
        valor_servicio: 93818,
        valor_lt_adic: 0,
        patente: "DEF-456",
        total: 93818,
        observaciones: "Retiro estación Los Carrera",
      },
      {
        id: 16,
        guia: "SH001",
        fecha: "2025-07-05",
        clienteId: 58,
        sucursal: "SHELL PROVIDENCIA",
        servicio: "RESIDUOS SOLIDOS POR RETIRO",
        frecuencia: "SEMANAL",
        lts_limite: 5000,
        lts_retirados: 4800,
        valor_servicio: 125000,
        valor_lt_adic: 0,
        patente: "SHL-100",
        total: 125000,
        observaciones: "Retiro estación Providencia",
      },
    ];
  }

  private static getMockFacturas(): FacturaImpaga[] {
    // Los mismos datos del ResidueService para compatibilidad
    return [
      {
        id: 1,
        fecha: "2025-06-15",
        empresa: "COPEC",
        sucursal: "COPEC PEDRO DE VALDIVIA",
        rut: "99.500.000-1",
        no_guia: "90002",
        dias_mora: 45,
        nro_factura: "7658",
        fecha_factura: "2025-06-15",
        clienteId: 57,
        monto_factura: 88299,
        estado_mora: "Alta",
        observaciones: "Cliente no responde",
      },
      {
        id: 8,
        fecha: "2025-06-25",
        empresa: "SHELL",
        sucursal: "SHELL PROVIDENCIA",
        rut: "96.800.570-7",
        no_guia: "SH001",
        dias_mora: 35,
        nro_factura: "8100",
        fecha_factura: "2025-06-25",
        clienteId: 58,
        monto_factura: 125000,
        estado_mora: "Media",
        observaciones: "Contactar gerencia",
      },
    ];
  }
}