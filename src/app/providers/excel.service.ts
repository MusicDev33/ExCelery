import { Injectable } from '@angular/core';
import * as fs from 'fs';
import * as path from 'path';
import { Workbook, Worksheet } from 'exceljs';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ExcelFile {
  workbook: Workbook;
  filename: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExcelService {
  workbooks: Array<string> = [];
  currentWorksheet: Worksheet;

  currentWsHeaders: Array<string> = [];
  wsHeaderToInt: any = {};
  intToWsHeader: any = [];
  wsHeaderToCells: any = {};

  path: string;

  loading = false;

  private wbSource = new BehaviorSubject<ExcelFile>({workbook: new Workbook(), filename: ''});
  currentWorkbook = this.wbSource.asObservable();

  constructor() { }

  getWorkbooks() {
    return this.workbooks;
  }

  setPath(filePath) {
    this.path = filePath;
  }

  loadExcel(filepath, callback) {
    this.workbooks = [];
    fs.readdir(filepath + '/sheets', (err, files) => {
      if (files) {
        files.forEach((wb) => {
          if (!wb.startsWith('~') && wb.includes('.')) {
            this.workbooks.push(wb);
          }
        });
        callback();
      }
    });
  }

  saveExcel(filename, workbook, callback) {
    workbook.xlsx.writeFile(this.path + '/sheets/' + filename)
      .then( () => {
        callback();
      });
  }

  async openWorkbook(filename: string) {
    this.loading = true;
    const workbook = new Workbook();
    const promise = workbook.xlsx.readFile(this.path + '/sheets/' + filename)
      .then(() => {
        // use workbook
        workbook.getWorksheet(1).name = workbook.getWorksheet(1).name.slice(0, 31);
        const excelFile: ExcelFile = { workbook: workbook, filename: filename };
        this.wbSource.next(excelFile);
      });

    const read = await promise;
  }
}
