import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class KeyService {
  primaryKey = '';
  secondaryKey = '';

  primaryFile = '';
  primaryHeader = '';

  secondaryFile = '';
  secondaryHeader = '';

  constructor() { }

  createKey(filename: string, header: string) {
    return filename + ':' + header;
  }

  setKey(filename: string, header: string) {
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

  setPrimaryKey(filename: string, header: string) {
    this.primaryKey = this.createKey(filename, header);
    this.primaryFile = filename;
    this.primaryHeader = header;
  }

  setSecondaryKey(filename: string, header: string) {
    this.secondaryKey = this.createKey(filename, header);
    this.secondaryFile = filename;
    this.secondaryHeader = header;
  }

  doBothKeysExist() {
    return this.primaryKey.length > 0 && this.secondaryKey.length > 0;
  }

  getIsPrimaryKey(filename: string, header: string) {
    return this.primaryKey === this.createKey(filename, header);
  }

  getIsSecondaryKey(filename: string, header: string) {
    return this.secondaryKey === this.createKey(filename, header);
  }

  keyExists(filename: string, header: string) {
    return this.getIsPrimaryKey(filename, header) || this.getIsSecondaryKey(filename, header);
  }

  getWhichKey(filename: string, header: string) {
    if (!this.keyExists(filename, header)) {
      return 0;
    }
    // Still not sure about readability here
    return this.getIsPrimaryKey(filename, header) ? 1 : 2;
  }

  getWhichKeyFileIn(filename) {
    if (this.isFilenameInKey(filename)) {
      return 0;
    }
    // Again, might change for readability's sake
    return this.primaryIncludes(filename) ? 1 : 2;
  }

  isFilenameInKey(filename: string) {
    return this.primaryKey.includes(filename) || this.secondaryKey.includes(filename);
  }

  // DELETE Methods
  deleteKeys() {
    this.deletePrimaryKey();
    this.deleteSecondaryKey();
  }

  deletePrimaryKey() {
    this.primaryKey = '';
    this.primaryKeyFile = '';
    this.primaryKeyHeader = '';
  }

  deleteSecondaryKey() {
    this.secondaryKey = '';
    this.secondaryFile = '';
    this.secondaryHeader = '';
  }
}
