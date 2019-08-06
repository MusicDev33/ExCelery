

export class Header {
  cells = [];
  name = '';
  filename = '';

  isKey = false;
  copyMode = false;
  diffMode = false;

  // TODO: Fix this constructor, this got way uglier than planned
  constructor(header: string, filename: string, cells: Array<any>,
    {isKey = false, copyMode = false, diffMode = false}:
    {isKey?: boolean; copyMode?: boolean; diffMode?: boolean}={}) {
    /*
    This constructor basically takes a header, filename, and the cells
    but can also take an optional parameter: the booleans that set the
    state for this specific header (and its component). It's terrible,
    I honestly thought it would look much cleaner...
    */
    this.name = header;
    this.filename = filename;
    this.cells = cells;

    this.isKey = isKey;
    this.copyMode = copyMode;
    this.diffMode = diffMode;
  }
}
