import { useState, useEffect } from 'react';
import { es } from 'date-fns/locale';
import { useAuth } from './AuthContext';
import { LogoLogisamb } from './LogoLogisamb';
import { ResidueService, type GuiaResiduos, type ResidueStats, type FacturaImpaga } from './services/ResidueService';
import { ExternalDataService } from './services/ExternalDataService';
import { ExternalDataTest } from './ExternalDataTest';
import { ResidueTable } from './ResidueTable';
import { FacturasImpagasTable } from './FacturasImpagasTable';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { toast } from 'sonner@2.0.3';
import { 
  LogOut, 
  Filter, 
  X, 
  TrendingUp, 
  Clipboard, 
  DollarSign,
  CalendarIcon,
  RefreshCw,
  DropletIcon,
  Building2,
  BarChart3,
  Users,
  AlertTriangle,
  CheckCircle,
  MapPin,
  FileText,
  Clock,
  CreditCard,
  Globe,
  Database
} from 'lucide-react';

export function ResidueDashboard() {
  const { usuario, cliente, logout } = useAuth();
  const [guias, setGuias] = useState<GuiaResiduos[]>([]);
  const [facturasImpagas, setFacturasImpagas] = useState<FacturaImpaga[]>([]);
  const [stats, setStats] = useState<ResidueStats | null>(null);
  const [filteredGuias, setFilteredGuias] = useState<GuiaResiduos[]>([]);
  const [filteredFacturas, setFilteredFacturas] = useState<FacturaImpaga[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('guias');
  const [connectionInfo, setConnectionInfo] = useState<any>(null);

  // Función para obtener las fechas del mes actual
  const getCurrentMonthDates = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    return {
      start: firstDay.toISOString().split('T')[0], // YYYY-MM-DD format
      end: lastDay.toISOString().split('T')[0]
    };
  };

  const currentMonth = getCurrentMonthDates();
  
  // Filter states para guías (CON SUCURSAL) - Filtrado por mes actual por defecto
  const [filtrosGuias, setFiltrosGuias] = useState({
    fechaInicio: currentMonth.start,
    fechaFin: currentMonth.end,
    servicio: '',
    frecuencia: '',
    sucursal: '',
    numeroGuia: ''
  });

  // Filter states para facturas impagas - Sin filtro de fecha por defecto
  const [filtrosFacturas, setFiltrosFacturas] = useState({
    fechaInicio: '',
    fechaFin: '',
    sucursal: '',
    estadoMora: '',
    diasMoraMin: '',
    diasMoraMax: ''
  });

  // Unique values for filter dropdowns
  const [uniqueValues, setUniqueValues] = useState({
    servicios: [] as string[],
    frecuencias: [] as string[],
    sucursales: [] as string[],
    estadosMora: [] as string[]
  });

  // Función para formatear fecha para mostrar
  const formatDisplayDate = (dateString: string): string => {
    if (!dateString) return 'Seleccionar fecha';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Componente selector de fecha
  const DatePicker = ({ 
    value, 
    onChange, 
    placeholder = 'Seleccionar fecha' 
  }: { 
    value: string; 
    onChange: (date: string) => void; 
    placeholder?: string;
  }) => {
    const [open, setOpen] = useState(false);
    const selectedDate = value ? new Date(value + 'T00:00:00') : undefined;

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={`w-full justify-start text-left font-normal ${!value ? 'text-muted-foreground' : ''}`}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? formatDisplayDate(value) : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3 border-b border-border">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Seleccionar fecha</p>
              {value && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onChange('');
                    setOpen(false);
                  }}
                  className="h-6 px-2 text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  Limpiar
                </Button>
              )}
            </div>
          </div>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              if (date) {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                onChange(`${year}-${month}-${day}`);
              } else {
                onChange('');
              }
              setOpen(false);
            }}
            initialFocus
            weekStartsOn={1} // Comenzar en lunes
            locale={es}
          />
        </PopoverContent>
      </Popover>
    );
  };

  // Load initial data
  useEffect(() => {
    if (usuario && cliente) {
      loadAllData();
    }
  }, [usuario, cliente]);

  const loadAllData = async () => {
    if (!usuario || !cliente) return;
    
    setIsLoading(true);
    try {
      console.log(`🔄 Loading data for cliente ${cliente.id} (${cliente.nombre})...`);
      
      // Update connection info
      const connInfo = ExternalDataService.getConnectionInfo();
      setConnectionInfo(connInfo);
      
      console.log(`📡 Data source mode: ${connInfo.mode} | External enabled: ${connInfo.enabled}`);
      
      // Load data in parallel - using External Data Service for newer hybrid approach
      const [guiasData, facturasData, statsData] = await Promise.all([
        ExternalDataService.getGuiasByCliente(cliente.id),
        ExternalDataService.getFacturasImpagasByCliente(cliente.id),
        ExternalDataService.getGuiaStats(cliente.id)
      ]);

      // VALIDACIÓN DE SEGURIDAD
      const invalidGuias = guiasData.filter(g => g.clienteId !== cliente.id);
      const invalidFacturas = facturasData.filter(f => f.clienteId !== cliente.id);
      
      if (invalidGuias.length > 0 || invalidFacturas.length > 0) {
        console.error('🚨 SECURITY VIOLATION: User can see other client data!', {
          invalidGuias: invalidGuias.length,
          invalidFacturas: invalidFacturas.length
        });
        toast.error('Error de seguridad detectado', {
          description: 'Se encontraron datos de otro cliente. Contacte al administrador.',
          duration: 5000,
        });
        return;
      }

      setGuias(guiasData);
      setFacturasImpagas(facturasData);
      setStats(statsData);
      
      // Extract unique values for filters
      const uniqueGuiaValues = ResidueService.getUniqueFilterValues(guiasData);
      const uniqueFacturaValues = ResidueService.getUniqueFacturaFilterValues(facturasData);
      
      setUniqueValues({
        ...uniqueGuiaValues,
        estadosMora: uniqueFacturaValues.estadosMora
      });
      
      console.log(`✅ Data loaded for cliente ${cliente.id}:`, {
        guias: guiasData.length,
        facturasImpagas: facturasData.length,
        servicios: uniqueGuiaValues.servicios.length,
        frecuencias: uniqueGuiaValues.frecuencias.length,
        sucursales: uniqueGuiaValues.sucursales.length,
        totalValue: statsData.valorTotal,
        montoImpago: statsData.montoTotalImpago
      });

    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error cargando datos', {
        description: 'No se pudieron cargar los datos del sistema',
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    
    // Clear external cache before refreshing
    ExternalDataService.invalidateCache();
    
    await loadAllData();
    setIsRefreshing(false);
    
    // Update connection info after refresh
    const connInfo = ExternalDataService.getConnectionInfo();
    setConnectionInfo(connInfo);
    
    toast.success('Datos actualizados', {
      description: `Datos recargados desde ${connInfo.mode === 'external' ? 'JSON externo' : 'datos mock'}`,
      duration: 3000,
    });
  };

  // Apply filters when they change - GUÍAS
  useEffect(() => {
    let filtered = [...guias];

    if (filtrosGuias.fechaInicio) {
      filtered = filtered.filter(g => {
        // Normalizar fechas para comparación
        const guiaFecha = g.fecha?.split('T')[0] || g.fecha; // Quitar hora si existe
        return guiaFecha >= filtrosGuias.fechaInicio;
      });
    }

    if (filtrosGuias.fechaFin) {
      filtered = filtered.filter(g => {
        // Normalizar fechas para comparación
        const guiaFecha = g.fecha?.split('T')[0] || g.fecha; // Quitar hora si existe
        return guiaFecha <= filtrosGuias.fechaFin;
      });
    }

    if (filtrosGuias.servicio) {
      filtered = filtered.filter(g => g.servicio === filtrosGuias.servicio);
    }

    if (filtrosGuias.frecuencia) {
      filtered = filtered.filter(g => g.frecuencia === filtrosGuias.frecuencia);
    }

    if (filtrosGuias.sucursal) {
      filtered = filtered.filter(g => g.sucursal === filtrosGuias.sucursal);
    }

    if (filtrosGuias.numeroGuia) {
      const search = filtrosGuias.numeroGuia.toLowerCase();
      filtered = filtered.filter(g => 
        g.guia?.toLowerCase().includes(search)
      );
    }

    setFilteredGuias(filtered);
  }, [guias, filtrosGuias]);

  // Apply filters when they change - FACTURAS
  useEffect(() => {
    let filtered = [...facturasImpagas];

    if (filtrosFacturas.fechaInicio) {
      filtered = filtered.filter(f => {
        // Normalizar fechas para comparación
        const facturaFecha = f.fecha?.split('T')[0] || f.fecha; // Quitar hora si existe
        return facturaFecha >= filtrosFacturas.fechaInicio;
      });
    }

    if (filtrosFacturas.fechaFin) {
      filtered = filtered.filter(f => {
        // Normalizar fechas para comparación
        const facturaFecha = f.fecha?.split('T')[0] || f.fecha; // Quitar hora si existe
        return facturaFecha <= filtrosFacturas.fechaFin;
      });
    }

    if (filtrosFacturas.sucursal) {
      filtered = filtered.filter(f => f.sucursal === filtrosFacturas.sucursal);
    }

    if (filtrosFacturas.estadoMora) {
      filtered = filtered.filter(f => f.estado_mora === filtrosFacturas.estadoMora);
    }

    if (filtrosFacturas.diasMoraMin) {
      const min = parseInt(filtrosFacturas.diasMoraMin);
      filtered = filtered.filter(f => f.dias_mora >= min);
    }

    if (filtrosFacturas.diasMoraMax) {
      const max = parseInt(filtrosFacturas.diasMoraMax);
      filtered = filtered.filter(f => f.dias_mora <= max);
    }

    setFilteredFacturas(filtered);
  }, [facturasImpagas, filtrosFacturas]);

  const clearFilters = () => {
    const currentMonth = getCurrentMonthDates();
    
    if (activeTab === 'guias') {
      setFiltrosGuias({
        fechaInicio: currentMonth.start,
        fechaFin: currentMonth.end,
        servicio: '',
        frecuencia: '',
        sucursal: '',
        numeroGuia: ''
      });
      toast.success('Filtros restablecidos', {
        description: 'Se han restablecido los filtros al mes actual',
        duration: 2000,
      });
    } else {
      setFiltrosFacturas({
        fechaInicio: '',
        fechaFin: '',
        sucursal: '',
        estadoMora: '',
        diasMoraMin: '',
        diasMoraMax: ''
      });
      toast.success('Filtros restablecidos', {
        description: 'Se han restablecido los filtros. Mostrando todas las facturas',
        duration: 2000,
      });
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    if (activeTab === 'guias') {
      setFiltrosGuias(prev => ({ ...prev, [field]: value }));
    } else {
      setFiltrosFacturas(prev => ({ ...prev, [field]: value }));
    }
  };

  const activeFilters = activeTab === 'guias' 
    ? Object.entries(filtrosGuias).some(([key, valor]) => {
        if (key === 'fechaInicio' || key === 'fechaFin') {
          const currentMonth = getCurrentMonthDates();
          return valor !== '' && (
            (key === 'fechaInicio' && valor !== currentMonth.start) ||
            (key === 'fechaFin' && valor !== currentMonth.end)
          );
        }
        return valor !== '';
      })
    : Object.entries(filtrosFacturas).some(([key, valor]) => {
        // Para facturas, cualquier valor no vacío cuenta como filtro activo
        return valor !== '';
      });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-green-900 dark:to-blue-900">
        <div className="flex flex-col items-center space-y-6">
          <LogoLogisamb variant="icon" size="xl" />
          <div className="flex flex-col items-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            <p className="text-muted-foreground font-medium">Cargando Portal LOGISAMB...</p>
            <p className="text-sm text-muted-foreground">Sistema de gestión integral de residuos</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-green-900 dark:to-blue-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative flex items-center justify-between h-16">
            {/* Cliente info - Left side */}
            <div className="hidden md:flex items-center space-x-2">
              <p className="text-sm text-muted-foreground">Cliente:</p>
              <p className="font-medium text-foreground">{cliente?.nombre}</p>
              <Badge variant="outline" className="text-xs px-2 py-0">
                <Building2 className="w-3 h-3 mr-1" />
                ID: {cliente?.id}
              </Badge>
            </div>
            
            {/* Logo centrado */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <LogoLogisamb variant="full" size="lg" />
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshData}
                disabled={isRefreshing}
                className="hidden sm:flex"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>

              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium">{usuario?.nombre || usuario?.usu_login}</p>
                  <div className="flex items-center space-x-1">
                    <Badge variant="secondary" className="text-xs">
                      Portal Cliente
                    </Badge>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={logout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Salir
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Client Header */}
        <Card className="mb-6 bg-gradient-to-r from-green-500 to-blue-600 text-white border-0 shadow-xl">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-white">
                    {cliente?.nombre}
                  </CardTitle>
                  <CardDescription className="text-green-100">
                    Portal LOGISAMB - Gestión Integral de Residuos y Facturación
                  </CardDescription>
                  {connectionInfo && (
                    <div className="flex items-center space-x-2 mt-2">
                      <div className={`w-2 h-2 rounded-full ${
                        !connectionInfo.enabled ? 'bg-gray-400' :
                        connectionInfo.mode === 'external' ? 'bg-green-400 animate-pulse' :
                        connectionInfo.mode === 'fallback' ? 'bg-yellow-400' : 'bg-gray-400'
                      }`} />
                      <span className="text-xs text-green-200">
                        {!connectionInfo.enabled ? 'JSON externo deshabilitado' :
                         connectionInfo.mode === 'external' ? 'Datos en vivo desde https://livesoft.cl' :
                         connectionInfo.mode === 'fallback' ? 'Datos demo (JSON externo no disponible)' : 'Estado desconocido'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">
                  {stats?.totalGuias || 0}
                </div>
                <div className="text-sm text-blue-100">
                  Guías Registradas
                </div>
                <div className="text-xs text-blue-200 mt-1">
                  {stats?.totalFacturasImpagas || 0} facturas impagas
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
            <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/20 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Guías</CardTitle>
                <Clipboard className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-700">{stats.totalGuias.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Retiros procesados
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/20 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Facturado</CardTitle>
                <DollarSign className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-700">{ResidueService.formatCurrency(stats.valorTotal)}</div>
                <p className="text-xs text-muted-foreground">Ingresos por gestión</p>
              </CardContent>
            </Card>

            <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/20 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Facturas Impagas</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-700">{stats.totalFacturasImpagas}</div>
                <p className="text-xs text-muted-foreground">Pendientes de pago</p>
              </CardContent>
            </Card>

            <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/20 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monto Impago</CardTitle>
                <CreditCard className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-700">{ResidueService.formatCurrency(stats.montoTotalImpago)}</div>
                <p className="text-xs text-muted-foreground">Por cobrar</p>
              </CardContent>
            </Card>

            <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/20 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sucursales Activas</CardTitle>
                <MapPin className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-700">{stats.guiasPorSucursal.length}</div>
                <p className="text-xs text-muted-foreground">Ubicaciones operativas</p>
              </CardContent>
            </Card>

            <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/20 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mora Promedio</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-700">{Math.round(stats.promedioMoraCliente)}</div>
                <p className="text-xs text-muted-foreground">Días de mora</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Alert Facturas Críticas */}
        {stats && stats.facturasVencidas.criticas > 0 && (
          <Card className="mb-6 border-red-200 bg-red-50/80">
            <CardContent className="pt-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-red-800">
                    Atención: Facturas en Estado Crítico
                  </h4>
                  <p className="text-sm text-red-700 mt-1">
                    Hay <strong>{stats.facturasVencidas.criticas}</strong> facturas con más de 90 días de mora que requieren atención inmediata.
                    {stats.facturasVencidas.altas > 0 && (
                      <span> Además, <strong>{stats.facturasVencidas.altas}</strong> facturas en estado de mora alta.</span>
                    )}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2 text-red-700 border-red-300 hover:bg-red-100"
                    onClick={() => setActiveTab('facturas')}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Ver facturas impagas
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/60 backdrop-blur-sm">
            <TabsTrigger value="guias" className="flex items-center space-x-2">
              <Clipboard className="h-4 w-4" />
              <span>Guías de Retiro</span>
              {guias.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {guias.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="facturas" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Facturas Impagas</span>
              {facturasImpagas.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {facturasImpagas.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="conexion" className="flex items-center space-x-2">
              <Globe className="h-4 w-4" />
              <span>Conexión JSON</span>
              {connectionInfo && (
                <Badge 
                  variant={
                    !connectionInfo.enabled ? "secondary" :
                    connectionInfo.externalAvailable === true ? "default" :
                    connectionInfo.externalAvailable === false ? "destructive" : "outline"
                  } 
                  className="ml-2"
                >
                  {!connectionInfo.enabled ? "OFF" :
                   connectionInfo.externalAvailable === true ? "ON" :
                   connectionInfo.externalAvailable === false ? "MOCK" : "?"}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Filters */}
          <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/20 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Filter className="h-5 w-5 text-green-600" />
                  <CardTitle>
                    Filtros de {activeTab === 'guias' ? 'Guías' : 'Facturas Impagas'}
                  </CardTitle>
                  {activeFilters && (
                    <Badge variant="secondary">
                      {activeTab === 'guias' 
                        ? Object.entries(filtrosGuias).filter(([key, valor]) => {
                            if (key === 'fechaInicio' || key === 'fechaFin') {
                              const currentMonth = getCurrentMonthDates();
                              return valor !== '' && (
                                (key === 'fechaInicio' && valor !== currentMonth.start) ||
                                (key === 'fechaFin' && valor !== currentMonth.end)
                              );
                            }
                            return valor !== '';
                          }).length
                        : Object.entries(filtrosFacturas).filter(([key, valor]) => {
                            if (key === 'fechaInicio' || key === 'fechaFin') {
                              const currentMonth = getCurrentMonthDates();
                              return valor !== '' && (
                                (key === 'fechaInicio' && valor !== currentMonth.start) ||
                                (key === 'fechaFin' && valor !== currentMonth.end)
                              );
                            }
                            return valor !== '';
                          }).length
                      } activos
                    </Badge>
                  )}
                </div>
                {activeFilters && (
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-2" />
                    Limpiar
                  </Button>
                )}
              </div>
              <CardDescription>
                Filtra {activeTab === 'guias' ? 'las guías de retiro' : 'las facturas impagas'} de <strong>{cliente?.nombre}</strong> (mostrando mes actual por defecto)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeTab === 'guias' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Fecha Inicio</label>
                    <DatePicker
                      value={filtrosGuias.fechaInicio}
                      onChange={(date) => handleFilterChange('fechaInicio', date)}
                      placeholder="Fecha inicio"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Fecha Fin</label>
                    <DatePicker
                      value={filtrosGuias.fechaFin}
                      onChange={(date) => handleFilterChange('fechaFin', date)}
                      placeholder="Fecha fin"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Sucursal</label>
                    <Select 
                      value={filtrosGuias.sucursal} 
                      onValueChange={(value) => handleFilterChange('sucursal', value === 'all' ? '' : value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todas las sucursales" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las sucursales</SelectItem>
                        {uniqueValues.sucursales.map((sucursal) => (
                          <SelectItem key={sucursal} value={sucursal}>
                            {sucursal}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Servicio</label>
                    <Select 
                      value={filtrosGuias.servicio} 
                      onValueChange={(value) => handleFilterChange('servicio', value === 'all' ? '' : value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos los servicios" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los servicios</SelectItem>
                        {uniqueValues.servicios.map((servicio) => (
                          <SelectItem key={servicio} value={servicio}>
                            {servicio}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Frecuencia</label>
                    <Select 
                      value={filtrosGuias.frecuencia} 
                      onValueChange={(value) => handleFilterChange('frecuencia', value === 'all' ? '' : value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todas las frecuencias" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las frecuencias</SelectItem>
                        {uniqueValues.frecuencias.map((frecuencia) => (
                          <SelectItem key={frecuencia} value={frecuencia}>
                            {frecuencia}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">N° Guía</label>
                    <Input
                      placeholder="Buscar guía..."
                      value={filtrosGuias.numeroGuia}
                      onChange={(e) => handleFilterChange('numeroGuia', e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Fecha Inicio</label>
                    <DatePicker
                      value={filtrosFacturas.fechaInicio}
                      onChange={(date) => handleFilterChange('fechaInicio', date)}
                      placeholder="Fecha inicio"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Fecha Fin</label>
                    <DatePicker
                      value={filtrosFacturas.fechaFin}
                      onChange={(date) => handleFilterChange('fechaFin', date)}
                      placeholder="Fecha fin"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Sucursal</label>
                    <Select 
                      value={filtrosFacturas.sucursal} 
                      onValueChange={(value) => handleFilterChange('sucursal', value === 'all' ? '' : value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todas las sucursales" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las sucursales</SelectItem>
                        {uniqueValues.sucursales.map((sucursal) => (
                          <SelectItem key={sucursal} value={sucursal}>
                            {sucursal}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Estado Mora</label>
                    <Select 
                      value={filtrosFacturas.estadoMora} 
                      onValueChange={(value) => handleFilterChange('estadoMora', value === 'all' ? '' : value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos los estados" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los estados</SelectItem>
                        {uniqueValues.estadosMora.map((estado) => (
                          <SelectItem key={estado} value={estado}>
                            {estado}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Días Mora Mín</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={filtrosFacturas.diasMoraMin}
                      onChange={(e) => handleFilterChange('diasMoraMin', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Días Mora Máx</label>
                    <Input
                      type="number"
                      placeholder="999"
                      value={filtrosFacturas.diasMoraMax}
                      onChange={(e) => handleFilterChange('diasMoraMax', e.target.value)}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Content Tabs */}
          <TabsContent value="guias" className="space-y-6">
            <ResidueTable 
              guias={filteredGuias} 
              clienteNombre={cliente?.nombre || ''} 
              onRefresh={refreshData}
              isLoading={isRefreshing}
            />
          </TabsContent>

          <TabsContent value="facturas" className="space-y-6">
            <FacturasImpagasTable 
              facturas={filteredFacturas} 
              clienteNombre={cliente?.nombre || ''} 
              onRefresh={refreshData}
              isLoading={isRefreshing}
            />
          </TabsContent>

          <TabsContent value="conexion" className="space-y-6">
            <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/20 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Database className="h-5 w-5 text-blue-600" />
                    <CardTitle>Monitoreo de Datos Externos</CardTitle>
                    {connectionInfo && (
                      <Badge 
                        variant={
                          !connectionInfo.enabled ? "secondary" :
                          connectionInfo.mode === 'external' ? "default" :
                          connectionInfo.mode === 'fallback' ? "destructive" : "outline"
                        }
                      >
                        {connectionInfo.mode.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    🌐 https://livesoft.cl/data/
                  </div>
                </div>
                <CardDescription>
                  Sistema híbrido de datos - JSON externo con fallback a datos mock
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ExternalDataTest />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}