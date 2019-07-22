import { Component, OnInit, OnDestroy } from '@angular/core';
import { ElectronService } from '../../providers/electron.service'
import { ExcelService } from '../../providers/excel.service'
import { Borders, FillPattern, Font, Workbook, Worksheet } from 'exceljs';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-copymode',
  templateUrl: './copymode.component.html',
  styleUrls: ['./copymode.component.scss']
})
export class CopymodeComponent implements OnInit, OnDestroy {

  currentWorkbook: Workbook;
  currentWbName: string;
  wsHeaders: Array<string> = [];

  activeTextfield: string = '';
  activeTextSelection: Array<string> = []

  selectedTitles: Array<string> = [];

  searchText: string = ""
  activeText: string = ""

  headerToColumn: any = {}

  headerToCell: any = {}

  subscription: Subscription;

  constructor(
    public electron: ElectronService,
    public excel: ExcelService) { }

  ngOnInit() {
    // wb is an excel file interface
    this.subscription = this.excel.currentWorkbook.subscribe(wb => {
      this.currentWorkbook = wb.workbook
      this.currentWbName = wb.filename
      if (wb.workbook.getWorksheet(1)){
        this.wsHeaders = this.excel.getWsHeaders(wb.workbook.getWorksheet(1))
        this.headerToCell = this.excel.getColumnData()
      }
    })
  }

  ngOnDestroy(){
    this.subscription.unsubscribe()
  }

  setActiveText(textfieldName){
    if (this.activeTextfield === textfieldName){
      this.activeTextfield = ""
    }else{
      this.activeTextfield = textfieldName;
    }
  }

  selectTitleClicked(title: string){
    this.activeText = ""
    if (this.selectedTitles.includes(title)){
      const index = this.selectedTitles.indexOf(title, 0);
      if (index > -1) {
         this.selectedTitles.splice(index, 1);
      }
    }else{
      this.selectedTitles.push(title)
    }
  }

  headerSearchbarClicked(){
    this.activeTextfield = "";
    this.activeText = ""
  }

}
