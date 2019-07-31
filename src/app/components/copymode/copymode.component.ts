import { Component, OnInit, OnDestroy } from '@angular/core';
import { Workbook, Worksheet } from 'exceljs';
import { Subscription } from 'rxjs';
import { ASWorkbook } from '../../model/asworkbook';

import { ElectronService } from '../../providers/electron.service';
import { ExcelService, ExcelFile } from '../../providers/excel.service';
import { ColorgenService } from '../../providers/colorgen.service';
import { AbstracterizerService } from '../../providers/abstracterizer.service';
import { KeyService } from '../../providers/key.service';

@Component({
  selector: 'app-copymode',
  templateUrl: './copymode.component.html',
  styleUrls: ['./copymode.component.scss']
})
export class CopymodeComponent implements OnInit, OnDestroy {

  currentWorkbooks: Array<ASWorkbook> = [];

  activeTextfield = '';
  activeTextSelection: Array<string> = [];

  selectedTitles: Array<string> = [];

  searchText = '';
  activeText = '';

  subscription: Subscription;

  // format = filename:key
  primaryKey = '';
  secondaryKey = '';

  rowObjectsDict: any = {};

  columnMap: any = {};

  // The cells from the copyFromHeader will copy to the copyToHeader
  copyToHeader = '';
  copyFromHeader = '';

  editCount = 0;

  columnPreviews = {};

  constructor(
    public electron: ElectronService,
    public excel: ExcelService,
    public colorGen: ColorgenService,
    public abstract: AbstracterizerService,
    public keyService: KeyService) { }

  ngOnInit() {
    // wb is an excel file interface
    this.subscription = this.excel.currentWorkbook.subscribe(wb => {
      if (wb.workbook.getWorksheet(1)) {
        this.excel.getWsHeaders(wb.workbook.getWorksheet(1));
        this.columnMap[wb.filename] = this.excel.getColumnMap();
        this.rowObjectsDict[wb.filename] = this.excel.getRowObjects();

        const newWorkbook = new ASWorkbook(wb.workbook, wb.filename, this.abstract);

        this.currentWorkbooks.push(newWorkbook);
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
    if (!this.keyService.doBothKeysExist()) {
      return;
    }

    if (this.keyService.getWhichKeyFileIn(filename) === 1) {
      if (this.copyToHeader === this.keyService.createKey(filename, header)) {
        this.copyToHeader = '';
        return;
      }
      this.copyToHeader = this.keyService.createKey(filename, header);
    } else if (this.keyService.getWhichKeyFileIn(filename) === 2) {
      if (this.copyFromHeader === this.keyService.createKey(filename, header)) {
        this.copyFromHeader = '';
        return;
      }
      this.copyFromHeader = this.keyService.createKey(filename, header);
    }
  }

  isSelected(filename, header) {
    return this.keyService.createKey(filename, header) === this.copyToHeader ||
      this.keyService.createKey(filename, header) === this.copyFromHeader;
  }

  copyColumns() {
    console.log(this.rowObjectsDict);
    const editArray = [];

    const primaryKeyFile = this.primaryKey.split(':')[0];
    const primaryKeyHeader = this.primaryKey.split(':')[1];
    const secondaryKeyFile = this.secondaryKey.split(':')[0];
    const secondaryKeyHeader = this.secondaryKey.split(':')[1];

    for (const primaryRowObject of this.rowObjectsDict[primaryKeyFile]) {
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

    const primaryWorkbook = this.currentWorkbooks.filter(workbook => {
      return workbook.filename === primaryKeyFile;
    });

    editArray.forEach( (rowObj) => {
      const columnNumber = this.columnMap[primaryKeyFile][this.copyToHeader.split(':')[1]];

      if (rowObj[this.copyFromHeader.split(':')[1]].hasOwnProperty('result')) {
        const newValue = rowObj[this.copyFromHeader.split(':')[1]]['result'];
        primaryWorkbook[0].workbook.getWorksheet(1).getRow(rowObj.mappedRow).getCell(columnNumber).value = newValue;
      } else {
        const newValue = rowObj[this.copyFromHeader.split(':')[1]];
        primaryWorkbook[0].workbook.getWorksheet(1).getRow(rowObj.mappedRow).getCell(columnNumber).value = newValue;
      }
    });

    this.editCount += 1;
    this.copyToHeader = '';
    this.copyFromHeader = '';
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

  headerClicked(filename, header) {
    if (this.columnPreviews[filename] === header) {
      this.columnPreviews[filename] = '';
    } else {
      this.columnPreviews[filename] = header;
    }
  }

  closeFile(filename: string) {
    const index = this.currentWorkbooks.findIndex(x => x.filename === filename);
    if (index !== -1) { this.currentWorkbooks.splice(index, 1); }
    delete this.rowObjectsDict[filename];
    this.primaryKey = '';
    this.secondaryKey = '';
    this.copyToHeader = '';
    this.copyFromHeader = '';
  }

  // KEYS
  setKey(filename, key) {
    if (this.getIfKey(filename, key)) {
      this.deleteKey(filename, key);
      return;
    }

    if (this.primaryKey !== '' && this.secondaryKey === '') {
      this.secondaryKey = this.keyService.createKey(filename, key);
    } else if (this.primaryKey === '') {
      this.primaryKey = this.keyService.createKey(filename, key);
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
    return this.primaryKey === this.keyService.createKey(filename, key);
  }

  getIfSecondaryKey(filename, key) {
    return this.secondaryKey === this.keyService.createKey(filename, key);
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
