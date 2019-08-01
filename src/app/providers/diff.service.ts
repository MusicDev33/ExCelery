import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DiffService {
  // This is really just a watered-down version of the
  // Key service, I'm still debating on writing an interface
  // or not

  firstFile = '';
  secondFile = '';

  firstHeader = '';
  secondHeader = '';

  constructor() { }

  createTempKey(filename: string, header: string) {
    return filename + ':' + header;
  }

  setColumn(filename: string, header: string) {
    if (this.bothColumnsFull()) { console.log('Columns full.'); return; }

    switch (this.columnCheck(filename, header)) {
      case 0: {
        this.setFirstColumn(filename, header);
        break;
      }
      case 1: {
        this.setSecondColumn(filename, header);
        break;
      }
      case 2: {
        this.setFirstColumn(filename, header);
      }
    }
  }

  setFirstColumn(filename: string, header: string) {
    this.firstFile = filename;
    this.firstHeader = header;
  }

  setSecondColumn(filename: string, header: string) {
    this.secondFile = filename;
    this.secondHeader = header;
  }

  columnCheck(filename: string, header: string) {
    if (!doesColumnExist(filename, header)) { return 0; }

    return this.createTempKey(this.firstFile, this.firstHeader) === this.createTempKey(filename, header) ? 1 : 2;
  }

  doesColumnExist(filename: string, header: string) {
    return (this.firstFile === filename && this.firstHeader === header) ||
        (this.secondFile === filename && this.secondHeader === header);
  }

  bothColumnsFull() {
    return (this.firstFile !== '' && this.firstHeader === '') &&
        (this.secondFile !== '' && this.secondHeader !== '');
  }
}
