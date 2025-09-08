import { useState } from 'react';
import { ResidueService, type FacturaImpaga } from './services/ResidueService';
import { ExportService } from './services/ExportService';
import { ExportButtons } from './ExportButtons';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  AlertTriangle,
  Clock,
  Building,
  FileText,
  DollarSign,
  Calendar,
  CheckCircle2,
  XCircle,
  BarChart3
} from 'lucide-react';

interface FacturasImpagasTableProps {
  facturas: FacturaImpaga[];
  clienteNombre?: string;
}

export function FacturasImpagasTable({ facturas, clienteNombre = 'Cliente' }: FacturasImpagasTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Calculate pagination
  const totalPages = Math.ceil(facturas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentFacturas = facturas.slice(startIndex, endIndex);

  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);
  const goToPreviousPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));

  // Export functions
  const handleExportExcel = async () => {
    await ExportService.exportFacturasToExcel(facturas, clienteNombre);
  };

  const handleExportPDF = async () => {
    await ExportService.exportFacturasToPDF(facturas, clienteNombre);
  };

  const getMoraIcon = (diasMora: number) => {
    if (diasMora >= 90) return <XCircle className="h-4 w-4 text-red-500" />;
    if (diasMora >= 60) return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    if (diasMora >= 30) return <Clock className="h-4 w-4 text-yellow-500" />;
    return <CheckCircle2 className="h-4 w-4 text-green-500" />;
  };

  const getMoraBadge = (estadoMora: string, diasMora: number) => {
    const variant = ResidueService.getMoraVariant(estadoMora);
    const colorClass = ResidueService.getEstadoMoraColor(estadoMora);
    
    return (
      <div className="flex items-center space-x-2">
        {getMoraIcon(diasMora)}
        <Badge variant={variant} className={`${colorClass} border-current text-xs`}>
          {estadoMora} ({diasMora}d)
        </Badge>
      </div>
    );
  };

  // Group facturas by sucursal for better organization
  const facturasPorSucursal = currentFacturas.reduce((acc, factura) => {
    if (!acc[factura.sucursal]) {
      acc[factura.sucursal] = [];
    }
    acc[factura.sucursal].push(factura);
    return acc;
  }, {} as Record<string, FacturaImpaga[]>);

  // Calculate summary statistics
  const montoTotal = facturas.reduce((sum, f) => sum + f.monto_factura, 0);
  const promedioMora = facturas.length > 0 
    ? facturas.reduce((sum, f) => sum + f.dias_mora, 0) / facturas.length 
    : 0;
  
  const facturasCriticas = facturas.filter(f => f.estado_mora === 'Crítica').length;
  const facturasAltas = facturas.filter(f => f.estado_mora === 'Alta').length;

  if (facturas.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50 text-green-500" />
            <p className="text-lg font-medium text-green-700">Sin facturas impagas</p>
            <p className="text-sm">El cliente no tiene facturas pendientes de pago</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Export Options Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-red-600" />
          <span className="text-sm font-medium text-muted-foreground">
            {facturas.length} facturas impagas
          </span>
          <Badge variant="destructive" className="text-xs">
            {ResidueService.formatCurrency(montoTotal)}
          </Badge>
        </div>
        
        <ExportButtons
          onExportExcel={handleExportExcel}
          onExportPDF={handleExportPDF}
          recordCount={facturas.length}
          variant="outline"
          size="sm"
        />
      </div>

      {/* Summary Alert */}
      {facturas.length > 0 && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardContent className="pt-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-orange-800">
                  Facturas Pendientes de Pago
                </h4>
                <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-orange-600">Total facturas:</span>
                    <span className="font-medium ml-2">{facturas.length}</span>
                  </div>
                  <div>
                    <span className="text-orange-600">Monto total:</span>
                    <span className="font-medium ml-2">{ResidueService.formatCurrency(montoTotal)}</span>
                  </div>
                  <div>
                    <span className="text-orange-600">Mora promedio:</span>
                    <span className="font-medium ml-2">{Math.round(promedioMora)} días</span>
                  </div>
                  <div>
                    <span className="text-orange-600">Críticas/Altas:</span>
                    <span className="font-medium ml-2 text-red-700">{facturasCriticas + facturasAltas}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <div className="rounded-lg border bg-white/50 backdrop-blur-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/20">
              <TableHead className="font-medium">Fecha</TableHead>
              <TableHead className="font-medium">Empresa</TableHead>
              <TableHead className="font-medium">Sucursal</TableHead>
              <TableHead className="font-medium">RUT</TableHead>
              <TableHead className="font-medium">No Guía</TableHead>
              <TableHead className="font-medium text-center">Días Mora</TableHead>
              <TableHead className="font-medium">Nro Factura</TableHead>
              <TableHead className="font-medium">Fecha Factura</TableHead>
              <TableHead className="font-medium text-right">Monto</TableHead>
              <TableHead className="font-medium">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentFacturas.map((factura) => (
              <TableRow 
                key={factura.id} 
                className={`hover:bg-muted/20 ${
                  factura.estado_mora === 'Crítica' ? 'bg-red-50/50 border-red-100' :
                  factura.estado_mora === 'Alta' ? 'bg-orange-50/50 border-orange-100' :
                  ''
                }`}
              >
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {ResidueService.formatDate(factura.fecha)}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  {factura.empresa}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">{factura.sucursal}</span>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {factura.rut}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-mono text-xs">
                    {factura.no_guia}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center">
                    <Badge 
                      variant={
                        factura.dias_mora >= 90 ? 'destructive' :
                        factura.dias_mora >= 60 ? 'default' :
                        factura.dias_mora >= 30 ? 'secondary' : 'outline'
                      }
                      className="text-xs"
                    >
                      {factura.dias_mora}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono text-sm">{factura.nro_factura}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm">
                  {ResidueService.formatDate(factura.fecha_factura)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-1">
                    <DollarSign className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium">
                      {ResidueService.formatCurrency(factura.monto_factura)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {getMoraBadge(factura.estado_mora, factura.dias_mora)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <p className="text-sm text-muted-foreground">
              Mostrando {startIndex + 1} a {Math.min(endIndex, facturas.length)} de {facturas.length} facturas
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToFirstPage}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <span className="text-sm text-muted-foreground">
              Página {currentPage} de {totalPages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToLastPage}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/40 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Facturas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{facturas.length}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/40 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Monto Total Impago</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              {ResidueService.formatCurrency(montoTotal)}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/40 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Mora Promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-orange-600">
              {Math.round(promedioMora)} días
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/40 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Facturas Críticas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-700">
              {facturasCriticas}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sucursales Summary */}
      {Object.keys(facturasPorSucursal).length > 1 && (
        <Card className="bg-white/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="h-5 w-5" />
              <span>Facturas por Sucursal</span>
            </CardTitle>
            <CardDescription>
              Distribución de facturas impagas por sucursal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(facturasPorSucursal)
                .sort(([,a], [,b]) => 
                  b.reduce((sum, f) => sum + f.monto_factura, 0) - 
                  a.reduce((sum, f) => sum + f.monto_factura, 0)
                )
                .map(([sucursal, facturasSucursal]) => (
                <div key={sucursal} className="p-3 border rounded-lg bg-white/60">
                  <div className="flex items-center space-x-2 mb-2">
                    <Building className="h-4 w-4 text-blue-500" />
                    <h4 className="font-medium text-sm">{sucursal}</h4>
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p>Facturas: {facturasSucursal.length}</p>
                    <p>Monto: {ResidueService.formatCurrency(facturasSucursal.reduce((sum, f) => sum + f.monto_factura, 0))}</p>
                    <p>Mora prom: {Math.round(facturasSucursal.reduce((sum, f) => sum + f.dias_mora, 0) / facturasSucursal.length)} días</p>
                    <div className="flex space-x-1 mt-2">
                      {facturasSucursal.some(f => f.estado_mora === 'Crítica') && (
                        <Badge variant="destructive" className="text-xs px-1 py-0">C</Badge>
                      )}
                      {facturasSucursal.some(f => f.estado_mora === 'Alta') && (
                        <Badge variant="default" className="text-xs px-1 py-0">A</Badge>
                      )}
                      {facturasSucursal.some(f => f.estado_mora === 'Media') && (
                        <Badge variant="secondary" className="text-xs px-1 py-0">M</Badge>
                      )}
                      {facturasSucursal.some(f => f.estado_mora === 'Baja') && (
                        <Badge variant="outline" className="text-xs px-1 py-0">B</Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}