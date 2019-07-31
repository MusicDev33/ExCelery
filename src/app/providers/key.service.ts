import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class KeyService {
  primaryKey: string;
  secondaryKey: string;

  primaryFile: string;
  primaryHeader: string;

  secondaryFile: string;
  secondaryHeader: string;

  constructor() { }

  createKey(filename: string, header: string) {
    return filename + ':' + header;
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
}
