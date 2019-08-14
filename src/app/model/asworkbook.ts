import { Workbook, Worksheet } from 'exceljs';
import { AbstracterizerService } from '../providers/abstracterizer.service';

/* Abstracterizer Service Workbook
This is supposed to be an implementation
of the workbook that's easier to use within the HTML.
*/

export class ASWorkbook {

  filename = '';
  // Temporary until this entire thing is working
  workbook: Workbook;
  worksheets: Array<Worksheet> = [];
  currentWorksheet: Worksheet;
  currentSheetInt: number;

  headers: Array<string> = [];

  // Maps
  // This is why I wanted to abstract all
  // of this to a class. I want a very accessible
  // workbook object without keeping massive
  // amounts of dictionaries in the component,
  // which is already doing too much anyway.
  headerToColumnNumber = {};
  columnNumbertoHeader = {};

  headerToCells = {};

  rows = [];

  constructor (workbook: Workbook, filename: string, public abstract: AbstracterizerService) {
    this.workbook = workbook;
    workbook.eachSheet( (worksheet, sheetId) => {
      this.worksheets.push(worksheet);
    });
    this.filename = filename;

    this.loadSheet(0);
  }

  loadSheet(worksheetNumber: number) {
    this.currentWorksheet = this.workbook.getWorksheet(worksheetNumber + 1);
    this.currentSheetInt = worksheetNumber;

    const headersAndMetadata = this.abstract.returnWorksheetHeadersAndIndexes(this.currentWorksheet);
    this.headers = headersAndMetadata.headers;
    this.headerToColumnNumber = headersAndMetadata.headerToColumnNumber;
    this.columnNumbertoHeader = headersAndMetadata.columnNumbertoHeader;

    this.rows = this.abstract.getRowObject(this.currentWorksheet, this.columnNumbertoHeader);
    this.headerToCells = this.abstract.associateCellsAndHeaders(this.currentWorksheet, this.headerToColumnNumber, this.headers);
  }

  getColIntFromHeader(header: string) {
    return this.headerToColumnNumber[header];
  }

  getHeaderFromColInt(colNum: number) {
    return this.columnNumbertoHeader[colNum];
  }

  // Convenience method, there will be other more
  // powerful methods that will make this make more sense
  getRow(rowNumber: number) {
    return this.rows[rowNumber];
  }

  getCellsFromHeader(header: string) {
    return this.headerToCells[header];
  }

  // Returns cell value that is associated with the row and key
  getKeyCellValue(header: string, row: number) {
    const correctCell = this.getCellsFromHeader(header).filter( cell => {
      return cell.row === row;
    })[0];

    if (correctCell.hasOwnProperty('result')) {
      return correctCell['result']['value'];
    } else {
      return correctCell['value'];
    }
  }
}
