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

  currentWbHeaders: Array<string> = [];

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
    var wsHeaders = [];
    var row = worksheet.getRow(1);
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      console.log('Cell ' + colNumber + ' = ' + cell.value);
      if (cell.value != null){
        wsHeaders.push(cell.value)
      }
    });
    return wsHeaders
  }

  setWbHeaders(worksheet){
    this.currentWbHeaders = [];
    var row = worksheet.getRow(1);
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      console.log('Cell ' + colNumber + ' = ' + cell.value);
      if (cell.value != null){
        this.currentWbHeaders.push(cell.value)
      }
    });
    console.log(this.currentWbHeaders)
  }
}
