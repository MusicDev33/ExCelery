import { Component, OnInit, OnDestroy } from '@angular/core';
import { ElectronService } from '../../providers/electron.service';
import { ExcelService, ExcelFile } from '../../providers/excel.service';
import { ColorgenService } from '../../providers/colorgen.service';
import { Borders, FillPattern, Font, Workbook, Worksheet } from 'exceljs';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-copymode',
  templateUrl: './copymode.component.html',
  styleUrls: ['./copymode.component.scss']
})
export class CopymodeComponent implements OnInit, OnDestroy {

  openWorkbooks: Array<ExcelFile> = [];
  wbToHeaders: any = {};

  currentWorkbook: Workbook;
  currentWbName: string;
  wsHeaders: Array<string> = [];

  activeTextfield = '';
  activeTextSelection: Array<string> = [];

  selectedTitles: Array<string> = [];

  searchText = '';
  activeText = '';

  headerToColumn: any = {};

  headerToCell: any = {};

  subscription: Subscription;

  // format = filename:key
  primaryKey = '';
  secondaryKey = '';

  rowObjectsDict: any = {};

  colorsDict: any = {};
  columnMap: any = {};
  selectedHeader = '';
  mappedHeader = '';

  editCount = 0;

  columnPreviews = {};

  constructor(
    public electron: ElectronService,
    public excel: ExcelService,
    public colorGen: ColorgenService) { }

