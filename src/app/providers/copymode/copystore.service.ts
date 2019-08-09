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

  constructor(public copyService: CopyService) { }

  checkIfRowMap() {
    return typeof this.rowMap !== 'undefined' && Object.keys(this.rowMap).length > 0;
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
    this.headerNameTwo = '';
    this.rowMap = {};
    this.diffMap = {};
    this.editCount = 0;
    this.keyPair.deleteKeys();
  }
}
