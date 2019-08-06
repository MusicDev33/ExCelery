import { Component, OnInit, OnDestroy } from '@angular/core';
import { Workbook, Worksheet } from 'exceljs';
import { Subscription } from 'rxjs';
import { ASWorkbook } from '../../model/asworkbook';
import { KeyPair } from '../../model/keypair';
import { Header } from '../../model/header';

import { ElectronService } from '../../providers/electron.service';
import { ExcelService, ExcelFile } from '../../providers/excel.service';
import { AbstracterizerService } from '../../providers/abstracterizer.service';

@Component({
  selector: 'app-copymode',
  templateUrl: './copymode.component.html',
  styleUrls: ['./copymode.component.scss']
})
export class CopymodeComponent implements OnInit, OnDestroy {

  currentWorkbooks: Array<ASWorkbook> = [];

  activeTextfield = '';

  searchText = '';
  activeText = '';

  subscription: Subscription;

  // The cells from the copyFromHeader will copy to the copyToHeader
  copyToHeader = '';
  copyFromHeader = '';

  diffHeaderOne = '';
  diffHeaderTwo = '';

  editCount = 0;

  columnPreviews = {};

  // Shows which rows were copied to which
  rowMap = {};
  diffMap = {};
  diffOpen = false;

  keyPairs = {};



  constructor(
    public electron: ElectronService,
    public excel: ExcelService,
    public abstract: AbstracterizerService) { }