  ngOnInit() {
    // wb is an excel file interface
    this.subscription = this.excel.currentWorkbook.subscribe(wb => {
      this.currentWorkbook = wb.workbook;
      this.currentWbName = wb.filename;
      if (wb.workbook.getWorksheet(1)) {
        this.wsHeaders = this.excel.getWsHeaders(wb.workbook.getWorksheet(1));
        this.columnMap[wb.filename] = this.excel.getColumnData();
        this.rowObjectsDict[wb.filename] = this.excel.getRowObjects();
        this.openWorkbooks.push(wb);
        this.wbToHeaders[wb.filename] = this.excel.getWsHeaders(wb.workbook.getWorksheet(1));
      }
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  setActiveText(textfieldName) {
    if (this.activeTextfield === textfieldName) {
      this.activeTextfield = '';
    } else {
      this.activeTextfield = textfieldName;
    }
  }

  // Fuzzy logic that will hopefully be fixed soon
  checkMarkClicked(filename, header) {
    if (this.primaryKey === '' && this.secondaryKey === '') {
      return;
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
    console.log(this.headerToColumn);
    if (this.getKeyFile(filename) === 1) {
      if (this.selectedHeader === this.createKey(filename, header)) {
        this.selectedHeader = '';
        return;
      }
      this.selectedHeader = this.createKey(filename, header);
    } else if (this.getKeyFile(filename) === 2) {
      if (this.mappedHeader === this.createKey(filename, header)) {
        this.mappedHeader = '';
        return;
      }
      this.mappedHeader = this.createKey(filename, header);
    }
  }

  isSelected(filename, header) {
    return this.createKey(filename, header) === this.selectedHeader || this.createKey(filename, header) === this.mappedHeader;
  }

  copyColumns() {
    console.log(this.rowObjectsDict);
    const editArray = [];

    const primaryKeyFile = this.primaryKey.split(':')[0];
    const primaryKeyHeader = this.primaryKey.split(':')[1];
    const secondaryKeyFile = this.secondaryKey.split(':')[0];
    const secondaryKeyHeader = this.secondaryKey.split(':')[1];

    for (const primaryRowObject of this.rowObjectsDict[this.primaryKey.split(':')[0]]) {
      const primaryKeyValue = primaryRowObject[primaryKeyHeader];

      const value = this.rowObjectsDict[secondaryKeyFile].filter(rowObj => {
        if (rowObj[secondaryKeyHeader].hasOwnProperty('result')) {
          return rowObj[secondaryKeyHeader]['result'] === primaryKeyValue;
        } else {
          return rowObj[secondaryKeyHeader] === primaryKeyValue;
        }
      });

      if (value.length) {
        value[0]['mappedRow'] = primaryRowObject['rowNumber'];
        editArray.push(value[0]);
      }
    }

    const primaryWorkbook = this.openWorkbooks.filter(workbook => {
      return workbook.filename === primaryKeyFile;
    });

    editArray.forEach( (rowObj) => {
      const columnNumber = this.columnMap[primaryKeyFile][this.selectedHeader.split(':')[1]];

      if (rowObj[this.mappedHeader.split(':')[1]].hasOwnProperty('result')) {
        const newValue = rowObj[this.mappedHeader.split(':')[1]]['result'];
        primaryWorkbook[0].workbook.getWorksheet(1).getRow(rowObj.mappedRow).getCell(columnNumber).value = newValue;
      } else {
        const newValue = rowObj[this.mappedHeader.split(':')[1]];
        primaryWorkbook[0].workbook.getWorksheet(1).getRow(rowObj.mappedRow).getCell(columnNumber).value = newValue;
      }
    });

    this.editCount += 1;
    this.selectedHeader = '';
    this.mappedHeader = '';
  }

  saveFile(workbook) {
    const currentdate = new Date();
    const datetime = ' ' + currentdate.getDate() + '-'
                    + (currentdate.getMonth() + 1)  + '-'
                    + currentdate.getFullYear() + ' ('
                    + currentdate.getHours() + '-'
                    + currentdate.getMinutes() + '-'
                    + currentdate.getSeconds() + ')';

    const filename = workbook.filename.split('.')[0];
    const fileExtension = workbook.filename.split('.')[1];

    const totalFilename = filename + datetime + '.' + fileExtension;
    this.excel.saveExcel(totalFilename, workbook.workbook, () => {
      console.log('Saved file: ' + totalFilename);
      this.editCount = 0;
    });
  }

  headerSearchbarClicked() {
    this.activeTextfield = '';
    this.activeText = '';
  }

  closeFile(filename: string) {
    const index = this.openWorkbooks.findIndex(x => x.filename === filename);
    if (index !== -1) { this.openWorkbooks.splice(index, 1); }
    delete this.rowObjectsDict[filename];
    this.primaryKey = '';
    this.secondaryKey = '';
    this.selectedHeader = '';
    this.mappedHeader = '';
  }

  // KEYS

  createKey(filename, key) {
    return filename + ':' + key;
  }

  setKey(filename, key) {
    if (this.getIfKey(filename, key)) {
      this.deleteKey(filename, key);
      return;
    }

    if (this.primaryKey !== '' && this.secondaryKey === '') {
      this.secondaryKey = this.createKey(filename, key);
    } else if (this.primaryKey === '') {
      this.primaryKey = this.createKey(filename, key);
    }
  }

  getIfKeysFilled() {
    return this.primaryKey !== '' && this.secondaryKey !== '';
  }

  getIfKeyHasFilename(filename) {
    return this.primaryKey.includes(filename) || this.secondaryKey.includes(filename);
  }

  getIfKey(filename, key) {
    if (this.getIfPrimaryKey(filename, key)) {
      return true;
    } else if (this.getIfSecondaryKey(filename, key)) {
      return true;
    } else {
      return false;
    }
  }

  getIfPrimaryKey(filename, key) {
    return this.primaryKey === this.createKey(filename, key);
  }

  getIfSecondaryKey(filename, key) {
    return this.secondaryKey === this.createKey(filename, key);
  }

  getKeyType(filename, header) {
    if (this.getIfPrimaryKey(filename, header)) {
      return 1;
    } else if (this.getIfSecondaryKey(filename, header)) {
      return 2;
    } else {
      return 0;
    }
  }

  getKeyFile(filename) {
    if (this.primaryKey.includes(filename)) {
      return 1;
    } else if (this.secondaryKey.includes(filename)) {
      return 2;
    } else {
      return 0;
    }
  }

  deleteKey(filename, key) {
    if (this.getIfPrimaryKey(filename, key)) {
      this.primaryKey = '';
      this.secondaryKey = '';
    }
    if (this.getIfSecondaryKey(filename, key)) {
      this.secondaryKey = '';
    }
  }

  getKeyText(filename) {
    if (this.primaryKey.includes(filename)) {
      return 'Primary';
    } else if (this.secondaryKey.includes(filename)) {
      return 'Secondary';
    } else {
      return '';
    }
  }
}
