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

  constructor(public copyService: CopyService) { }
}
