import { Injectable } from '@angular/core';
import { ASWorkbook } from '../../model/asworkbook';
import { KeyPair } from '../../model/keypair';

@Injectable({
  providedIn: 'root'
})
export class CopyService {

  constructor() { }

  copyColumns(keyPair: KeyPair, currentWorkbooks: Array<ASWorkbook>, copyToHeader: string, copyFromHeader: string, rowMap: any) {
    const editArray = [];

    const primaryKeyFile = keyPair.primaryFile;
    const primaryKeyHeader = keyPair.primaryHeader;
    const secondaryKeyFile = keyPair.secondaryFile;
    const secondaryKeyHeader = keyPair.secondaryHeader;

    const primaryWorkbook = currentWorkbooks.filter(workbook => {
      return workbook.filename === primaryKeyFile;
    })[0];

    const primaryRows = primaryWorkbook['rows'];

    const secondaryWorkbook = currentWorkbooks.filter(workbook => {
      return workbook.filename === secondaryKeyFile;
    })[0];

    const secondaryRows = secondaryWorkbook['rows'];

    const headerNameTo = copyToHeader.split(':')[1];
    const headerNameFrom = copyFromHeader.split(':')[1];
    const columnNumber = primaryWorkbook['headerToColumnNumber'][headerNameTo];

    rowMap[headerNameTo] = {};

    for (const primaryRowObject of primaryRows) {
      const primaryKeyValue = primaryRowObject[primaryKeyHeader];
      // Get row with value regardless of whether or not it's a formula
      const value = secondaryRows.filter(rowObj => {
        if (rowObj[secondaryKeyHeader].hasOwnProperty('result')) {
          return rowObj[secondaryKeyHeader]['result'] === primaryKeyValue;
        } else {
          return rowObj[secondaryKeyHeader] === primaryKeyValue;
        }
      })[0];

      // value is a row, and is actually just very poorly named
      if (value.length) {
        value['mappedRow'] = primaryRowObject['rowNumber'];
        if (primaryRowObject[headerNameTo] !== null && primaryRowObject[headerNameTo].hasOwnProperty('result')) {
          value['mappedRowOldValue'] = primaryRowObject[headerNameTo]['result'];
        } else {
          value['mappedRowOldValue'] = primaryRowObject[headerNameTo];
        }
        editArray.push(value);
      }
    }

    editArray.forEach( rowObj => {
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
}
