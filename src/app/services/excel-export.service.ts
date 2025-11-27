import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Injectable({ providedIn: 'root' })
export class ExcelExportService {
  /**
   * Exporta una tabla dinámica a Excel
   * @param data Array de objetos
   * @param fileName Nombre del archivo
   * @param headers Encabezados personalizados (opcional)
   * @param metaData Líneas superiores al Excel con info adicional (opcional)
   */
  exportToExcel(
    data: any[],
    fileName: string,
    headers?: string[],
    metaData?: string[][]
  ): void {
    if (!data || !data.length) return;

    const exportData: any[][] = [];

    // 1. MetaData (opcional)
    if (metaData && metaData.length) {
      exportData.push(...metaData);
      exportData.push([]); // línea vacía
    }

    // 2. Detectar columnas únicas si no se pasan headers
    let finalHeaders: string[] = [];

    if (headers && headers.length) {
      finalHeaders = headers;
    } else {
      const allKeys = new Set<string>();
      data.forEach(obj => {
        Object.keys(obj).forEach(key => allKeys.add(key));
      });
      finalHeaders = Array.from(allKeys);
    }

    exportData.push(finalHeaders);

    // 3. Formatear filas
    for (const row of data) {
      const rowData = finalHeaders.map(key => {
        const val = row[key];
        return typeof val === 'number' ? parseFloat(val.toFixed(2)) : val;
      });
      exportData.push(rowData);
    }

    // 4. Crear hoja y libro
    const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(exportData);
    worksheet['!cols'] = this.calculateColumnWidths(exportData);

    const workbook: XLSX.WorkBook = {
      Sheets: { 'Resultados': worksheet },
      SheetNames: ['Resultados']
    };

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    saveAs(blob, `${fileName}.xlsx`);
  }

  // Autoajuste de ancho de columnas
  private calculateColumnWidths(data: any[][]): { wch: number }[] {
    return data[0].map((_, colIndex) => {
      const max = data.reduce((prev, curr) => {
        const val = curr[colIndex];
        return Math.max(prev, val ? val.toString().length : 0);
      }, 10);
      return { wch: max + 2 };
    });
  }
}
