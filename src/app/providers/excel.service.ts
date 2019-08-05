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
            console.log(wb);
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

  getWsHeaders(worksheet) {
    this.currentWorksheet = worksheet;
    this.wsHeaderToCells = {};
    this.intToWsHeader = {};
    this.wsHeaderToInt = {};
    const wsHeaders = [];
    const row = worksheet.getRow(1);
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      if (cell.value != null) {
        wsHeaders.push(cell.value);
        this.wsHeaderToInt[cell.value] = colNumber;
        this.intToWsHeader[colNumber] = cell.value;
        this.wsHeaderToCells[cell.value] = [];
      }
    });
    this.currentWsHeaders = wsHeaders;
    return wsHeaders;
  }

  getColumnMap() {
    return this.wsHeaderToInt;
  }

  getColumnData() {
    this.currentWsHeaders.forEach( (header) => {
      this.wsHeaderToCells[header] = [];
      this.currentWorksheet.getColumn(this.wsHeaderToInt[header]).eachCell((cell, rowNumber) => {
        if (cell.value !== header) {
          switch (typeof cell.value) {
            case 'string':
              this.wsHeaderToCells[header].push({value: cell.value, row: rowNumber});
              break;
            case 'object':
              // Because null is an object for some stupid reason
              if (cell.value === null) {
                this.wsHeaderToCells[header].push({value: 'null', row: rowNumber});
                break;
              }

              if (cell.value.hasOwnProperty('result')) {
                this.wsHeaderToCells[header].push(
                  {value: cell.value['result'].toString(),
                  row: rowNumber});
                break;
              } else {
                this.wsHeaderToCells[header].push({value: 'null', row: rowNumber});
                break;
              }
            default:
              this.wsHeaderToCells[header].push(
                {value: cell.value.toString(),
                  row: rowNumber});
              break;
          }
        }
      });
    });
    return this.wsHeaderToCells;
  }

  getRowObjects() {
    // This is a terrible idea but I also need to ship soon
    const rowObjects: Array<any> = [];
    this.currentWorksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        const rowObject: any = {};
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          rowObject[this.intToWsHeader[colNumber]] = cell.value;
          rowObject['rowNumber'] = rowNumber;
        });
        rowObjects.push(rowObject);
      }
    });
    return rowObjects;
  }

  setWbHeaders(worksheet) {
    this.currentWsHeaders = [];
    const row = worksheet.getRow(1);
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      if (cell.value != null) {
        this.currentWsHeaders.push(cell.value);
      }
    });
  }
}
