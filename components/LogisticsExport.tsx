import { useState } from 'react';
import { type Guia, LogisticsService } from './services/LogisticsService';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { toast } from 'sonner@2.0.3';
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';

interface LogisticsExportProps {
  guias: Guia[];
  empresa: string;
  filtros: {
    fechaInicio?: string;
    fechaFin?: string;
    estado?: string;
    servicio?: string;
    cliente?: string;
    numeroGuia?: string;
  };
}

export function LogisticsExport({ guias, empresa, filtros }: LogisticsExportProps) {
  const [isExporting, setIsExporting] = useState(false);

  const exportToExcel = async () => {
    setIsExporting(true);
    
    try {
      // Create Excel workbook data
      const headers = [
        'N° Guía',
        'Fecha',
        'Cliente',
        'Servicio',
        'Origen',
        'Destino',
        'Volumen (m³)',
        'Peso (kg)',
        'Valor Declarado',
        'Flete',
        'Seguro',
        'Otros Cargos',
        'Total',
        'Estado',
        'Observaciones'
      ];

      const data = guias.map(guia => [
        guia.numero_guia || '',
        LogisticsService.formatDate(guia.fecha),
        guia.cliente_nombre || '',
        guia.servicio || '',
        guia.origen || '',
        guia.destino || '',
        guia.volumen || 0,
        guia.peso || 0,
        guia.valor_declarado || 0,
        guia.flete || 0,
        guia.seguro || 0,
        guia.otros_cargos || 0,
        guia.total || 0,
        guia.estado || '',
        guia.observaciones || ''
      ]);

      // Create CSV content
      const csvContent = [
        headers.join(','),
        ...data.map(row => 
          row.map(cell => 
            typeof cell === 'string' && cell.includes(',') 
              ? `"${cell}"` 
              : cell
          ).join(',')
        )
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `guias_logisticas_${empresa.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Exportación exitosa', {
        description: `Se exportaron ${guias.length} guías a Excel`,
        duration: 3000,
      });

    } catch (error) {
      console.error('Export to Excel error:', error);
      toast.error('Error en exportación', {
        description: 'No se pudo exportar el archivo Excel',
        duration: 4000,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportToPDF = async () => {
    setIsExporting(true);
    
    try {
      // Create PDF content as HTML
      const htmlContent = createPDFContent();
      
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('No se pudo abrir la ventana de impresión');
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Reporte de Guías - ${empresa}</title>
          <meta charset="utf-8">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              color: #333;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              border-bottom: 2px solid #4F46E5;
              padding-bottom: 20px;
            }
            .company-name { 
              font-size: 24px; 
              font-weight: bold; 
              color: #4F46E5;
              margin-bottom: 5px;
            }
            .report-title { 
              font-size: 18px; 
              color: #666;
              margin-bottom: 10px;
            }
            .report-date { 
              font-size: 12px; 
              color: #888;
            }
            .filters { 
              background: #F8F9FA; 
              padding: 15px; 
              border-radius: 8px; 
              margin-bottom: 20px;
              border-left: 4px solid #4F46E5;
            }
            .filters h3 { 
              margin: 0 0 10px 0; 
              color: #4F46E5;
              font-size: 14px;
            }
            .filter-item { 
              display: inline-block; 
              margin-right: 20px; 
              font-size: 12px;
              color: #666;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 20px;
              font-size: 11px;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 8px; 
              text-align: left;
            }
            th { 
              background-color: #4F46E5; 
              color: white; 
              font-weight: bold;
            }
            tr:nth-child(even) { 
              background-color: #f9f9f9; 
            }
            .summary { 
              background: #F0F9FF; 
              padding: 15px; 
              border-radius: 8px; 
              margin-top: 20px;
              border-left: 4px solid #0EA5E9;
            }
            .summary h3 { 
              margin: 0 0 10px 0; 
              color: #0EA5E9;
            }
            .summary-grid { 
              display: grid; 
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
              gap: 10px;
            }
            .summary-item { 
              font-size: 12px;
            }
            .summary-label { 
              font-weight: bold; 
              color: #333;
            }
            .summary-value { 
              color: #0EA5E9; 
              font-weight: bold;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${htmlContent}
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
        </html>
      `);

      printWindow.document.close();

      toast.success('PDF generado', {
        description: 'Se abrió la ventana de impresión para generar el PDF',
        duration: 3000,
      });

    } catch (error) {
      console.error('Export to PDF error:', error);
      toast.error('Error en exportación', {
        description: 'No se pudo generar el archivo PDF',
        duration: 4000,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const createPDFContent = () => {
    // Calculate summary data
    const totalGuias = guias.length;
    const totalVolumen = guias.reduce((sum, g) => sum + (g.volumen || 0), 0);
    const totalPeso = guias.reduce((sum, g) => sum + (g.peso || 0), 0);
    const totalValor = guias.reduce((sum, g) => sum + (g.total || 0), 0);
    const totalFlete = guias.reduce((sum, g) => sum + (g.flete || 0), 0);

    // Get active filters
    const activeFilters = Object.entries(filtros)
      .filter(([key, value]) => value && value !== '')
      .map(([key, value]) => {
        const labels: Record<string, string> = {
          fechaInicio: 'Fecha Inicio',
          fechaFin: 'Fecha Fin',
          estado: 'Estado',
          servicio: 'Servicio',
          cliente: 'Cliente',
          numeroGuia: 'N° Guía'
        };
        return `${labels[key] || key}: ${value}`;
      });

    return `
      <div class="header">
        <div class="company-name">${empresa}</div>
        <div class="report-title">Reporte de Guías Logísticas</div>
        <div class="report-date">Generado el ${new Date().toLocaleString('es-CO')}</div>
      </div>

      ${activeFilters.length > 0 ? `
        <div class="filters">
          <h3>Filtros Aplicados:</h3>
          ${activeFilters.map(filter => `<span class="filter-item">${filter}</span>`).join('')}
        </div>
      ` : ''}

      <table>
        <thead>
          <tr>
            <th>N° Guía</th>
            <th>Fecha</th>
            <th>Cliente</th>
            <th>Servicio</th>
            <th>Origen</th>
            <th>Destino</th>
            <th>Vol. (m³)</th>
            <th>Peso (kg)</th>
            <th>Total</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          ${guias.map(guia => `
            <tr>
              <td>${guia.numero_guia || ''}</td>
              <td>${LogisticsService.formatDate(guia.fecha)}</td>
              <td>${guia.cliente_nombre || ''}</td>
              <td>${guia.servicio || ''}</td>
              <td>${guia.origen || ''}</td>
              <td>${guia.destino || ''}</td>
              <td>${guia.volumen ? LogisticsService.formatNumber(guia.volumen) : '0'}</td>
              <td>${guia.peso ? LogisticsService.formatNumber(guia.peso) : '0'}</td>
              <td>${guia.total ? LogisticsService.formatCurrency(guia.total) : '$0'}</td>
              <td>${guia.estado || ''}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="summary">
        <h3>Resumen del Reporte</h3>
        <div class="summary-grid">
          <div class="summary-item">
            <span class="summary-label">Total Guías:</span>
            <span class="summary-value">${LogisticsService.formatNumber(totalGuias)}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Volumen Total:</span>
            <span class="summary-value">${LogisticsService.formatNumber(totalVolumen)} m³</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Peso Total:</span>
            <span class="summary-value">${LogisticsService.formatNumber(totalPeso)} kg</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Valor Total:</span>
            <span class="summary-value">${LogisticsService.formatCurrency(totalValor)}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Flete Total:</span>
            <span class="summary-value">${LogisticsService.formatCurrency(totalFlete)}</span>
          </div>
        </div>
      </div>
    `;
  };

  if (guias.length === 0) {
    return (
      <Button variant="outline" disabled>
        <Download className="w-4 h-4 mr-2" />
        Sin datos para exportar
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isExporting}>
          {isExporting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          Exportar ({guias.length})
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToExcel} disabled={isExporting}>
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Exportar a Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToPDF} disabled={isExporting}>
          <FileText className="w-4 h-4 mr-2" />
          Exportar a PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}