import { useState } from 'react';
import { ResidueService, type GuiaResiduos } from './services/ResidueService';
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
  Trash2,
  Recycle,
  AlertTriangle,
  CheckCircle,
  Building,
  MapPin,
  BarChart3
} from 'lucide-react';

interface ResidueTableProps {
  guias: GuiaResiduos[];
  clienteNombre?: string;
}

export function ResidueTable({ guias, clienteNombre = 'Cliente' }: ResidueTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate pagination
  const totalPages = Math.ceil(guias.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentGuias = guias.slice(startIndex, endIndex);

  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);
  const goToPreviousPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));

  // Export functions
  const handleExportExcel = async () => {
    await ExportService.exportGuiasToExcel(guias, clienteNombre);
  };

  const handleExportPDF = async () => {
    await ExportService.exportGuiasToPDF(guias, clienteNombre);
  };

  const getServiceIcon = (servicio: string) => {
    if (servicio.includes('DOMICILIARIOS') || servicio.includes('SOLIDOS')) {
      return <Trash2 className="h-4 w-4 text-blue-500" />;
    }
    if (servicio.includes('RECICLABLES') || servicio.includes('ELECTRONICOS')) {
      return <Recycle className="h-4 w-4 text-green-500" />;
    }
    if (servicio.includes('PELIGROSOS')) {
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
    return <CheckCircle className="h-4 w-4 text-gray-500" />;
  };

  const getFrecuenciaBadge = (frecuencia: string) => {
    const variants = {
      'POR RETIRO': 'secondary',
      'DIARIA': 'default',
      'SEMANAL': 'outline',
      'QUINCENAL': 'outline',
      'MENSUAL': 'outline'
    } as const;
    
    return (
      <Badge variant={variants[frecuencia as keyof typeof variants] || 'secondary'}>
        {frecuencia}
      </Badge>
    );
  };

  const hasExceso = (guia: GuiaResiduos) => {
    return guia.lts_limite > 0 && guia.lts_retirados > guia.lts_limite;
  };

  // Group guías by sucursal for better organization
  const guiasPorSucursal = currentGuias.reduce((acc, guia) => {
    if (!acc[guia.sucursal]) {
      acc[guia.sucursal] = [];
    }
    acc[guia.sucursal].push(guia);
    return acc;
  }, {} as Record<string, GuiaResiduos[]>);

  if (guias.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <Trash2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay guías de retiro registradas</p>
            <p className="text-sm">Las guías aparecerán aquí cuando se registren retiros</p>
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
          <BarChart3 className="h-5 w-5 text-green-600" />
          <span className="text-sm font-medium text-muted-foreground">
            {guias.length} guías de retiro
          </span>
        </div>
        
        <ExportButtons
          onExportExcel={handleExportExcel}
          onExportPDF={handleExportPDF}
          recordCount={guias.length}
          variant="outline"
          size="sm"
        />
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-white/50 backdrop-blur-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/20">
              <TableHead className="font-medium">Guía</TableHead>
              <TableHead className="font-medium">Fecha</TableHead>
              <TableHead className="font-medium">Sucursal</TableHead>
              <TableHead className="font-medium">Servicio</TableHead>
              <TableHead className="font-medium">Frecuencia</TableHead>
              <TableHead className="font-medium text-right">Lts Límite</TableHead>
              <TableHead className="font-medium text-right">Lts Retirados</TableHead>
              <TableHead className="font-medium text-right">Valor Servicio</TableHead>
              <TableHead className="font-medium text-right">Valor Lt Adic.</TableHead>
              <TableHead className="font-medium">Patente</TableHead>
              <TableHead className="font-medium text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentGuias.map((guia) => (
              <TableRow key={guia.id} className="hover:bg-muted/20">
                <TableCell className="font-mono font-medium">
                  {guia.guia}
                </TableCell>
                <TableCell>
                  {ResidueService.formatDate(guia.fecha)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">{guia.sucursal}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {getServiceIcon(guia.servicio)}
                    <span className="text-sm">{guia.servicio}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {getFrecuenciaBadge(guia.frecuencia)}
                </TableCell>
                <TableCell className="text-right">
                  {guia.lts_limite > 0 ? ResidueService.formatNumber(guia.lts_limite) : '-'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-1">
                    <span className={hasExceso(guia) ? 'text-orange-600 font-medium' : ''}>
                      {ResidueService.formatNumber(guia.lts_retirados)}
                    </span>
                    {hasExceso(guia) && (
                      <AlertTriangle className="h-3 w-3 text-orange-500" title="Exceso de límite" />
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {ResidueService.formatCurrency(guia.valor_servicio)}
                </TableCell>
                <TableCell className="text-right">
                  {guia.valor_lt_adic > 0 ? (
                    <span className="text-orange-600 font-medium">
                      {ResidueService.formatCurrency(guia.valor_lt_adic)}
                    </span>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-mono text-xs">
                    {guia.patente}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {ResidueService.formatCurrency(guia.total)}
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
              Mostrando {startIndex + 1} a {Math.min(endIndex, guias.length)} de {guias.length} guías
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
            <CardTitle className="text-sm">Total Guías</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{guias.length}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/40 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Litros Retirados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {ResidueService.formatNumber(guias.reduce((sum, g) => sum + g.lts_retirados, 0))}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/40 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Facturado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {ResidueService.formatCurrency(guias.reduce((sum, g) => sum + g.total, 0))}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/40 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Sucursales Activas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {new Set(guias.map(g => g.sucursal)).size}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sucursales Summary */}
      {Object.keys(guiasPorSucursal).length > 1 && (
        <Card className="bg-white/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Resumen por Sucursal</span>
            </CardTitle>
            <CardDescription>
              Distribución de guías por sucursal mostrada
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(guiasPorSucursal)
                .sort(([,a], [,b]) => b.length - a.length)
                .map(([sucursal, guiasSucursal]) => (
                <div key={sucursal} className="p-3 border rounded-lg bg-white/60">
                  <div className="flex items-center space-x-2 mb-2">
                    <Building className="h-4 w-4 text-blue-500" />
                    <h4 className="font-medium text-sm">{sucursal}</h4>
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p>Guías: {guiasSucursal.length}</p>
                    <p>Litros: {ResidueService.formatNumber(guiasSucursal.reduce((sum, g) => sum + g.lts_retirados, 0))}</p>
                    <p>Valor: {ResidueService.formatCurrency(guiasSucursal.reduce((sum, g) => sum + g.total, 0))}</p>
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