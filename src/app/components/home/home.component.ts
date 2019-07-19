import { Component, OnInit } from '@angular/core';
import { ElectronService } from '../../providers/electron.service'
import { ExcelService } from '../../providers/excel.service'
import { Borders, FillPattern, Font, Workbook, Worksheet } from 'exceljs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  currentWorkbook: Workbook;
  wsHeaders: Array<string> = [];

  activeTextfield: string = '';

  constructor(
    public electron: ElectronService,
    public excel: ExcelService) {

    }

  ngOnInit() {
    this.excel.currentWorkbook.subscribe(wb => {
      this.currentWorkbook = wb
      if (wb.getWorksheet(1)){
        this.wsHeaders = this.excel.getWsHeaders(wb.getWorksheet(1))
      }
    })
  }

  setActiveText(textfieldName){
    this.activeTextfield = textfieldName;
  }
}
