import { useState } from 'react';
import { type Guia, LogisticsService } from './services/LogisticsService';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  MapPin, 
  Package, 
  Calendar, 
  DollarSign,
  Weight,
  FileText,
  Truck
} from 'lucide-react';

interface GuiasTableProps {
  guias: Guia[];
}

export function GuiasTable({ guias }: GuiasTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedGuia, setSelectedGuia] = useState<Guia | null>(null);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(guias.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentGuias = guias.slice(startIndex, endIndex);

  const getEstadoBadgeVariant = (estado: string | undefined) => {
    switch (estado?.toLowerCase()) {
      case 'entregado':
        return 'default'; // Green
      case 'en tránsito':
      case 'en transito':
        return 'secondary'; // Blue
      case 'programado':
        return 'outline'; // Gray
      case 'cancelado':
        return 'destructive'; // Red
      default:
        return 'secondary';
    }
  };

  const getServicioColor = (servicio: string | undefined) => {
    switch (servicio?.toLowerCase()) {
      case 'transporte terrestre':
        return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20';
      case 'transporte aéreo':
        return 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20';
      case 'transporte marítimo':
        return 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20';
      case 'distribución urbana':
        return 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20';
      case 'courier express':
        return 'text-pink-600 bg-pink-50 dark:text-pink-400 dark:bg-pink-900/20';
      default:
        return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  if (guias.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">No hay guías disponibles</h3>
          <p className="text-sm text-muted-foreground text-center">
            No se encontraron guías que coincidan con los filtros aplicados.<br />
            Intenta ajustar los criterios de búsqueda.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table */}
      <div className="hidden lg:block rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-medium">N° Guía</TableHead>
              <TableHead className="font-medium">Fecha</TableHead>
              <TableHead className="font-medium">Cliente</TableHead>
              <TableHead className="font-medium">Servicio</TableHead>
              <TableHead className="font-medium">Origen → Destino</TableHead>
              <TableHead className="font-medium text-right">Volumen</TableHead>
              <TableHead className="font-medium text-right">Total</TableHead>
              <TableHead className="font-medium">Estado</TableHead>
              <TableHead className="font-medium">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentGuias.map((guia) => (
              <TableRow key={guia.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>{guia.numero_guia}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{LogisticsService.formatDate(guia.fecha)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-32 truncate" title={guia.cliente_nombre}>
                    {guia.cliente_nombre || 'N/A'}
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getServicioColor(guia.servicio)}`}>
                    {guia.servicio || 'N/A'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1 text-sm">
                    <span className="truncate max-w-16" title={guia.origen}>
                      {guia.origen || 'N/A'}
                    </span>
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span className="truncate max-w-16" title={guia.destino}>
                      {guia.destino || 'N/A'}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-1">
                    <Weight className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">
                      {guia.volumen ? LogisticsService.formatNumber(guia.volumen) : '0'}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {guia.total ? LogisticsService.formatCurrency(guia.total) : '$0'}
                </TableCell>
                <TableCell>
                  <Badge variant={getEstadoBadgeVariant(guia.estado)}>
                    {guia.estado || 'Sin Estado'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedGuia(guia)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                          <Truck className="h-5 w-5" />
                          <span>Detalles de Guía {guia.numero_guia}</span>
                        </DialogTitle>
                        <DialogDescription>
                          Información completa de la guía logística
                        </DialogDescription>
                      </DialogHeader>
                      {selectedGuia && <GuiaDetails guia={selectedGuia} />}
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4">
        {currentGuias.map((guia) => (
          <Card key={guia.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{guia.numero_guia}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{LogisticsService.formatDate(guia.fecha)}</span>
                  </div>
                </div>
                <Badge variant={getEstadoBadgeVariant(guia.estado)}>
                  {guia.estado || 'Sin Estado'}
                </Badge>
              </div>

              <div className="space-y-2 mb-3">
                <div className="text-sm">
                  <span className="font-medium">Cliente: </span>
                  <span>{guia.cliente_nombre || 'N/A'}</span>
                </div>
                
                <div className="text-sm">
                  <span className="font-medium">Servicio: </span>
                  <span className={`px-2 py-1 rounded text-xs ${getServicioColor(guia.servicio)}`}>
                    {guia.servicio || 'N/A'}
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-sm">
                  <span className="font-medium">Ruta:</span>
                  <span>{guia.origen || 'N/A'}</span>
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span>{guia.destino || 'N/A'}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <Weight className="h-3 w-3 text-muted-foreground" />
                    <span>{guia.volumen ? LogisticsService.formatNumber(guia.volumen) : '0'}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <DollarSign className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium">
                      {guia.total ? LogisticsService.formatCurrency(guia.total) : '$0'}
                    </span>
                  </div>
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedGuia(guia)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="flex items-center space-x-2">
                        <Truck className="h-5 w-5" />
                        <span>Detalles de Guía {guia.numero_guia}</span>
                      </DialogTitle>
                      <DialogDescription>
                        Información completa de la guía logística
                      </DialogDescription>
                    </DialogHeader>
                    {selectedGuia && <GuiaDetails guia={selectedGuia} />}
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Mostrando {startIndex + 1}-{Math.min(endIndex, guias.length)} de {guias.length} guías
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Guia Details Component
function GuiaDetails({ guia }: { guia: Guia }) {
  return (
    <ScrollArea className="max-h-96">
      <div className="space-y-6">
        {/* Basic Info */}
        <div>
          <h4 className="font-medium mb-3">Información Básica</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">N° Guía:</span>
              <p className="font-medium">{guia.numero_guia}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Fecha:</span>
              <p className="font-medium">{LogisticsService.formatDate(guia.fecha)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Cliente:</span>
              <p className="font-medium">{guia.cliente_nombre || 'N/A'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Servicio:</span>
              <p className="font-medium">{guia.servicio || 'N/A'}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Route Info */}
        <div>
          <h4 className="font-medium mb-3">Información de Ruta</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Origen:</span>
              <p className="font-medium">{guia.origen || 'N/A'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Destino:</span>
              <p className="font-medium">{guia.destino || 'N/A'}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Physical Details */}
        <div>
          <h4 className="font-medium mb-3">Detalles Físicos</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Volumen:</span>
              <p className="font-medium">
                {guia.volumen ? `${LogisticsService.formatNumber(guia.volumen)} m³` : 'N/A'}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Peso:</span>
              <p className="font-medium">
                {guia.peso ? `${LogisticsService.formatNumber(guia.peso)} kg` : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Financial Details */}
        <div>
          <h4 className="font-medium mb-3">Información Financiera</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Valor Declarado:</span>
              <p className="font-medium">
                {guia.valor_declarado ? LogisticsService.formatCurrency(guia.valor_declarado) : 'N/A'}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Flete:</span>
              <p className="font-medium">
                {guia.flete ? LogisticsService.formatCurrency(guia.flete) : 'N/A'}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Seguro:</span>
              <p className="font-medium">
                {guia.seguro ? LogisticsService.formatCurrency(guia.seguro) : 'N/A'}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Otros Cargos:</span>
              <p className="font-medium">
                {guia.otros_cargos ? LogisticsService.formatCurrency(guia.otros_cargos) : 'N/A'}
              </p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total:</span>
              <span className="text-lg font-bold">
                {guia.total ? LogisticsService.formatCurrency(guia.total) : '$0'}
              </span>
            </div>
          </div>
        </div>

        {/* Status and Notes */}
        {(guia.estado || guia.observaciones) && (
          <>
            <Separator />
            <div>
              <h4 className="font-medium mb-3">Estado y Observaciones</h4>
              <div className="space-y-3">
                {guia.estado && (
                  <div>
                    <span className="text-muted-foreground">Estado:</span>
                    <p>
                      <Badge variant={guia.estado === 'Entregado' ? 'default' : 'secondary'}>
                        {guia.estado}
                      </Badge>
                    </p>
                  </div>
                )}
                {guia.observaciones && (
                  <div>
                    <span className="text-muted-foreground">Observaciones:</span>
                    <p className="text-sm mt-1 p-2 bg-muted rounded">
                      {guia.observaciones}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </ScrollArea>
  );
}