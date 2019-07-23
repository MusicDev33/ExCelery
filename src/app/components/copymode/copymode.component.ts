import { Component, OnInit, OnDestroy } from '@angular/core';
import { ElectronService } from '../../providers/electron.service'
import { ExcelService, ExcelFile } from '../../providers/excel.service'
import { Borders, FillPattern, Font, Workbook, Worksheet } from 'exceljs';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-copymode',
  templateUrl: './copymode.component.html',
  styleUrls: ['./copymode.component.scss']
})
export class CopymodeComponent implements OnInit, OnDestroy {

  openWorkbooks: Array<ExcelFile> = [];
  wbToHeaders: any = {}

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

  // format = filename:key
  primaryKey = ''
  secondaryKey = ''

  rowObjectsDict: any = {}

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
        this.rowObjectsDict[wb.filename] = this.excel.getRowObjects()
        this.openWorkbooks.push(wb)
        this.wbToHeaders[wb.filename] = this.excel.getWsHeaders(wb.workbook.getWorksheet(1))
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

  closeFile(filename: string){
    var index = this.openWorkbooks.findIndex(x => x.filename === filename);
    if (index !== -1) this.openWorkbooks.splice(index, 1);
    delete this.rowObjectsDict[filename]
  }

  createKey(filename, key){
    return filename + ":" + key
  }

  setKey(filename, key){
    if(this.getIfKey(filename, key)){
      this.deleteKey(filename, key)
      return;
    }

    if (this.primaryKey != '' && this.secondaryKey == ''){
      this.secondaryKey = this.createKey(filename, key)
    }else if (this.primaryKey == ''){
      this.primaryKey = this.createKey(filename, key)
    }
  }

  getIfKeysFilled(){
    return this.primaryKey != '' && this.secondaryKey != '';
  }

  getIfKeyHasFilename(filename){
    return this.primaryKey.includes(filename) || this.secondaryKey.includes(filename);
  }

  getIfKey(filename, key){
    if(this.getIfPrimaryKey(filename, key)){
      return true;
    }else if(this.getIfSecondaryKey(filename, key)){
      return true;
    }else{
      return false;
    }
  }

  getIfPrimaryKey(filename, key){
    return this.primaryKey === this.createKey(filename, key)
  }

  getIfSecondaryKey(filename, key){
    return this.secondaryKey === this.createKey(filename, key)
  }

  deleteKey(filename, key){
    if (this.getIfPrimaryKey(filename, key)){
      this.primaryKey = ''
      this.secondaryKey = ''
    }
    if (this.getIfSecondaryKey(filename, key)){
      this.secondaryKey = ''
    }
  }

  getKeyText(filename){
    if (this.primaryKey.includes(filename)){
      return "Primary";
    }else if (this.secondaryKey.includes(filename)){
      return "Secondary";
    }else{
      return "";
    }
  }
}
