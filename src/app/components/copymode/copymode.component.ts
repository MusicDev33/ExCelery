import { Component, OnInit, OnDestroy } from '@angular/core';
import { Workbook, Worksheet } from 'exceljs';
import { Subscription } from 'rxjs';
import { ASWorkbook } from '../../model/asworkbook';
import { KeyPair } from '../../model/keypair';
import { Header } from '../../model/header';

import { ElectronService } from '../../providers/electron.service';
import { ExcelService, ExcelFile } from '../../providers/excel.service';
import { AbstracterizerService } from '../../providers/abstracterizer.service';
import { CopyStoreService } from '../../providers/copymode/copystore.service';

@Component({
  selector: 'app-copymode',
  templateUrl: './copymode.component.html',
  styleUrls: ['./copymode.component.scss']
})
export class CopymodeComponent implements OnInit, OnDestroy {

  activeTextfield = '';

  searchText = '';
  activeText = '';

  subscription: Subscription;

  constructor(
    public electron: ElectronService,
    public excel: ExcelService,
    public abstract: AbstracterizerService,
    public store: CopyStoreService) { }

  ngOnInit() {
    // wb is an excel file interface
    this.subscription = this.excel.currentWorkbook.subscribe(wb => {
      if (wb.workbook.getWorksheet(1)) {
        const newWorkbook = new ASWorkbook(wb.workbook, wb.filename, this.abstract);
        this.store.keyPair = new KeyPair();
        this.store.currentWorkbooks.push(newWorkbook);
      }
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  createHeader(header: string, filename: string, workbook: ASWorkbook) {
    const isKey = this.store.keyPair.keyExists(filename, header);
    const isDiff = this.isDiffSelected(filename, header);
    const isSelected = this.isSelected(filename, header);
    const headerParams = {isKey: isKey, diffMode: isDiff, copyMode: isSelected};
    const newHeader = new Header(header, filename, workbook.getCellsFromHeader(header), headerParams);
    return newHeader;
  }

  setActiveText(textfieldName: string) {
    if (this.activeTextfield === textfieldName) {
      this.activeTextfield = '';
    } else {
      this.activeTextfield = textfieldName;
    }
  }

  // DIFF
  diffButtonClicked(filename: string, header: string) {
    if (!this.store.keyPair.doBothKeysExist()) {
      return;
    }

    if (this.store.keyPair.getWhichKeyFileIn(filename) === 1) {
      if (this.store.diffHeaderOne === this.store.keyPair.createKey(filename, header)) {
        this.store.diffHeaderOne = '';
        this.store.diffMap = {};
        return;
      }
      this.store.diffHeaderOne = this.store.keyPair.createKey(filename, header);
      this.calculateDiffIfFull();
    } else if (this.store.keyPair.getWhichKeyFileIn(filename) === 2) {
      if (this.store.diffHeaderTwo === this.store.keyPair.createKey(filename, header)) {
        this.store.diffHeaderTwo = '';
        this.store.diffMap = {};
        return;
      }
      this.store.diffHeaderTwo = this.store.keyPair.createKey(filename, header);
      this.calculateDiffIfFull();
    }
  }

  isSelected(filename: string, header: string) {
    return this.store.keyPair.createKey(filename, header) === this.store.copyToHeader ||
      this.store.keyPair.createKey(filename, header) === this.store.copyFromHeader;
  }

  isDiffSelected(filename: string, header: string) {
    return this.store.keyPair.createKey(filename, header) === this.store.diffHeaderOne ||
      this.store.keyPair.createKey(filename, header) === this.store.diffHeaderTwo;
  }

  areBothDiffsSelected() {
    return this.store.diffHeaderOne !== '' && this.store.diffHeaderTwo !== '';
  }

  calculateDiffIfFull() {
    if (this.areBothDiffsSelected()) {
      this.openPreview(this.store.diffHeaderOne.split(':')[0], this.store.diffHeaderOne.split(':')[1]);
      this.calculateDiff();
    }
  }

  headerSearchbarClicked() {
    this.activeTextfield = '';
    this.activeText = '';
  }

  headerClicked(filename, header) {
    if (this.store.columnPreviews[filename] === header) {
      this.store.columnPreviews[filename] = '';
    } else {
      this.store.columnPreviews[filename] = header;
    }
  }

  openPreview(filename, header) {
    this.store.columnPreviews[filename] = header;
  }

  // Column Copying
  copyColumns() {
    const editArray = [];

    const primaryKeyFile = this.store.keyPair.primaryFile;
    const primaryKeyHeader = this.store.keyPair.primaryHeader;
    const secondaryKeyFile = this.store.keyPair.secondaryFile;
    const secondaryKeyHeader = this.store.keyPair.secondaryHeader;

    const primaryWorkbook = this.store.currentWorkbooks.filter(workbook => {
      return workbook.filename === primaryKeyFile;
    });

    const primaryRows = primaryWorkbook[0]['rows'];

    const secondaryWorkbook = this.store.currentWorkbooks.filter(workbook => {
      return workbook.filename === secondaryKeyFile;
    });

    const secondaryRows = secondaryWorkbook[0]['rows'];

    const headerNameTo = this.store.copyToHeader.split(':')[1];
    const headerNameFrom = this.store.copyFromHeader.split(':')[1];
    const columnNumber = primaryWorkbook[0]['headerToColumnNumber'][headerNameTo];

    this.store.rowMap[headerNameTo] = {};

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
        if (primaryRowObject[headerNameTo] !== null && primaryRowObject[headerNameTo].hasOwnProperty('result')) {
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
        this.store.rowMap[headerNameTo][rowObj['mappedRow']] = newMappedRow;
      } else {
        const newValue = rowObj[headerNameFrom];
        primaryWorkbook[0].workbook.getWorksheet(1).getRow(rowObj.mappedRow).getCell(columnNumber).value = newValue;
        const newMappedRow = {};
        newMappedRow['mappedRow'] = rowObj['rowNumber'];
        newMappedRow['rowNumber'] = rowObj['mappedRow'];
        newMappedRow['newValue'] = newValue;
        newMappedRow['oldValue'] = rowObj['mappedRowOldValue'];
        this.store.rowMap[headerNameTo][rowObj['mappedRow']] = newMappedRow;
      }
    });

    this.store.editCount += 1;
    this.store.copyToHeader = '';
    this.store.copyFromHeader = '';
  }

  calculateDiff() {
    this.store.diffMap = {};

    const editArray = [];

    const primaryKeyFile = this.store.keyPair.primaryFile;
    const primaryKeyHeader = this.store.keyPair.primaryHeader;
    const secondaryKeyFile = this.store.keyPair.secondaryFile;
    const secondaryKeyHeader = this.store.keyPair.secondaryHeader;

    const primaryWorkbook = this.store.currentWorkbooks.filter(workbook => {
      return workbook.filename === primaryKeyFile;
    });
    const primaryRows = primaryWorkbook[0]['rows'];

    const secondaryWorkbook = this.store.currentWorkbooks.filter(workbook => {
      return workbook.filename === secondaryKeyFile;
    });
    const secondaryRows = secondaryWorkbook[0]['rows'];

    const headerNameOne = this.store.diffHeaderOne.split(':')[1];
    const headerNameTwo = this.store.diffHeaderTwo.split(':')[1];
    const columnNumber = primaryWorkbook[0]['headerToColumnNumber'][headerNameOne];

    this.store.diffMap[headerNameOne] = {};

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
        if (primaryRowObject[headerNameOne] !== null && primaryRowObject[headerNameOne].hasOwnProperty('result')) {
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
        newMappedRow['newValue'] = isNaN(newValue) ? newValue : Number(newValue);
        newMappedRow['oldValue'] = isNaN(rowObj['mappedRowOldValue']) ? rowObj['mappedRowOldValue'] : Number(rowObj['mappedRowOldValue']);
        this.store.diffMap[headerNameOne][rowObj['mappedRow']] = newMappedRow;
      } else {
        const newValue = rowObj[headerNameTwo];
        const newMappedRow = {};
        newMappedRow['mappedRow'] = rowObj['rowNumber'];
        newMappedRow['rowNumber'] = rowObj['mappedRow'];
        newMappedRow['newValue'] = isNaN(newValue) ? newValue : Number(newValue);
        newMappedRow['oldValue'] = isNaN(rowObj['mappedRowOldValue']) ? rowObj['mappedRowOldValue'] : Number(rowObj['mappedRowOldValue']);
        this.store.diffMap[headerNameOne][rowObj['mappedRow']] = newMappedRow;
      }
    });
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
      this.store.editCount = 0;
      this.store.rowMap = {};
    });
  }
}
