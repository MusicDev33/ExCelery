

export class Header {
  cells = [];
  name = '';
  filename = '';

  isKey = false;
  copyMode = false;
  diffMode = false;

  constructor(header: string, filename: string, cells: Array<any>) {
    this.name = header;
    this.filename = filename;
    this.cells = cells;
  }
}
