import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { DatabaseService, type RegistroInforme, type EstadisticasEmpresa } from './services/DatabaseService';
import { ReportTable } from './ReportTable';
import { ExportButtons } from './ExportButtons';
import { ConnectionStatus } from './ConnectionStatus';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { toast } from 'sonner@2.0.3';
import { 
  LogOut, 
  Filter, 
  X, 
  TrendingUp, 
  Users, 
  Package, 
  DollarSign,
  Calendar,
  BarChart3,
  RefreshCw
} from 'lucide-react';

export function ReportDashboard() {
  const { user, empresa, logout } = useAuth();
  const [registros, setRegistros] = useState<RegistroInforme[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasEmpresa | null>(null);
  const [filteredRegistros, setFilteredRegistros] = useState<RegistroInforme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [clientesUnicos, setClientesUnicos] = useState<{clienteId: number, nombreCliente: string}[]>([]);
  const [serviciosUnicos, setServiciosUnicos] = useState<{servicioId: number, nombreServicio: string}[]>([]);
  
  // Estados para filtros
  const [filtros, setFiltros] = useState({
    cliente: '',
    servicio: '',
    fechaInicio: '',
    fechaFin: '',
    textoBusqueda: ''
  });

  // Cargar datos iniciales
  useEffect(() => {
    loadAllData();
  }, [user]);

  const loadAllData = async () => {
    if (!user || !empresa) return;
    
    setIsLoading(true);
    try {
      console.log('🔄 Cargando datos del dashboard...');
      
      // Cargar datos en paralelo
      const [registrosData, estadisticasData, clientesData, serviciosData] = await Promise.all([
        DatabaseService.getRegistrosByEmpresa(empresa.id),
        DatabaseService.getEstadisticasEmpresa(empresa.id),
        DatabaseService.getClientesUnicos(empresa.id),
        DatabaseService.getServiciosUnicos()
      ]);

      setRegistros(registrosData);
      setEstadisticas(estadisticasData);
      setClientesUnicos(clientesData);
      setServiciosUnicos(serviciosData);
      
      console.log('✅ Datos cargados:', {
        registros: registrosData.length,
        clientes: clientesData.length,
        servicios: serviciosData.length
      });

    } catch (error) {
      console.error('Error cargando datos:', error);
      toast.error('Error cargando datos', {
        description: 'No se pudieron cargar todos los datos del dashboard',
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

  // Aplicar filtros cuando cambien
  useEffect(() => {
    let filtered = [...registros];

    // Filtro por cliente
    if (filtros.cliente) {
      filtered = filtered.filter(r => r.clienteId.toString() === filtros.cliente);
    }

    // Filtro por servicio
    if (filtros.servicio) {
      filtered = filtered.filter(r => r.servicioId.toString() === filtros.servicio);
    }

    // Filtro por fecha inicio
    if (filtros.fechaInicio) {
      filtered = filtered.filter(r => r.fecha >= filtros.fechaInicio);
    }

    // Filtro por fecha fin
    if (filtros.fechaFin) {
      filtered = filtered.filter(r => r.fecha <= filtros.fechaFin);
    }

    // Filtro por texto de búsqueda
    if (filtros.textoBusqueda) {
      const texto = filtros.textoBusqueda.toLowerCase();
      filtered = filtered.filter(r => 
        r.nombreCliente.toLowerCase().includes(texto) ||
        r.nombreServicio.toLowerCase().includes(texto) ||
        r.frecuencia.toLowerCase().includes(texto)
      );
    }

    setFilteredRegistros(filtered);
  }, [registros, filtros]);

  const limpiarFiltros = () => {
    setFiltros({
      cliente: '',
      servicio: '',
      fechaInicio: '',
      fechaFin: '',
      textoBusqueda: ''
    });
    toast.success('Filtros limpiados', {
      description: 'Se han removido todos los filtros',
      duration: 2000,
    });
  };

  const handleFiltroChange = (campo: string, valor: string) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('es-CO').format(num);
  };

  const filtrosActivos = Object.values(filtros).some(valor => valor !== '');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Cargando datos del dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-purple-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-foreground">Sistema de Informes</h1>
                  <p className="text-sm text-muted-foreground">{empresa?.nombre}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <ConnectionStatus />
              
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
                  <p className="text-sm font-medium">{user?.nombre}</p>
                  <p className="text-xs text-muted-foreground">{user?.rol}</p>
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
        {/* Estadísticas Cards */}
        {estadisticas && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Registros</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(estadisticas.totalRegistros)}</div>
                <p className="text-xs text-muted-foreground">Registros en el sistema</p>
              </CardContent>
            </Card>

            <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(estadisticas.valorTotalGeneral)}</div>
                <p className="text-xs text-muted-foreground">Ingresos totales</p>
              </CardContent>
            </Card>

            <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{estadisticas.clientesMasActivos.length}</div>
                <p className="text-xs text-muted-foreground">Clientes con registros</p>
              </CardContent>
            </Card>

            <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Volumen Retirado</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(estadisticas.volumenTotalRetirado)}</div>
                <p className="text-xs text-muted-foreground">Unidades procesadas</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filtros */}
        <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/20 mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                <CardTitle>Filtros</CardTitle>
                {filtrosActivos && (
                  <Badge variant="secondary">{Object.values(filtros).filter(v => v !== '').length} activos</Badge>
                )}
              </div>
              {filtrosActivos && (
                <Button variant="outline" size="sm" onClick={limpiarFiltros}>
                  <X className="h-4 w-4 mr-2" />
                  Limpiar
                </Button>
              )}
            </div>
            <CardDescription>
              Filtra los registros por cliente, servicio, fechas o texto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Cliente</label>
                <Select 
                  value={filtros.cliente} 
                  onValueChange={(value) => handleFiltroChange('cliente', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los clientes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos los clientes</SelectItem>
                    {clientesUnicos.map((cliente) => (
                      <SelectItem key={cliente.clienteId} value={cliente.clienteId.toString()}>
                        {cliente.nombreCliente}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Servicio</label>
                <Select 
                  value={filtros.servicio} 
                  onValueChange={(value) => handleFiltroChange('servicio', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los servicios" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos los servicios</SelectItem>
                    {serviciosUnicos.map((servicio) => (
                      <SelectItem key={servicio.servicioId} value={servicio.servicioId.toString()}>
                        {servicio.nombreServicio}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Fecha Inicio</label>
                <Input
                  type="date"
                  value={filtros.fechaInicio}
                  onChange={(e) => handleFiltroChange('fechaInicio', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Fecha Fin</label>
                <Input
                  type="date"
                  value={filtros.fechaFin}
                  onChange={(e) => handleFiltroChange('fechaFin', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Búsqueda</label>
                <Input
                  placeholder="Buscar..."
                  value={filtros.textoBusqueda}
                  onChange={(e) => handleFiltroChange('textoBusqueda', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabla y Exportación */}
        <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/20">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Registros de Informes</span>
                </CardTitle>
                <CardDescription>
                  {filteredRegistros.length} de {registros.length} registros
                  {filtrosActivos && ' (filtrados)'}
                </CardDescription>
              </div>
              <ExportButtons 
                data={filteredRegistros}
                empresa={empresa?.nombre || 'Sistema de Informes'}
              />
            </div>
          </CardHeader>
          <CardContent>
            <ReportTable registros={filteredRegistros} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}