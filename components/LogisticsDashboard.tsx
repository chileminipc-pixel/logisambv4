import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { LogisticsService, type Guia, type GuiaStats } from './services/LogisticsService';
import { GuiasTable } from './GuiasTable';
import { LogisticsExport } from './LogisticsExport';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { toast } from 'sonner@2.0.3';
import { 
  LogOut, 
  Filter, 
  X, 
  TrendingUp, 
  Package, 
  DollarSign,
  Calendar,
  Truck,
  RefreshCw,
  Weight,
  MapPin,
  Building2,
  BarChart3,
  Shield,
  Info,
  Users
} from 'lucide-react';

export function LogisticsDashboard() {
  const { usuario, cliente, logout } = useAuth();
  const [guias, setGuias] = useState<Guia[]>([]);
  const [stats, setStats] = useState<GuiaStats | null>(null);
  const [filteredGuias, setFilteredGuias] = useState<Guia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Filter states
  const [filtros, setFiltros] = useState({
    fechaInicio: '',
    fechaFin: '',
    estado: '',
    servicio: '',
    cliente: '',
    numeroGuia: ''
  });

  // Unique values for filter dropdowns
  const [uniqueValues, setUniqueValues] = useState({
    estados: [] as string[],
    servicios: [] as string[],
    clientes: [] as string[]
  });

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
      
      // Load data in parallel - IMPORTANTE: Solo datos del cliente del usuario
      const [guiasData, statsData] = await Promise.all([
        LogisticsService.getGuiasByCliente(cliente.id),
        LogisticsService.getGuiaStats(cliente.id)
      ]);

      // VALIDACIÓN DE SEGURIDAD: Verificar que todas las guías pertenecen al cliente
      const invalidGuias = guiasData.filter(g => g.clienteId !== cliente.id);
      if (invalidGuias.length > 0) {
        console.error('🚨 SECURITY VIOLATION: User can see other client data!', invalidGuias);
        toast.error('Error de seguridad detectado', {
          description: 'Se encontraron datos de otro cliente. Contacte al administrador.',
          duration: 5000,
        });
        return;
      }

      setGuias(guiasData);
      setStats(statsData);
      
      // Extract unique values for filters using the service method
      const uniqueFilterValues = LogisticsService.getUniqueFilterValues(guiasData);
      setUniqueValues(uniqueFilterValues);
      
      console.log(`✅ Data loaded for cliente ${cliente.id}:`, {
        guias: guiasData.length,
        estados: uniqueFilterValues.estados.length,
        servicios: uniqueFilterValues.servicios.length,
        clientes: uniqueFilterValues.clientes.length,
        totalValue: statsData.valorTotal
      });

      // Mostrar resumen de datos por cliente en modo demo
      if (LogisticsService.isDemoMode()) {
        const clientSummary = LogisticsService.getClientDataSummary();
        console.log('📊 Client Data Summary:', clientSummary);
      }

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
    await loadAllData();
    setIsRefreshing(false);
    toast.success('Datos actualizados', {
      description: 'Los datos han sido recargados exitosamente',
      duration: 2000,
    });
  };

  // Apply filters when they change
  useEffect(() => {
    let filtered = [...guias];

    // Filter by fecha inicio
    if (filtros.fechaInicio) {
      filtered = filtered.filter(g => g.fecha >= filtros.fechaInicio);
    }

    // Filter by fecha fin
    if (filtros.fechaFin) {
      filtered = filtered.filter(g => g.fecha <= filtros.fechaFin);
    }

    // Filter by estado
    if (filtros.estado) {
      filtered = filtered.filter(g => g.estado === filtros.estado);
    }

    // Filter by servicio
    if (filtros.servicio) {
      filtered = filtered.filter(g => g.servicio === filtros.servicio);
    }

    // Filter by cliente
    if (filtros.cliente) {
      filtered = filtered.filter(g => g.cliente_nombre === filtros.cliente);
    }

    // Filter by número de guía
    if (filtros.numeroGuia) {
      const search = filtros.numeroGuia.toLowerCase();
      filtered = filtered.filter(g => 
        g.numero_guia?.toLowerCase().includes(search)
      );
    }

    setFilteredGuias(filtered);
  }, [guias, filtros]);

  const clearFilters = () => {
    setFiltros({
      fechaInicio: '',
      fechaFin: '',
      estado: '',
      servicio: '',
      cliente: '',
      numeroGuia: ''
    });
    toast.success('Filtros limpiados', {
      description: 'Se han removido todos los filtros',
      duration: 2000,
    });
  };

  const handleFilterChange = (field: string, value: string) => {
    setFiltros(prev => ({ ...prev, [field]: value }));
  };

  const activeFilters = Object.values(filtros).some(valor => valor !== '');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Cargando sistema logístico...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-purple-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Truck className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-foreground">Portal Cliente</h1>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-muted-foreground">{cliente?.nombre}</p>
                    <Badge variant="outline" className="text-xs px-2 py-0">
                      <Building2 className="w-3 h-3 mr-1" />
                      ID: {cliente?.id}
                    </Badge>
                  </div>
                </div>
              </div>
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
                    <p className="text-xs text-muted-foreground">{usuario?.rol || 'Usuario'}</p>
                    <Badge variant="secondary" className="text-xs">
                      Cliente {usuario?.clienteId}
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
        {/* Security Notice for Demo Mode */}
        {LogisticsService.isDemoMode() && (
          <Alert className="mb-6 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              <strong>Sistema con Datos Reales:</strong> Cada cliente registra y ve únicamente sus propias guías logísticas. 
              Usuario <strong>{usuario?.usu_login}</strong> está registrando guías para <strong>{cliente?.nombre}</strong>.
              {LogisticsService.isDemoMode() && (
                <span className="block mt-1 text-xs">
                  Clientes activos: INCEAN ({LogisticsService.getClientDataSummary().cliente93.guias} guías), 
                  ACAR LOS ANGELES ({LogisticsService.getClientDataSummary().cliente58.guias} guías),
                  COCA COLA ({LogisticsService.getClientDataSummary().cliente68.guias} guías),
                  AGROINDUSTRIAS ({LogisticsService.getClientDataSummary().cliente61.guias} guías),
                  PORTAL FRANCES ({LogisticsService.getClientDataSummary().cliente152.guias} guías),
                  LOS CARRINEROS ({LogisticsService.getClientDataSummary().cliente25.guias} guías).
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mis Guías</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalGuias.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Guías de {cliente?.nombre}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{LogisticsService.formatCurrency(stats.valorTotal)}</div>
                <p className="text-xs text-muted-foreground">Mis envíos totales</p>
              </CardContent>
            </Card>

            <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Volumen Total</CardTitle>
                <Weight className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{LogisticsService.formatNumber(stats.volumenTotal)}</div>
                <p className="text-xs text-muted-foreground">m³ enviados</p>
              </CardContent>
            </Card>

            <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Peso Total</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{LogisticsService.formatNumber(stats.pesoTotal)}</div>
                <p className="text-xs text-muted-foreground">kg enviados</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Stats Row */}
        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Estados de Mis Guías</span>
                </CardTitle>
                <CardDescription>
                  Distribución de estados para {cliente?.nombre}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.guiasPorEstado.slice(0, 4).map((item, index) => (
                    <div key={item.estado} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${
                          index === 0 ? 'bg-green-500' : 
                          index === 1 ? 'bg-blue-500' : 
                          index === 2 ? 'bg-yellow-500' : 'bg-gray-500'
                        }`} />
                        <span className="text-sm">{item.estado}</span>
                      </div>
                      <Badge variant="secondary">{item.cantidad}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Mis Servicios Más Usados</span>
                </CardTitle>
                <CardDescription>
                  Servicios más utilizados por {cliente?.nombre}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.guiasPorServicio.slice(0, 4).map((item, index) => (
                    <div key={item.servicio} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${
                          index === 0 ? 'bg-purple-500' : 
                          index === 1 ? 'bg-pink-500' : 
                          index === 2 ? 'bg-orange-500' : 'bg-gray-500'
                        }`} />
                        <span className="text-sm">{item.servicio}</span>
                      </div>
                      <Badge variant="secondary">{item.cantidad}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/20 mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                <CardTitle>Filtros</CardTitle>
                {activeFilters && (
                  <Badge variant="secondary">
                    {Object.values(filtros).filter(v => v !== '').length} activos
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  <Building2 className="w-3 h-3 mr-1" />
                  {cliente?.nombre}
                </Badge>
              </div>
              {activeFilters && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Limpiar
                </Button>
              )}
            </div>
            <CardDescription>
              Filtra las guías de <strong>{cliente?.nombre}</strong> por fechas, estado, servicio o cliente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Fecha Inicio</label>
                <Input
                  type="date"
                  value={filtros.fechaInicio}
                  onChange={(e) => handleFilterChange('fechaInicio', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Fecha Fin</label>
                <Input
                  type="date"
                  value={filtros.fechaFin}
                  onChange={(e) => handleFilterChange('fechaFin', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Estado</label>
                <Select 
                  value={filtros.estado} 
                  onValueChange={(value) => handleFilterChange('estado', value === 'all' ? '' : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    {uniqueValues.estados.map((estado) => (
                      <SelectItem key={estado} value={estado}>
                        {estado}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Servicio</label>
                <Select 
                  value={filtros.servicio} 
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
                <label className="text-sm font-medium">Cliente</label>
                <Select 
                  value={filtros.cliente} 
                  onValueChange={(value) => handleFilterChange('cliente', value === 'all' ? '' : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los clientes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los clientes</SelectItem>
                    {uniqueValues.clientes.map((clienteNombre) => (
                      <SelectItem key={clienteNombre} value={clienteNombre}>
                        {clienteNombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">N° Guía</label>
                <Input
                  placeholder="Buscar guía..."
                  value={filtros.numeroGuia}
                  onChange={(e) => handleFilterChange('numeroGuia', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table and Export */}
        <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/20">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Mis Guías Registradas</span>
                  <Badge variant="outline" className="text-xs">
                    <Users className="w-3 h-3 mr-1" />
                    {cliente?.nombre}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {filteredGuias.length} de {guias.length} guías de mi cliente
                  {activeFilters && ' (filtradas)'}
                </CardDescription>
              </div>
              <LogisticsExport 
                guias={filteredGuias}
                empresa={cliente?.nombre || 'Mi Cliente'}
                filtros={filtros}
              />
            </div>
          </CardHeader>
          <CardContent>
            <GuiasTable guias={filteredGuias} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}