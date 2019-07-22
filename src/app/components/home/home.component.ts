import { Component, OnInit, OnDestroy } from '@angular/core';
import { ElectronService } from '../../providers/electron.service'
import { ExcelService } from '../../providers/excel.service'
import { Borders, FillPattern, Font, Workbook, Worksheet } from 'exceljs';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  currentWorkbook: Workbook;
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
    public excel: ExcelService) {

    }

  ngOnInit() {
    this.subscription = this.excel.currentWorkbook.subscribe(wb => {
      this.currentWorkbook = wb
      if (wb.getWorksheet(1)){
        this.wsHeaders = this.excel.getWsHeaders(wb.getWorksheet(1))
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
