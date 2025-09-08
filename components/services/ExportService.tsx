import { GuiaResiduos, FacturaImpaga, ResidueService } from './ResidueService';

// Utility class for exporting data to Excel and PDF
export class ExportService {
  
  // Export Guías to Excel
  static async exportGuiasToExcel(
    guias: GuiaResiduos[], 
    clienteNombre: string,
    fileName?: string
  ): Promise<void> {
    try {
      // Dynamic import to avoid bundle size issues
      const XLSX = await import('xlsx');
      
      // Prepare data for export
      const exportData = guias.map((guia, index) => ({
        '#': index + 1,
        'N° Guía': guia.guia,
        'Fecha': ResidueService.formatDate(guia.fecha),
        'Sucursal': guia.sucursal,
        'Servicio': guia.servicio,
        'Frecuencia': guia.frecuencia,
        'Lts Límite': guia.lts_limite.toLocaleString('es-CL'),
        'Lts Retirados': guia.lts_retirados.toLocaleString('es-CL'),
        'Valor Servicio': guia.valor_servicio.toLocaleString('es-CL'),
        'Valor Lt Adicional': guia.valor_lt_adic.toLocaleString('es-CL'),
        'Patente': guia.patente,
        'Total': guia.total.toLocaleString('es-CL'),
        'Observaciones': guia.observaciones || '-'
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Set column widths
      const columnWidths = [
        { wch: 5 },   // #
        { wch: 12 },  // N° Guía
        { wch: 12 },  // Fecha
        { wch: 25 },  // Sucursal
        { wch: 30 },  // Servicio
        { wch: 12 },  // Frecuencia
        { wch: 12 },  // Lts Límite
        { wch: 15 },  // Lts Retirados
        { wch: 15 },  // Valor Servicio
        { wch: 18 },  // Valor Lt Adicional
        { wch: 12 },  // Patente
        { wch: 15 },  // Total
        { wch: 20 }   // Observaciones
      ];
      ws['!cols'] = columnWidths;

      // Add header styling information
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        if (!ws[cellAddress]) continue;
        
        // Header styling would go here in a full implementation
        ws[cellAddress].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "22C55E" } },
          alignment: { horizontal: "center" }
        };
      }

      // Add worksheet to workbook
      const sheetName = `Guías ${clienteNombre}`.substring(0, 31); // Excel sheet name limit
      XLSX.utils.book_append_sheet(wb, ws, sheetName);

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 10);
      const defaultFileName = `Guias_Retiro_${clienteNombre}_${timestamp}.xlsx`;
      const finalFileName = fileName || defaultFileName;

      // Download file
      XLSX.writeFile(wb, finalFileName);
      
