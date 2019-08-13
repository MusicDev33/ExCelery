import { Injectable } from '@angular/core';
import { ASWorkbook } from '../../model/asworkbook';
import { KeyPair } from '../../model/keypair';

@Injectable({
  providedIn: 'root'
})
export class CopyService {

  constructor() { }

  // Again, this needs to be split up
  copyColumns(keyPair: KeyPair, currentWorkbooks: Array<ASWorkbook>, copyToHeader: string, copyFromHeader: string, rowMap: any) {

    const editArray = [];

    const primaryKeyFile = keyPair.primaryFile;
    const primaryKeyHeader = keyPair.primaryHeader;
    const secondaryKeyFile = keyPair.secondaryFile;
    const secondaryKeyHeader = keyPair.secondaryHeader;

    const primaryWorkbook = this.getWorkbookByFile(currentWorkbooks, primaryKeyFile);
    const secondaryWorkbook = this.getWorkbookByFile(currentWorkbooks, secondaryKeyFile);

    const primaryRows = primaryWorkbook['rows'];
    const secondaryRows = secondaryWorkbook['rows'];

    const headerNameTo = copyToHeader.split(':')[1];
    const headerNameFrom = copyFromHeader.split(':')[1];
    const columnNumber = primaryWorkbook['headerToColumnNumber'][headerNameTo];

    // Call by sharing, this will edit the original rowMap from CopyStore
    rowMap[headerNameTo] = {};

    this.createEditArray(keyPair, currentWorkbooks, copyToHeader, copyFromHeader).forEach( rowObj => {
      if (rowObj[headerNameFrom].hasOwnProperty('result')) {
        const newValue = rowObj[headerNameFrom]['result'];
        primaryWorkbook.workbook.getWorksheet(1).getRow(rowObj.mappedRow).getCell(columnNumber).value = newValue;
        const newMappedRow = {};
        newMappedRow['mappedRow'] = rowObj['rowNumber'];
        newMappedRow['rowNumber'] = rowObj['mappedRow'];
        newMappedRow['newValue'] = newValue;
        newMappedRow['oldValue'] = rowObj['mappedRowOldValue'];
        rowMap[headerNameTo][rowObj['mappedRow']] = newMappedRow;
      } else {
        const newValue = rowObj[headerNameFrom];
        primaryWorkbook.workbook.getWorksheet(1).getRow(rowObj.mappedRow).getCell(columnNumber).value = newValue;
        const newMappedRow = {};
        newMappedRow['mappedRow'] = rowObj['rowNumber'];
        newMappedRow['rowNumber'] = rowObj['mappedRow'];
        newMappedRow['newValue'] = newValue;
        newMappedRow['oldValue'] = rowObj['mappedRowOldValue'];
        rowMap[headerNameTo][rowObj['mappedRow']] = newMappedRow;
      }
    });
  }

  createEditArray(keyPair: KeyPair, workbooks: Array<ASWorkbook>, copyToHeader: string, copyFromHeader: string) {
    const primaryKeyFile = keyPair.primaryFile;
    const primaryKeyHeader = keyPair.primaryHeader;
    const secondaryKeyFile = keyPair.secondaryFile;
    const secondaryKeyHeader = keyPair.secondaryHeader;

    const primaryWorkbook = this.getWorkbookByFile(workbooks, primaryKeyFile);
    const secondaryWorkbook = this.getWorkbookByFile(workbooks, secondaryKeyFile);

    const primaryRows = primaryWorkbook['rows'];
    const secondaryRows = secondaryWorkbook['rows'];

    const headerNameTo = copyToHeader.split(':')[1];
    const headerNameFrom = copyFromHeader.split(':')[1];
    const columnNumber = primaryWorkbook['headerToColumnNumber'][headerNameTo];

    const editArray = [];
    for (const primaryRowObject of primaryRows) {
      const primaryKeyValue = primaryRowObject[primaryKeyHeader];
      // Get row with value regardless of whether or not it's a formula
      const value = secondaryRows.filter(rowObj => {
        if (rowObj[secondaryKeyHeader].hasOwnProperty('result')) {
          return rowObj[secondaryKeyHeader]['result'] === primaryKeyValue;
        } else {
          return rowObj[secondaryKeyHeader] === primaryKeyValue;
        }
      });

      // value is a row, and is actually just very poorly named
      if (value.length) {
        const row = value[0];
        row['mappedRow'] = primaryRowObject['rowNumber'];
        if (primaryRowObject[headerNameTo] !== null && primaryRowObject[headerNameTo].hasOwnProperty('result')) {
          row['mappedRowOldValue'] = primaryRowObject[headerNameTo]['result'];
        } else {
          row['mappedRowOldValue'] = primaryRowObject[headerNameTo];
        }
        editArray.push(row);
      }
    }

    return editArray;
  }

  // Small wrapper to make this look less ugly
  getWorkbookByFile(workbooks: Array<ASWorkbook>, filename: string) {
    const wb = workbooks.filter(workbook => {
      return workbook.filename === filename;
    })[0];
    return wb;
  }
}
