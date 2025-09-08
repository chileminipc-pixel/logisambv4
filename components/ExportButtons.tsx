import { useState } from 'react';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';
import { 
  Download, 
  FileSpreadsheet, 
  FileText, 
  ChevronDown,
  Loader2,
  AlertCircle
} from 'lucide-react';

export interface ExportButtonsProps {
  onExportExcel: () => Promise<void>;
  onExportPDF: () => Promise<void>;
  recordCount: number;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

export function ExportButtons({
  onExportExcel,
  onExportPDF,
  recordCount,
  variant = 'outline',
  size = 'sm',
  disabled = false,
  className = ''
}: ExportButtonsProps) {
  const [isExporting, setIsExporting] = useState<'excel' | 'pdf' | null>(null);

  const handleExport = async (type: 'excel' | 'pdf') => {
    if (recordCount === 0) {
      toast.error('Sin datos para exportar', {
        description: 'No hay registros disponibles para la exportación',
        duration: 3000,
      });
      return;
    }

    setIsExporting(type);
    
    try {
      if (type === 'excel') {
        await onExportExcel();
        toast.success('Exportación Excel completada', {
          description: `Se han exportado ${recordCount} registros exitosamente`,
          duration: 3000,
        });
      } else {
        await onExportPDF();
        toast.success('Exportación PDF completada', {
          description: `Se han exportado ${recordCount} registros exitosamente`,
          duration: 3000,
        });
      }
    } catch (error) {
      console.error(`Error exporting to ${type}:`, error);
      
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido durante la exportación';
      
      // Show specific error for PDF issues
      if (type === 'pdf' && errorMessage.includes('autoTable')) {
        toast.error('Error en exportación PDF', {
          description: 'Se creó un PDF simplificado. Para tablas completas, use Excel.',
          duration: 5000,
        });
      } else if (type === 'pdf' && errorMessage.includes('Excel como alternativa')) {
        toast.error('PDF no disponible', {
          description: 'Use la exportación Excel para obtener todos los datos.',
          duration: 5000,
          action: {
            label: 'Exportar Excel',
            onClick: () => handleExport('excel')
          }
        });
      } else {
        toast.error(`Error en exportación ${type.toUpperCase()}`, {
          description: errorMessage,
          duration: 5000,
        });
      }
    } finally {
      setIsExporting(null);
    }
  };

  const isLoading = isExporting !== null;
  const buttonSize = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={buttonSize}
          disabled={disabled || isLoading}
          className={`${className} ${recordCount === 0 ? 'opacity-50' : ''}`}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Exportando {isExporting?.toUpperCase()}...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Exportar
              <ChevronDown className="h-4 w-4 ml-2" />
            </>
          )}
          {recordCount > 0 && !isLoading && (
            <Badge variant="secondary" className="ml-2">
              {recordCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem
          onClick={() => handleExport('excel')}
          disabled={disabled || isLoading || recordCount === 0}
          className="cursor-pointer"
        >
          <div className="flex items-center space-x-3 w-full">
            {isExporting === 'excel' ? (
              <Loader2 className="h-4 w-4 animate-spin text-green-600" />
            ) : (
              <FileSpreadsheet className="h-4 w-4 text-green-600" />
            )}
            <div className="flex flex-col">
              <span className="font-medium">Excel (.xlsx)</span>
              <span className="text-xs text-muted-foreground">
                Hoja de cálculo completa
              </span>
            </div>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => handleExport('pdf')}
          disabled={disabled || isLoading || recordCount === 0}
          className="cursor-pointer"
        >
          <div className="flex items-center space-x-3 w-full">
            {isExporting === 'pdf' ? (
              <Loader2 className="h-4 w-4 animate-spin text-red-600" />
            ) : (
              <FileText className="h-4 w-4 text-red-600" />
            )}
            <div className="flex flex-col">
              <span className="font-medium">PDF (.pdf)</span>
              <span className="text-xs text-muted-foreground">
                Documento profesional
              </span>
            </div>
          </div>
        </DropdownMenuItem>
        
        {recordCount === 0 && (
          <div className="px-2 py-1 text-xs text-muted-foreground border-t">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-3 w-3" />
              <span>No hay datos para exportar</span>
            </div>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Simplified export buttons for contexts where dropdown is not needed
export interface SimpleExportButtonsProps {
  onExportExcel: () => Promise<void>;
  onExportPDF: () => Promise<void>;
  recordCount: number;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

export function SimpleExportButtons({
  onExportExcel,
  onExportPDF,
  recordCount,
  variant = 'outline',
  size = 'sm',
  disabled = false,
  className = ''
}: SimpleExportButtonsProps) {
  const [isExporting, setIsExporting] = useState<'excel' | 'pdf' | null>(null);

  const handleExport = async (type: 'excel' | 'pdf') => {
    if (recordCount === 0) {
      toast.error('Sin datos para exportar', {
        description: 'No hay registros disponibles para la exportación',
        duration: 3000,
      });
      return;
    }

    setIsExporting(type);
    
    try {
      if (type === 'excel') {
        await onExportExcel();
        toast.success('Exportación Excel completada', {
          description: `Se han exportado ${recordCount} registros exitosamente`,
          duration: 3000,
        });
      } else {
        await onExportPDF();
        toast.success('Exportación PDF completada', {
          description: `Se han exportado ${recordCount} registros exitosamente`,
          duration: 3000,
        });
      }
    } catch (error) {
      console.error(`Error exporting to ${type}:`, error);
      
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido durante la exportación';
      
      // Show specific error for PDF issues
      if (type === 'pdf' && errorMessage.includes('Excel como alternativa')) {
        toast.error('PDF no disponible', {
          description: 'Use la exportación Excel para obtener todos los datos.',
          duration: 5000,
          action: {
            label: 'Exportar Excel',
            onClick: () => handleExport('excel')
          }
        });
      } else {
        toast.error(`Error en exportación ${type.toUpperCase()}`, {
          description: errorMessage,
          duration: 5000,
        });
      }
    } finally {
      setIsExporting(null);
    }
  };

  const isLoading = isExporting !== null;
  const buttonSize = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default';

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Button
        variant={variant}
        size={buttonSize}
        onClick={() => handleExport('excel')}
        disabled={disabled || isLoading || recordCount === 0}
        className={recordCount === 0 ? 'opacity-50' : ''}
      >
        {isExporting === 'excel' ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
        )}
        Excel
      </Button>
      
      <Button
        variant={variant}
        size={buttonSize}
        onClick={() => handleExport('pdf')}
        disabled={disabled || isLoading || recordCount === 0}
        className={recordCount === 0 ? 'opacity-50' : ''}
      >
        {isExporting === 'pdf' ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <FileText className="h-4 w-4 mr-2 text-red-600" />
        )}
        PDF
      </Button>
    </div>
  );
}