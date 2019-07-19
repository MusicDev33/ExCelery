import { Injectable } from '@angular/core';
import * as fs from 'fs';
import * as path from 'path';
import { Borders, FillPattern, Font, Workbook, Worksheet } from 'exceljs';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExcelService {
  workbooks: Array<string> = [];
  currentWorksheet: Worksheet;

  currentWsHeaders: Array<string> = [];
  wsHeaderToInt: any = {};
  wsHeaderToCells: any = {};

  path: string;

  private wbSource = new BehaviorSubject(new Workbook());
  currentWorkbook = this.wbSource.asObservable();

  constructor() { }

  getWorkbooks(){
    return this.workbooks;
  }

  setPath(path){
    this.path = path;
  }

  loadExcel(filepath, callback){
    fs.readdir(filepath + "/sheets", (err, files) => {
      if (files){
        files.forEach((wb) =>{
          if (!wb.startsWith("~")){
            console.log(wb)
            this.workbooks.push(wb)
          }
        })
        callback()
      }
    });
  }

  openWorkbook(filename: string){
    var workbook = new Workbook()
    workbook.xlsx.readFile(this.path + "/sheets/" + filename)
      .then(() => {
        // use workbook
        this.wbSource.next(workbook)
      });
  }

  getWsHeaders(worksheet){
    this.currentWorksheet = worksheet;
    this.wsHeaderToCells = {}
    var wsHeaders = [];
    var row = worksheet.getRow(1);
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      if (cell.value != null){
        wsHeaders.push(cell.value)
        this.wsHeaderToInt[cell.value] = colNumber
      }
    });
    this.currentWsHeaders = wsHeaders;
    return wsHeaders
  }

  getColumnData(){
    this.currentWsHeaders.forEach( (header) => {
      this.wsHeaderToCells[header] = [];
      this.currentWorksheet.getColumn(this.wsHeaderToInt[header]).eachCell((cell, rowNumber) => {
        if (cell.value != header){
          this.wsHeaderToCells[header].push(cell.value);
        }
      });
    })
    return this.wsHeaderToCells
  }

  setWbHeaders(worksheet){
    this.currentWsHeaders = [];
    var row = worksheet.getRow(1);
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      if (cell.value != null){
        this.currentWsHeaders.push(cell.value)
      }
    });
  }
}