      console.log(`✅ Excel file exported: ${finalFileName}`);
      
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      throw new Error('Error al exportar a Excel. Verifique que su navegador soporte descargas.');
    }
  }

  // Export Facturas to Excel
  static async exportFacturasToExcel(
    facturas: FacturaImpaga[], 
    clienteNombre: string,
    fileName?: string
  ): Promise<void> {
    try {
      // Dynamic import to avoid bundle size issues
      const XLSX = await import('xlsx');
      
      // Prepare data for export
      const exportData = facturas.map((factura, index) => ({
        '#': index + 1,
        'Fecha': ResidueService.formatDate(factura.fecha),
        'Empresa': factura.empresa,
        'Sucursal': factura.sucursal,
        'RUT': factura.rut,
        'N° Guía': factura.no_guia,
        'Días Mora': factura.dias_mora,
        'N° Factura': factura.nro_factura,
        'Fecha Factura': ResidueService.formatDate(factura.fecha_factura),
        'Monto Factura': factura.monto_factura.toLocaleString('es-CL'),
        'Estado Mora': factura.estado_mora,
        'Observaciones': factura.observaciones || '-'
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Set column widths
      const columnWidths = [
        { wch: 5 },   // #
        { wch: 12 },  // Fecha
        { wch: 15 },  // Empresa
        { wch: 25 },  // Sucursal
        { wch: 15 },  // RUT
        { wch: 12 },  // N° Guía
        { wch: 10 },  // Días Mora
        { wch: 15 },  // N° Factura
        { wch: 15 },  // Fecha Factura
        { wch: 18 },  // Monto Factura
        { wch: 12 },  // Estado Mora
        { wch: 25 }   // Observaciones
      ];
      ws['!cols'] = columnWidths;

      // Add worksheet to workbook
      const sheetName = `Facturas ${clienteNombre}`.substring(0, 31);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 10);
      const defaultFileName = `Facturas_Impagas_${clienteNombre}_${timestamp}.xlsx`;
      const finalFileName = fileName || defaultFileName;

      // Download file
      XLSX.writeFile(wb, finalFileName);
      
      console.log(`✅ Excel file exported: ${finalFileName}`);
      
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      throw new Error('Error al exportar a Excel. Verifique que su navegador soporte descargas.');
    }
  }

  // Export Guías to PDF
  static async exportGuiasToPDF(
    guias: GuiaResiduos[], 
    clienteNombre: string,
    fileName?: string
  ): Promise<void> {
    try {
      // Import jsPDF first
      const jsPDFModule = await import('jspdf');
      const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default;
      
      // Import and register autoTable plugin
      const autoTableModule = await import('jspdf-autotable');
      
      // Create new PDF document
      const doc = new jsPDF('l', 'mm', 'a4'); // landscape orientation
      
      // Verify autoTable is available
      if (typeof (doc as any).autoTable !== 'function') {
        console.error('autoTable plugin not loaded properly');
        // Try alternative approach
        if (autoTableModule.default) {
          (doc as any).autoTable = autoTableModule.default;
        } else {
          throw new Error('autoTable plugin could not be loaded');
        }
      }
      
      // Add title and header info
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // LOGISAMB Header
      doc.setFillColor(34, 197, 94); // Green color
      doc.rect(0, 0, pageWidth, 25, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.text('LOGISAMB - Sistema de Gestión Integral de Residuos', 20, 15);
      
      // Client and report info
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.text(`Cliente: ${clienteNombre}`, 20, 35);
      doc.setFontSize(12);
      doc.text(`Reporte de Guías de Retiro`, 20, 45);
      doc.text(`Fecha: ${new Date().toLocaleDateString('es-CL')}`, 20, 52);
      doc.text(`Total registros: ${guias.length}`, 20, 59);

      // Prepare table data
      const tableData = guias.map(guia => [
        guia.guia,
        ResidueService.formatDate(guia.fecha),
        guia.sucursal,
        guia.servicio,
        guia.frecuencia,
        guia.lts_limite.toLocaleString('es-CL'),
        guia.lts_retirados.toLocaleString('es-CL'),
        ResidueService.formatCurrency(guia.valor_servicio),
        ResidueService.formatCurrency(guia.valor_lt_adic),
        guia.patente,
        ResidueService.formatCurrency(guia.total)
      ]);

      // Create table using autoTable
      (doc as any).autoTable({
        head: [['N° Guía', 'Fecha', 'Sucursal', 'Servicio', 'Frecuencia', 'Lts Límite', 'Lts Retirados', 'Valor Servicio', 'Valor Lt Adic.', 'Patente', 'Total']],
        body: tableData,
        startY: 70,
        theme: 'grid',
        headStyles: {
          fillColor: [34, 197, 94],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 8
        },
        bodyStyles: {
          fontSize: 7,
          textColor: [0, 0, 0]
        },
        columnStyles: {
          0: { cellWidth: 20 }, // N° Guía
          1: { cellWidth: 25 }, // Fecha
          2: { cellWidth: 40 }, // Sucursal
          3: { cellWidth: 45 }, // Servicio
          4: { cellWidth: 20 }, // Frecuencia
          5: { cellWidth: 20 }, // Lts Límite
          6: { cellWidth: 25 }, // Lts Retirados
          7: { cellWidth: 25 }, // Valor Servicio
          8: { cellWidth: 25 }, // Valor Lt Adic
          9: { cellWidth: 20 }, // Patente
          10: { cellWidth: 25 } // Total
        },
        margin: { left: 20, right: 20 },
        didDrawPage: (data: any) => {
          // Add page footer
          const pageCount = doc.internal.pages.length - 1;
          doc.setFontSize(8);
          doc.setTextColor(128, 128, 128);
          doc.text(
            `Página ${data.pageNumber} de ${pageCount} - Portal LOGISAMB`,
            pageWidth / 2,
            pageHeight - 10,
            { align: 'center' }
          );
        }
      });

      // Calculate totals for summary
      const totalLitrosRetirados = guias.reduce((sum, g) => sum + g.lts_retirados, 0);
      const totalValor = guias.reduce((sum, g) => sum + g.total, 0);

      // Add summary section
      const finalY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(12);
      doc.text('Resumen:', 20, finalY);
      doc.setFontSize(10);
      doc.text(`Total Litros Retirados: ${totalLitrosRetirados.toLocaleString('es-CL')} L`, 20, finalY + 8);
      doc.text(`Total Facturado: ${ResidueService.formatCurrency(totalValor)}`, 20, finalY + 16);

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 10);
      const defaultFileName = `Guias_Retiro_${clienteNombre}_${timestamp}.pdf`;
      const finalFileName = fileName || defaultFileName;

      // Save the PDF
      doc.save(finalFileName);
      
      console.log(`✅ PDF file exported: ${finalFileName}`);
      
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      
      // Fallback: Create a simple PDF without autoTable
      try {
        await this.createSimplePDFGuias(guias, clienteNombre, fileName);
      } catch (fallbackError) {
        console.error('Fallback PDF creation also failed:', fallbackError);
        throw new Error('Error al exportar a PDF. Intente exportar a Excel como alternativa.');
      }
    }
  }

  // Export Facturas to PDF
  static async exportFacturasToPDF(
    facturas: FacturaImpaga[], 
    clienteNombre: string,
    fileName?: string
  ): Promise<void> {
    try {
      // Import jsPDF first
      const jsPDFModule = await import('jspdf');
      const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default;
      
      // Import and register autoTable plugin
      const autoTableModule = await import('jspdf-autotable');
      
      // Create new PDF document
      const doc = new jsPDF('l', 'mm', 'a4'); // landscape orientation
      
      // Verify autoTable is available
      if (typeof (doc as any).autoTable !== 'function') {
        console.error('autoTable plugin not loaded properly');
        // Try alternative approach
        if (autoTableModule.default) {
          (doc as any).autoTable = autoTableModule.default;
        } else {
          throw new Error('autoTable plugin could not be loaded');
        }
      }
      
      // Add title and header info
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // LOGISAMB Header
      doc.setFillColor(220, 38, 38); // Red color for unpaid invoices
      doc.rect(0, 0, pageWidth, 25, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.text('LOGISAMB - Reporte de Facturas Impagas', 20, 15);
      
      // Client and report info
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.text(`Cliente: ${clienteNombre}`, 20, 35);
      doc.setFontSize(12);
      doc.text(`Estado de Cuenta - Facturas Pendientes`, 20, 45);
      doc.text(`Fecha: ${new Date().toLocaleDateString('es-CL')}`, 20, 52);
      doc.text(`Total facturas: ${facturas.length}`, 20, 59);

      // Calculate summary data
      const montoTotal = facturas.reduce((sum, f) => sum + f.monto_factura, 0);
      const promedioMora = facturas.length > 0 
        ? Math.round(facturas.reduce((sum, f) => sum + f.dias_mora, 0) / facturas.length)
        : 0;
      
      doc.text(`Monto total impago: ${ResidueService.formatCurrency(montoTotal)}`, 200, 52);
      doc.text(`Mora promedio: ${promedioMora} días`, 200, 59);

      // Prepare table data
      const tableData = facturas.map(factura => [
        ResidueService.formatDate(factura.fecha),
        factura.empresa,
        factura.sucursal,
        factura.rut,
        factura.no_guia,
        factura.dias_mora.toString(),
        factura.nro_factura,
        ResidueService.formatDate(factura.fecha_factura),
        ResidueService.formatCurrency(factura.monto_factura),
        factura.estado_mora
      ]);

      // Create table using autoTable
      (doc as any).autoTable({
        head: [['Fecha', 'Empresa', 'Sucursal', 'RUT', 'N° Guía', 'Días Mora', 'N° Factura', 'Fecha Factura', 'Monto', 'Estado']],
        body: tableData,
        startY: 70,
        theme: 'grid',
        headStyles: {
          fillColor: [220, 38, 38],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 8
        },
        bodyStyles: {
          fontSize: 7,
          textColor: [0, 0, 0]
        },
        columnStyles: {
          0: { cellWidth: 25 }, // Fecha
          1: { cellWidth: 25 }, // Empresa
          2: { cellWidth: 35 }, // Sucursal
          3: { cellWidth: 25 }, // RUT
          4: { cellWidth: 20 }, // N° Guía
          5: { cellWidth: 20 }, // Días Mora
          6: { cellWidth: 25 }, // N° Factura
          7: { cellWidth: 25 }, // Fecha Factura
          8: { cellWidth: 30 }, // Monto
          9: { cellWidth: 25 }  // Estado
        },
        margin: { left: 20, right: 20 },
        didDrawCell: (data: any) => {
          // Color rows based on mora status
          if (data.section === 'body' && data.column.index === 9) {
            const estado = data.cell.text[0];
            if (estado === 'Crítica') {
              data.cell.styles.fillColor = [254, 226, 226]; // Light red
            } else if (estado === 'Alta') {
              data.cell.styles.fillColor = [255, 237, 213]; // Light orange
            } else if (estado === 'Media') {
              data.cell.styles.fillColor = [254, 249, 195]; // Light yellow
            }
          }
        },
        didDrawPage: (data: any) => {
          // Add page footer
          const pageCount = doc.internal.pages.length - 1;
          doc.setFontSize(8);
          doc.setTextColor(128, 128, 128);
          doc.text(
            `Página ${data.pageNumber} de ${pageCount} - Portal LOGISAMB`,
            pageWidth / 2,
            pageHeight - 10,
            { align: 'center' }
          );
        }
      });

      // Add summary section
      const finalY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(12);
      doc.text('Resumen de Morosidad:', 20, finalY);
      
      const facturasCriticas = facturas.filter(f => f.estado_mora === 'Crítica').length;
      const facturasAltas = facturas.filter(f => f.estado_mora === 'Alta').length;
      const facturasMedias = facturas.filter(f => f.estado_mora === 'Media').length;
      const facturasBajas = facturas.filter(f => f.estado_mora === 'Baja').length;

      doc.setFontSize(10);
      doc.text(`Críticas (90+ días): ${facturasCriticas}`, 20, finalY + 8);
      doc.text(`Altas (60-89 días): ${facturasAltas}`, 20, finalY + 16);
      doc.text(`Medias (30-59 días): ${facturasMedias}`, 120, finalY + 8);
      doc.text(`Bajas (<30 días): ${facturasBajas}`, 120, finalY + 16);

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 10);
      const defaultFileName = `Facturas_Impagas_${clienteNombre}_${timestamp}.pdf`;
      const finalFileName = fileName || defaultFileName;

      // Save the PDF
      doc.save(finalFileName);
      
      console.log(`✅ PDF file exported: ${finalFileName}`);
      
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      
      // Fallback: Create a simple PDF without autoTable
      try {
        await this.createSimplePDFFacturas(facturas, clienteNombre, fileName);
      } catch (fallbackError) {
        console.error('Fallback PDF creation also failed:', fallbackError);
        throw new Error('Error al exportar a PDF. Intente exportar a Excel como alternativa.');
      }
    }
  }

  // Fallback simple PDF creation for Guías (without autoTable)
  private static async createSimplePDFGuias(
    guias: GuiaResiduos[], 
    clienteNombre: string,
    fileName?: string
  ): Promise<void> {
    const jsPDFModule = await import('jspdf');
    const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default;
    
    const doc = new jsPDF('p', 'mm', 'a4'); // portrait orientation for simple layout
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 20;

    // Header
    doc.setFillColor(34, 197, 94);
    doc.rect(0, 0, pageWidth, 20, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text('LOGISAMB - Reporte de Guías', 20, 12);
    
    // Client info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    yPosition = 35;
    doc.text(`Cliente: ${clienteNombre}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-CL')}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Total guías: ${guias.length}`, 20, yPosition);
    yPosition += 15;

    // Summary
    const totalLitros = guias.reduce((sum, g) => sum + g.lts_retirados, 0);
    const totalValor = guias.reduce((sum, g) => sum + g.total, 0);
    
    doc.setFontSize(14);
    doc.text('Resumen:', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(10);
    doc.text(`Total Litros Retirados: ${totalLitros.toLocaleString('es-CL')} L`, 20, yPosition);
    yPosition += 8;
    doc.text(`Total Facturado: ${ResidueService.formatCurrency(totalValor)}`, 20, yPosition);
    yPosition += 15;

    // List first few guías
    doc.setFontSize(12);
    doc.text('Últimas Guías:', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(8);
    const maxGuias = Math.min(guias.length, 20); // Show max 20 guías
    
    for (let i = 0; i < maxGuias; i++) {
      const guia = guias[i];
      if (yPosition > 250) { // Start new page if needed
        doc.addPage();
        yPosition = 20;
      }
      
      doc.text(`${guia.guia} - ${guia.sucursal} - ${ResidueService.formatCurrency(guia.total)}`, 20, yPosition);
      yPosition += 6;
    }

    if (guias.length > maxGuias) {
      yPosition += 5;
      doc.text(`... y ${guias.length - maxGuias} guías más`, 20, yPosition);
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text('Portal LOGISAMB - Reporte Simplificado', 20, 280);

    const timestamp = new Date().toISOString().slice(0, 10);
    const defaultFileName = `Guias_Retiro_${clienteNombre}_${timestamp}.pdf`;
    const finalFileName = fileName || defaultFileName;

    doc.save(finalFileName);
    console.log(`✅ Simple PDF file exported: ${finalFileName}`);
  }

  // Fallback simple PDF creation for Facturas (without autoTable)
  private static async createSimplePDFFacturas(
    facturas: FacturaImpaga[], 
    clienteNombre: string,
    fileName?: string
  ): Promise<void> {
    const jsPDFModule = await import('jspdf');
    const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default;
    
    const doc = new jsPDF('p', 'mm', 'a4'); // portrait orientation for simple layout
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 20;

    // Header
    doc.setFillColor(220, 38, 38);
    doc.rect(0, 0, pageWidth, 20, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text('LOGISAMB - Facturas Impagas', 20, 12);
    
    // Client info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    yPosition = 35;
    doc.text(`Cliente: ${clienteNombre}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-CL')}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Total facturas: ${facturas.length}`, 20, yPosition);
    yPosition += 15;

    // Summary
    const montoTotal = facturas.reduce((sum, f) => sum + f.monto_factura, 0);
    const promedioMora = facturas.length > 0 
      ? Math.round(facturas.reduce((sum, f) => sum + f.dias_mora, 0) / facturas.length)
      : 0;
    
    doc.setFontSize(14);
    doc.text('Resumen:', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(10);
    doc.text(`Monto Total Impago: ${ResidueService.formatCurrency(montoTotal)}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Mora Promedio: ${promedioMora} días`, 20, yPosition);
    yPosition += 15;

    // List facturas
    doc.setFontSize(12);
    doc.text('Facturas Impagas:', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(8);
    
    for (const factura of facturas) {
      if (yPosition > 250) { // Start new page if needed
        doc.addPage();
        yPosition = 20;
      }
      
      doc.text(`${factura.nro_factura} - ${factura.sucursal} - ${factura.dias_mora}d - ${ResidueService.formatCurrency(factura.monto_factura)}`, 20, yPosition);
      yPosition += 6;
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text('Portal LOGISAMB - Reporte Simplificado', 20, 280);

    const timestamp = new Date().toISOString().slice(0, 10);
    const defaultFileName = `Facturas_Impagas_${clienteNombre}_${timestamp}.pdf`;
    const finalFileName = fileName || defaultFileName;

    doc.save(finalFileName);
    console.log(`✅ Simple PDF file exported: ${finalFileName}`);
  }

  // Utility method to sanitize filename
  static sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[^a-z0-9_\-\.]/gi, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^_|_$/g, '');
  }

  // Get current timestamp for filenames
  static getTimestamp(): string {
    return new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  }
}