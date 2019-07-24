import { Component, OnInit, OnDestroy } from '@angular/core';
import { ElectronService } from '../../providers/electron.service'
import { ExcelService, ExcelFile } from '../../providers/excel.service'
import { ColorgenService } from '../../providers/colorgen.service'
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

  colorsDict: any = {};
  columnMap: any = {};
  selectedHeader: string = ''
  mappedHeader: string = ''

  constructor(
    public electron: ElectronService,
    public excel: ExcelService,
    public colorGen: ColorgenService) { }

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

  // Fuzzy logic that will hopefully be fixed soon
  checkMarkClicked(filename, header){
    if (this.primaryKey == '' && this.secondaryKey == ''){
      return
    }
    /*
    if (this.selectedTitles.includes(header)){
      const index = this.selectedTitles.indexOf(header, 0);
      if (index > -1) {
         this.selectedTitles.splice(index, 1);
      }
    }else{
      this.selectedTitles.push(header)
      this.mapColor(filename, header)
    }*/
    console.log(this.headerToColumn)
    if (this.getKeyFile(filename) == 1){
      if (this.selectedHeader == this.createKey(filename, header)){
        this.selectedHeader = ''
        return
      }
      this.selectedHeader = this.createKey(filename, header)
    }else if(this.getKeyFile(filename) == 2){
      if (this.mappedHeader == this.createKey(filename, header)){
        this.mappedHeader = ''
        return
      }
      this.mappedHeader = this.createKey(filename, header)
    }
  }

  isSelected(filename, header){
    return this.createKey(filename, header) == this.selectedHeader || this.createKey(filename, header) == this.mappedHeader;
  }

  copyColumns(){
    console.log(this.rowObjectsDict)
    var index = 1
    for (let rowNum in this.rowObjectsDict[this.primaryKey.split(":")[0]]){
      var primaryKeyValue = this.rowObjectsDict[this.primaryKey.split(":")[0]][rowNum][this.primaryKey.split(":")[1]]

      var value = this.rowObjectsDict[this.secondaryKey.split(":")[0]].filter(rowObj => {
        if (rowObj[this.secondaryKey.split(":")[1]].hasOwnProperty("result")){
          return rowObj[this.secondaryKey.split(":")[1]]["result"] == primaryKeyValue;
        }else{
          return rowObj[this.secondaryKey.split(":")[1]] == primaryKeyValue;
        }
      })
      //console.log(this.rowObjectsDict[this.primaryKey.split(":")[0]][rowNum][this.selectedHeader.split(":")[1]])
      if (value.length){
        console.log(index)
        console.log(value)
        index += 1
      }
    }
  }

  getRandomColor(){
    return this.colorGen.colors[Math.floor(Math.random()*this.colorGen.colors.length)];
  }

  mapColor(filename, header){
    this.colorsDict[this.createKey(filename, header)] = this.colorGen.colors[Math.floor(Math.random()*this.colorGen.colors.length)];
    console.log(this.colorsDict)
  }

  getColor(filename, header){
    var key = this.createKey(filename, header)
    if (this.colorsDict.hasOwnProperty(key)) {
      return this.colorsDict[key]
    }else{
      return "#666"
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
    this.primaryKey = ''
    this.secondaryKey = ''
    this.selectedHeader = ''
    this.mappedHeader = ''
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

  getKeyType(filename, header){
    if (this.getIfPrimaryKey(filename, header)){
      return 1;
    }else if(this.getIfSecondaryKey(filename, header)){
      return 2
    }else{
      return 0;
    }
  }

  getKeyFile(filename){
    if (this.primaryKey.includes(filename)){
      return 1;
    }else if(this.secondaryKey.includes(filename)){
      return 2
    }else{
      return 0;
    }
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
