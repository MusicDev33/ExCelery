import { Injectable } from '@angular/core';
import { ASWorkbook } from '../../model/asworkbook';
import { KeyPair } from '../../model/keypair';

import { ColumnComparisonService } from './columncomparison.service';

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

  constructor(public compService: ColumnComparisonService) { }

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
    console.log(this.currentWorkbooks[0]);
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
      this.calcDiff();
    }
  }

  // This is really just a wrapper function
  copyColumns() {
    this.compService.mode = 'copy';
    this.compService.copyColumns(this.keyPair, this.currentWorkbooks, this.copyToHeader, this.copyFromHeader, this.rowMap);
    this.editCount += 1;
    this.copyToHeader = '';
    this.copyFromHeader = '';
    this.compService.mode = '';
  }

  calcDiff() {
    this.compService.mode = 'diff';
    this.compService.copyColumns(this.keyPair, this.currentWorkbooks, this.diffHeaderOne, this.diffHeaderTwo, this.diffMap);
    this.compService.mode = '';
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

  getWorkbookByFileName(filename: string) {
    const wb = this.currentWorkbooks.filter( workbook => {
      return workbook.filename === filename;
    });

    return wb[0];
  }
}