  ngOnInit() {
    // wb is an excel file interface
    this.subscription = this.excel.currentWorkbook.subscribe(wb => {
      if (wb.workbook.getWorksheet(1)) {
        const newWorkbook = new ASWorkbook(wb.workbook, wb.filename, this.abstract);
        this.keyPairs['copy'] = new KeyPair();
        this.keyPairs['diff'] = new KeyPair();
        this.currentWorkbooks.push(newWorkbook);
      }
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  createHeader(header: string, filename: string, workbook: ASWorkbook) {
    return new Header(header, filename, workbook.getCellsFromHeader(header));
  }

  setActiveText(textfieldName: string) {
    if (this.activeTextfield === textfieldName) {
      this.activeTextfield = '';
    } else {
      this.activeTextfield = textfieldName;
    }
  }

  // Fuzzy logic that will hopefully be fixed soon
  checkMarkClicked(filename: string, header: string) {
    if (!this.keyPairs['copy'].doBothKeysExist()) {
      return;
    }

    if (this.keyPairs['copy'].getWhichKeyFileIn(filename) === 1) {
      if (this.copyToHeader === this.keyPairs['copy'].createKey(filename, header)) {
        this.copyToHeader = '';
        return;
      }
      this.copyToHeader = this.keyPairs['copy'].createKey(filename, header);
    } else if (this.keyPairs['copy'].getWhichKeyFileIn(filename) === 2) {
      if (this.copyFromHeader === this.keyPairs['copy'].createKey(filename, header)) {
        this.copyFromHeader = '';
        return;
      }
      this.copyFromHeader = this.keyPairs['copy'].createKey(filename, header);
    }
  }

  // DIFF
  diffButtonClicked(filename: string, header: string) {
    if (!this.keyPairs['copy'].doBothKeysExist()) {
      return;
    }

    if (this.keyPairs['copy'].getWhichKeyFileIn(filename) === 1) {
      if (this.diffHeaderOne === this.keyPairs['copy'].createKey(filename, header)) {
        this.diffHeaderOne = '';
        this.diffOpen = false;
        return;
      }
      this.diffHeaderOne = this.keyPairs['copy'].createKey(filename, header);
      this.calculateDiffIfFull();
    } else if (this.keyPairs['copy'].getWhichKeyFileIn(filename) === 2) {
      if (this.diffHeaderTwo === this.keyPairs['copy'].createKey(filename, header)) {
        this.diffHeaderTwo = '';
        this.diffOpen = false;
        return;
      }
      this.diffHeaderTwo = this.keyPairs['copy'].createKey(filename, header);
      this.calculateDiffIfFull();
    }
  }

  isSelected(filename: string, header: string) {
    return this.keyPairs['copy'].createKey(filename, header) === this.copyToHeader ||
      this.keyPairs['copy'].createKey(filename, header) === this.copyFromHeader;
  }

  isDiffSelected(filename: string, header: string) {
    return this.keyPairs['copy'].createKey(filename, header) === this.diffHeaderOne ||
      this.keyPairs['copy'].createKey(filename, header) === this.diffHeaderTwo;
  }

  areBothDiffsSelected() {
    return this.diffHeaderOne !== '' && this.diffHeaderTwo !== '';
  }

  calculateDiffIfFull() {
    if (this.areBothDiffsSelected()) {
      this.headerClicked(this.diffHeaderOne.split(':')[0], this.diffHeaderOne.split(':')[1]);
      this.calculateDiff();
    }
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

  // Column Copying
  copyColumns() {
    const editArray = [];

    const primaryKeyFile = this.keyPairs['copy'].primaryFile;
    const primaryKeyHeader = this.keyPairs['copy'].primaryHeader;
    const secondaryKeyFile = this.keyPairs['copy'].secondaryFile;
    const secondaryKeyHeader = this.keyPairs['copy'].secondaryHeader;

    const primaryWorkbook = this.currentWorkbooks.filter(workbook => {
      return workbook.filename === primaryKeyFile;
    });

    const primaryRows = primaryWorkbook[0]['rows'];

    const secondaryWorkbook = this.currentWorkbooks.filter(workbook => {
      return workbook.filename === secondaryKeyFile;
    });

    const secondaryRows = secondaryWorkbook[0]['rows'];

    const headerNameTo = this.copyToHeader.split(':')[1];
    const headerNameFrom = this.copyFromHeader.split(':')[1];
    const columnNumber = primaryWorkbook[0]['headerToColumnNumber'][headerNameTo];

    this.rowMap[headerNameTo] = {};

    for (const primaryRowObject of primaryRows) {
      const primaryKeyValue = primaryRowObject[primaryKeyHeader];
      // Get row with value regardless of whether or not it's a formula
      const value = secondaryRows.filter(rowObj => {
        if (rowObj[secondaryKeyHeader].hasOwnProperty('result')) {
          return rowObj[secondaryKeyHeader]['result'] === primaryKeyValue;
        } else {
          return rowObj[secondaryKeyHeader] === primaryKeyValue;
        }
      });

      // value is a row, and is actually just very poorly named
      if (value.length) {
        value[0]['mappedRow'] = primaryRowObject['rowNumber'];
        if (value[0].hasOwnProperty('result')) {
          value[0]['mappedRowOldValue'] = primaryRowObject[headerNameTo]['result'];
        } else {
          value[0]['mappedRowOldValue'] = primaryRowObject[headerNameTo];
        }
        editArray.push(value[0]);
      }
    }

    editArray.forEach( (rowObj) => {
      if (rowObj[headerNameFrom].hasOwnProperty('result')) {
        const newValue = rowObj[headerNameFrom]['result'];
        primaryWorkbook[0].workbook.getWorksheet(1).getRow(rowObj.mappedRow).getCell(columnNumber).value = newValue;
        const newMappedRow = {};
        newMappedRow['mappedRow'] = rowObj['rowNumber'];
        newMappedRow['rowNumber'] = rowObj['mappedRow'];
        newMappedRow['newValue'] = newValue;
        newMappedRow['oldValue'] = rowObj['mappedRowOldValue'];
        this.rowMap[headerNameTo][rowObj['mappedRow']] = newMappedRow;
      } else {
        const newValue = rowObj[headerNameFrom];
        primaryWorkbook[0].workbook.getWorksheet(1).getRow(rowObj.mappedRow).getCell(columnNumber).value = newValue;
        const newMappedRow = {};
        newMappedRow['mappedRow'] = rowObj['rowNumber'];
        newMappedRow['rowNumber'] = rowObj['mappedRow'];
        newMappedRow['newValue'] = newValue;
        newMappedRow['oldValue'] = rowObj['mappedRowOldValue'];
        this.rowMap[headerNameTo][rowObj['mappedRow']] = newMappedRow;
      }
    });

    this.editCount += 1;
    this.copyToHeader = '';
    this.copyFromHeader = '';
  }

  calculateDiff() {
    this.diffMap = {};

    const editArray = [];

    const primaryKeyFile = this.keyPairs['copy'].primaryFile;
    const primaryKeyHeader = this.keyPairs['copy'].primaryHeader;
    const secondaryKeyFile = this.keyPairs['copy'].secondaryFile;
    const secondaryKeyHeader = this.keyPairs['copy'].secondaryHeader;

    const primaryWorkbook = this.currentWorkbooks.filter(workbook => {
      return workbook.filename === primaryKeyFile;
    });
    const primaryRows = primaryWorkbook[0]['rows'];

    const secondaryWorkbook = this.currentWorkbooks.filter(workbook => {
      return workbook.filename === secondaryKeyFile;
    });
    const secondaryRows = secondaryWorkbook[0]['rows'];

    const headerNameOne = this.diffHeaderOne.split(':')[1];
    const headerNameTwo = this.diffHeaderTwo.split(':')[1];
    const columnNumber = primaryWorkbook[0]['headerToColumnNumber'][headerNameOne];

    this.diffMap[headerNameOne] = {};

    for (const primaryRowObject of primaryRows) {
      const primaryKeyValue = primaryRowObject[primaryKeyHeader];
      // Get row with value regardless of whether or not it's a formula
      const value = secondaryRows.filter(rowObj => {
        if (rowObj[secondaryKeyHeader].hasOwnProperty('result')) {
          return rowObj[secondaryKeyHeader]['result'] === primaryKeyValue;
        } else {
          return rowObj[secondaryKeyHeader] === primaryKeyValue;
        }
      });

      // value is a row, and is actually just very poorly named
      if (value.length) {
        value[0]['mappedRow'] = primaryRowObject['rowNumber'];
        if (value[0].hasOwnProperty('result')) {
          value[0]['mappedRowOldValue'] = primaryRowObject[headerNameOne]['result'];
        } else {
          value[0]['mappedRowOldValue'] = primaryRowObject[headerNameOne];
        }
        editArray.push(value[0]);
      }
    }

    editArray.forEach( (rowObj) => {
      if (rowObj[headerNameTwo].hasOwnProperty('result')) {
        const newValue = rowObj[headerNameTwo]['result'];
        const newMappedRow = {};
        newMappedRow['mappedRow'] = rowObj['rowNumber'];
        newMappedRow['rowNumber'] = rowObj['mappedRow'];
        newMappedRow['newValue'] = newValue;
        newMappedRow['oldValue'] = rowObj['mappedRowOldValue'];
        this.diffMap[headerNameOne][rowObj['mappedRow']] = newMappedRow;
      } else {
        const newValue = rowObj[headerNameTwo];
        const newMappedRow = {};
        newMappedRow['mappedRow'] = rowObj['rowNumber'];
        newMappedRow['rowNumber'] = rowObj['mappedRow'];
        newMappedRow['newValue'] = newValue;
        newMappedRow['oldValue'] = rowObj['mappedRowOldValue'];
        this.diffMap[headerNameOne][rowObj['mappedRow']] = newMappedRow;
      }
    });

    this.diffOpen = true;
  }

  saveFile(workbook) {
    let date = new Date().toLocaleString();
    date = date.replace(/\//g, '-');
    date = date.replace(/:\s*/g, '-');

    const filename = workbook.filename.split('.')[0];
    const fileExtension = workbook.filename.split('.')[1];

    const totalFilename = filename + ' ' + date + '.' + fileExtension;
    this.excel.saveExcel(totalFilename, workbook.workbook, () => {
      console.log('Saved file: ' + totalFilename);
      this.editCount = 0;
      this.rowMap = {};
    });
  }

  closeFile(filename: string) {
    const index = this.currentWorkbooks.findIndex(x => x.filename === filename);
    if (index !== -1) { this.currentWorkbooks.splice(index, 1); }
    this.copyToHeader = '';
    this.copyFromHeader = '';
    this.keyPairs['copy'].deleteKeys();
    this.editCount = 0;
    this.rowMap = {};
    delete this.keyPairs[filename];
  }
}
