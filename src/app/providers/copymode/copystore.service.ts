import { Injectable } from '@angular/core';
import { ASWorkbook } from '../../model/asworkbook';
import { KeyPair } from '../../model/keypair';

import { CopyService } from './copy.service';

@Injectable({
  providedIn: 'root'
})
export class CopyStoreService {
  currentWorkbooks: Array<ASWorkbook> = [];

  copyToHeader = '';
  copyFromHeader = '';

  diffHeaderOne = '';
  diffHeaderTwo = '';

  rowMap = {};
  diffMap = {};
  diffOpen = false;

  keyPair: KeyPair;

  // I'd like to move this to
  // the workbook components
  // but it'll leave here for a bit
  editCount = 0;

  columnPreviews = {};

  constructor(public copyService: CopyService) { }

  checkIfRowMap() {
    return typeof this.rowMap !== 'undefined' && Object.keys(this.rowMap).length > 0;
  }

  isSelected(filename: string, header: string) {
    return this.keyPair.createKey(filename, header) === this.copyToHeader ||
      this.keyPair.createKey(filename, header) === this.copyFromHeader;
  }

  isDiffSelected(filename: string, header: string) {
    return this.keyPair.createKey(filename, header) === this.diffHeaderOne ||
      this.keyPair.createKey(filename, header) === this.diffHeaderTwo;
  }

  openPreview(filename: string, header: string) {
    this.columnPreviews[filename] = header;
  }

  addCopyHeader(filename: string, header: string) {
    if (!this.keyPair.doBothKeysExist()) {
      return;
    }

    if (this.keyPair.getWhichKeyFileIn(filename) === 1) {
      if (this.copyToHeader === this.keyPair.createKey(filename, header)) {
        this.copyToHeader = '';
        return;
      }
      this.copyToHeader = this.keyPair.createKey(filename, header);
    } else if (this.keyPair.getWhichKeyFileIn(filename) === 2) {
      if (this.copyFromHeader === this.keyPair.createKey(filename, header)) {
        this.copyFromHeader = '';
        return;
      }
      this.copyFromHeader = this.keyPair.createKey(filename, header);
    }
  }

  // DIFF
  addDiffHeader(filename: string, header: string) {
    if (!this.keyPair.doBothKeysExist()) {
      return;
    }

    if (this.keyPair.getWhichKeyFileIn(filename) === 1) {
      if (this.diffHeaderOne === this.keyPair.createKey(filename, header)) {
        this.diffHeaderOne = '';
        this.diffMap = {};
        return;
      }
      this.diffHeaderOne = this.keyPair.createKey(filename, header);
      this.calculateDiffIfFull();
    } else if (this.keyPair.getWhichKeyFileIn(filename) === 2) {
      if (this.diffHeaderTwo === this.keyPair.createKey(filename, header)) {
        this.diffHeaderTwo = '';
        this.diffMap = {};
        return;
      }
      this.diffHeaderTwo = this.keyPair.createKey(filename, header);
      this.calculateDiffIfFull();
    }
  }

  areBothDiffsSelected() {
    return this.diffHeaderOne !== '' && this.diffHeaderTwo !== '';
  }

  calculateDiffIfFull() {
    if (this.areBothDiffsSelected()) {
      this.openPreview(this.diffHeaderOne.split(':')[0], this.diffHeaderOne.split(':')[1]);
      this.calculateDiff();
    }
  }

  // This is here until cleanup round 3
  calculateDiff() {
    this.diffMap = {};

    const editArray = [];

    const primaryKeyFile = this.keyPair.primaryFile;
    const primaryKeyHeader = this.keyPair.primaryHeader;
    const secondaryKeyFile = this.keyPair.secondaryFile;
    const secondaryKeyHeader = this.keyPair.secondaryHeader;

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
        this.diffMap[headerNameOne][rowObj['mappedRow']] = newMappedRow;
      } else {
        const newValue = rowObj[headerNameTwo];
        const newMappedRow = {};
        newMappedRow['mappedRow'] = rowObj['rowNumber'];
        newMappedRow['rowNumber'] = rowObj['mappedRow'];
        newMappedRow['newValue'] = isNaN(newValue) ? newValue : Number(newValue);
        newMappedRow['oldValue'] = isNaN(rowObj['mappedRowOldValue']) ? rowObj['mappedRowOldValue'] : Number(rowObj['mappedRowOldValue']);
        this.diffMap[headerNameOne][rowObj['mappedRow']] = newMappedRow;
      }
    });
  }

  clearRowMap() {
    this.rowMap = {};
    this.copyToHeader = '';
    this.copyFromHeader = '';
    this.editCount = 0;
  }

  closeFile(filename: string) {
    const index = this.currentWorkbooks.findIndex(x => x.filename === filename);
    if (index !== -1) { this.currentWorkbooks.splice(index, 1); }
    this.copyToHeader = '';
    this.copyFromHeader = '';
    this.diffHeaderOne = '';
    this.diffHeaderTwo = '';
    this.rowMap = {};
    this.diffMap = {};
    this.editCount = 0;
    this.keyPair.deleteKeys();
  }
}
