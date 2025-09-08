import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { FileText, Calendar, Hash, Package, Repeat, DollarSign, Building, Eye, Sparkles, TrendingUp, BarChart, Truck } from 'lucide-react';

interface RegistroInforme {
  id: number;
  fecha: string;
  clienteId: number;
  servicioId: number;
  nombreCliente: string;
  nombreServicio: string;
  frecuencia: string;
  total: number;
  volRetrirado: number;
  volLimite: number;
  valorAdicional: number;
  montoAdicional: number;
}

interface ReportTableProps {
  data: RegistroInforme[];
}

export function ReportTable({ data }: ReportTableProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDecimal = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 2
    }).format(value);
  };

  const getServiceBadgeVariant = (servicio: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'Transporte Terrestre': 'default',
      'Transporte Aéreo': 'secondary',
      'Transporte Marítimo': 'outline',
      'Almacenamiento': 'secondary',
      'Courier': 'default',
      'Courier Express': 'default'
    };
    return variants[servicio] || 'default';
  };

  const getServiceIcon = (servicio: string) => {
    const icons: Record<string, React.ReactNode> = {
      'Transporte Terrestre': '🚛',
      'Transporte Aéreo': '✈️',
      'Transporte Marítimo': '🚢',
      'Almacenamiento': '📦',
      'Courier': '📫',
      'Courier Express': '📬'
    };
    return icons[servicio] || '📦';
  };

  const getFrequencyBadge = (frecuencia: string) => {
    const config: Record<string, { color: string; bg: string; icon: string }> = {
      'Diaria': { color: 'text-emerald-700', bg: 'bg-emerald-100 border-emerald-200', icon: '⚡' },
      'Semanal': { color: 'text-blue-700', bg: 'bg-blue-100 border-blue-200', icon: '🔄' },
      'Quincenal': { color: 'text-amber-700', bg: 'bg-amber-100 border-amber-200', icon: '📅' },
      'Mensual': { color: 'text-purple-700', bg: 'bg-purple-100 border-purple-200', icon: '📆' }
    };
    
    const config_item = config[frecuencia] || { color: 'text-gray-700', bg: 'bg-gray-100 border-gray-200', icon: '📋' };
    
    return (
      <span className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-medium border ${config_item.bg} ${config_item.color} transition-all duration-200`}>
        <span>{config_item.icon}</span>
        <span>{frecuencia}</span>
      </span>
    );
  };

  const getVolumeStatus = (retirado: number, limite: number) => {
    const percentage = (retirado / limite) * 100;
    if (percentage >= 90) {
      return { color: 'text-red-700', bg: 'bg-red-100', icon: '⚠️', status: 'Crítico' };
    } else if (percentage >= 70) {
      return { color: 'text-orange-700', bg: 'bg-orange-100', icon: '⚡', status: 'Alto' };
    } else if (percentage >= 40) {
      return { color: 'text-blue-700', bg: 'bg-blue-100', icon: '📊', status: 'Medio' };
    } else {
      return { color: 'text-green-700', bg: 'bg-green-100', icon: '✅', status: 'Óptimo' };
    }
  };

  if (data.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <span className="text-gray-900">Datos del Informe</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="mb-4">
              <Eye className="h-12 w-12 text-gray-400 mx-auto" />
            </div>
            <p className="text-lg font-medium text-gray-600 mb-2">
              No hay datos disponibles
            </p>
            <p className="text-sm text-gray-500">
              No se encontraron registros para el filtro seleccionado.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-white/50 to-white/30 border-b border-white/20">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900">Registros de Servicios</span>
              <div className="flex items-center space-x-4 mt-1">
                <span className="text-sm text-gray-600">
                  {data.length} registro{data.length !== 1 ? 's' : ''} encontrado{data.length !== 1 ? 's' : ''}
                </span>
                <div className="flex items-center space-x-1">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  <span className="text-xs font-medium text-purple-600">Datos en tiempo real</span>
                </div>
              </div>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-gray-50/80 to-gray-50/60 border-gray-200/50 hover:bg-gray-50/90">
                <TableHead className="font-semibold text-gray-700 py-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-purple-500" />
                    <span>Fecha</span>
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4 text-purple-500" />
                    <span>Cliente</span>
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  <div className="flex items-center space-x-2">
                    <Package className="h-4 w-4 text-purple-500" />
                    <span>Servicio</span>
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  <div className="flex items-center space-x-2">
                    <Repeat className="h-4 w-4 text-purple-500" />
                    <span>Frecuencia</span>
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-gray-700 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <DollarSign className="h-4 w-4 text-purple-500" />
                    <span>Total Base</span>
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-gray-700 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <Truck className="h-4 w-4 text-purple-500" />
                    <span>Volumen</span>
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-gray-700 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <TrendingUp className="h-4 w-4 text-purple-500" />
                    <span>Adicionales</span>
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-gray-700 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <BarChart className="h-4 w-4 text-purple-500" />
                    <span>Total Final</span>
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, index) => {
                const volumeStatus = getVolumeStatus(item.volRetrirado, item.volLimite);
                const totalFinal = item.total + item.valorAdicional + item.montoAdicional;
                
                return (
                  <TableRow 
                    key={item.id} 
                    className={`group transition-all duration-200 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-blue-50/50 hover:shadow-lg ${
                      index % 2 === 0 ? 'bg-white/50' : 'bg-white/30'
                    }`}
                  >
                    <TableCell className="py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-purple-600" />
                        </div>
                        <span className="font-mono text-sm font-medium text-gray-700">
                          {formatDate(item.fecha)}
                        </span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
                          <Building className="h-3 w-3 text-white" />
                        </div>
                        <div>
                          <span className="font-medium text-gray-800">{item.nombreCliente}</span>
                          <div className="text-xs text-gray-500 font-mono">ID: {item.clienteId}</div>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getServiceIcon(item.nombreServicio)}</span>
                        <div>
                          <Badge 
                            variant={getServiceBadgeVariant(item.nombreServicio)}
                            className="font-medium hover:scale-105 transition-transform duration-200"
                          >
                            {item.nombreServicio}
                          </Badge>
                          <div className="text-xs text-gray-500 font-mono mt-1">ID: {item.servicioId}</div>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {getFrequencyBadge(item.frecuencia)}
                    </TableCell>
                    
                    <TableCell className="text-right">
                      <div className="font-mono font-bold text-lg text-blue-700">
                        {formatCurrency(item.total)}
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-center">
                      <div className="space-y-2">
                        <div className="flex items-center justify-center space-x-2">
                          <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium border ${volumeStatus.bg} ${volumeStatus.color}`}>
                            <span>{volumeStatus.icon}</span>
                            <span>{volumeStatus.status}</span>
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          <div>Retirado: <span className="font-mono font-semibold">{formatDecimal(item.volRetrirado)}</span></div>
                          <div>Límite: <span className="font-mono font-semibold">{item.volLimite.toLocaleString()}</span></div>
                          <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-500 ${
                                volumeStatus.status === 'Crítico' ? 'bg-red-500' :
                                volumeStatus.status === 'Alto' ? 'bg-orange-500' :
                                volumeStatus.status === 'Medio' ? 'bg-blue-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min((item.volRetrirado / item.volLimite) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-right">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-green-700">
                          Val. Adic: {formatCurrency(item.valorAdicional)}
                        </div>
                        <div className="text-sm font-medium text-orange-700">
                          Monto Adic: {formatCurrency(item.montoAdicional)}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-right">
                      <div className="space-y-1">
                        <div className="font-mono font-bold text-xl text-purple-700">
                          {formatCurrency(totalFinal)}
                        </div>
                        <div className="text-xs text-gray-500">
                          ({((item.valorAdicional + item.montoAdicional) / item.total * 100).toFixed(1)}% adicional)
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}