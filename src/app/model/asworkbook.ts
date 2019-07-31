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

  constructor (workbook: Workbook, filename: string, abstract: AbstracterizerService) {
    this.workbook = workbook;
    this.currentWorksheet = workbook.getWorksheet(1);
    this.filename = filename;

    const headersAndMetadata = abstract.returnWorksheetHeadersAndIndexes(this.currentWorksheet);
    this.headers = headersAndMetadata.headers;
    this.headerToColumnNumber = headersAndMetadata.headerToColumnNumber;
    this.columnNumbertoHeader = headersAndMetadata.columnNumbertoHeader;

    this.rows = abstract.getRowObject(this.currentWorksheet, this.columnNumbertoHeader);
    this.headerToCells = abstract.associateCellsAndHeaders(this.currentWorksheet, this.headerToColumnNumber, this.headers);
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
}
