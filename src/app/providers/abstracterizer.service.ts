import { Injectable } from '@angular/core';
import { Workbook, Worksheet } from 'exceljs';

@Injectable({
  providedIn: 'root'
})
export class AbstracterizerService {
  /* The Abstracterizer will handle abstracting the Workbook objects into
  something more usable in the HTML. Having a bunch of arrays and objects
  sitting around in a component to handle very specific tasks just doesn't
  seem like a good idea, and it gets harder and harder to use them.
  Basically, this service will be all the methods that create
  an ASWorkbook
  */

  constructor() { }

  returnWorksheetHeadersAndIndexes(worksheet: Worksheet) {
    const row = worksheet.getRow(1);
    // Returns headers and their column numbers, as well as the reverse
    // That way, I'm not iterating three times.
    const returnObject = { headers: [], headerToColumnNumber: {}, columnNumbertoHeader: {}};
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      if (cell.value != null && typeof cell.value === 'string') {
        returnObject.headers.push(cell.value);
        returnObject.headerToColumnNumber[cell.value] = colNumber;
        returnObject.columnNumbertoHeader[colNumber] = cell.value;
      }
    });
    return returnObject;
  }

  getRowObject(worksheet: Worksheet, colToHeaderMap: object) {
    const rowObjects = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        const rowObject: any = {};
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          rowObject[colToHeaderMap[colNumber]] = cell.value;
          rowObject['rowNumber'] = rowNumber;
        });
        rowObjects.push(rowObject);
      }
    });
    // Returns array because rows need to be ordered
    return rowObjects;
  }

  associateCellsAndHeaders(worksheet: Worksheet, headerToIntMap: object, headers: Array<string>) {
    const headerToCells = {};
    headers.forEach( (header) => {
      headerToCells[header] = [];
      worksheet.getColumn(headerToIntMap[header]).eachCell((cell, rowNumber) => {
        if (cell.value !== header) {
          headerToCells[header].push(this.returnCorrectCell(cell.value, rowNumber));
        }
      });
    });
    return headerToCells;
  }

  // I'll try to come up with a better name
  returnCorrectCell(cellValue: any, rowNumber: number) {
    switch (typeof cellValue) {
      case 'string':
        return {value: cellValue, row: rowNumber};
      case 'object':
        if (cellValue === null) {
          return {value: 'null', row: rowNumber};
        }

        if (cellValue.hasOwnProperty('result')) {
          return {value: cellValue['result'].toString(), row: rowNumber};
        } else {
          return {value: 'null', row: rowNumber};
        }
      default:
        return {value: cellValue.toString(), row: rowNumber};
    }
  }
}
