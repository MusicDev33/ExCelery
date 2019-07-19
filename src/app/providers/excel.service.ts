import { Injectable } from '@angular/core';
import * as fs from 'fs';
import * as path from 'path';
import { Borders, FillPattern, Font, Workbook, Worksheet } from 'exceljs';

@Injectable({
  providedIn: 'root'
})
export class ExcelService {
  workbooks: Array<string> = [];
  currentWorkbook: Workbook;
  path: string;

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
    this.currentWorkbook = new Workbook()
    this.currentWorkbook.xlsx.readFile(this.path + "/sheets/" + filename)
      .then(() => {
        // use workbook
        var ws = this.currentWorkbook.getWorksheet(1);
        console.log(ws.getRow(1).getCell('B').value);
      });
  }
}
