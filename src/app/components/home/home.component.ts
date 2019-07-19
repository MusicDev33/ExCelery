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

  constructor(
    public electron: ElectronService,
    public excel: ExcelService) {

    }

  ngOnInit() {
    this.excel.currentWorkbook.subscribe(wb => {
      this.currentWorkbook = wb
      console.log("Changed")
    })
  }

}
