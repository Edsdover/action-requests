import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

@Injectable()
export class XlsxService {

  constructor() { }

  export(
    data: any[],
    filename = `action-reports-export-${ new Date().toISOString().slice(0, 16).replace(/[T:]/g, '-') }.xlsx`
  ): void {
    /* generate worksheet */
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    /* save to file */
    XLSX.writeFile(wb, filename);
  }
}
