import { Injectable } from '@angular/core';
import { ASWorkbook } from '../../model/asworkbook';
import { KeyPair } from '../../model/keypair';

@Injectable({
  providedIn: 'root'
})
export class ColumnComparisonService {

  mode: string;

  copyColumns(keyPair: KeyPair, currentWorkbooks: Array<ASWorkbook>, toHeader: string, fromHeader: string, genericMap: any) {
    const primaryWorkbook = this.getWorkbookByFile(currentWorkbooks, keyPair.primaryFile);

    const editArray = this.createEditArray(keyPair, currentWorkbooks, toHeader, fromHeader);

    this.createRowMap(genericMap, editArray, toHeader, fromHeader, primaryWorkbook);
  }

  createEditArray(keyPair: KeyPair, workbooks: Array<ASWorkbook>, toHeader: string, fromHeader: string) {
    const primaryWorkbook = this.getWorkbookByFile(workbooks, keyPair.primaryFile);
    const secondaryWorkbook = this.getWorkbookByFile(workbooks, keyPair.secondaryFile);

    const primaryRows = primaryWorkbook['rows'];
    const secondaryRows = secondaryWorkbook['rows'];

    const headerNameTo = toHeader.split(':')[1];
    const headerNameFrom = fromHeader.split(':')[1];

    const editArray = [];
    for (const primaryRowObject of primaryRows) {
      const primaryKeyValue = primaryRowObject[keyPair.primaryHeader];
      // Get row with value regardless of whether or not it's a formula
      const value = secondaryRows.filter(rowObj => {
        if (!rowObj[keyPair.secondaryHeader]) { return false; }
        if (rowObj[keyPair.secondaryHeader].hasOwnProperty('result')) {
          return rowObj[keyPair.secondaryHeader]['result'] === primaryKeyValue;
        } else {
          return rowObj[keyPair.secondaryHeader] === primaryKeyValue;
        }
      });

      // value is a row, and is actually just very poorly named
      if (!value.length) { continue; }

      const row = value[0];
      row['mappedRow'] = primaryRowObject['rowNumber'];
      if (primaryRowObject[headerNameTo] !== null && primaryRowObject[headerNameTo].hasOwnProperty('result')) {
        row['mappedRowOldValue'] = primaryRowObject[headerNameTo]['result'];
      } else {
        row['mappedRowOldValue'] = primaryRowObject[headerNameTo];
      }
      editArray.push(row);
    }
    return editArray;
  }

  createRowMap(genericMap: any, editArray: Array<any>, toHeader: string, fromHeader: string, primaryWorkbook: ASWorkbook) {
    // This is all still based on JavaScript's call by sharing.
    // I'm not entirely sure if I still use that or find a more
    // readable way to use the genericMap

    const headerNameTo = toHeader.split(':')[1];
    const headerNameFrom = fromHeader.split(':')[1];
    const columnNumber = primaryWorkbook['headerToColumnNumber'][headerNameTo];

    genericMap[headerNameTo] = {};

    editArray.forEach( rowObj => {
      let newValue: any;

      const newMappedRow = {};

      if (!rowObj[headerNameFrom]) {
        return;
      }

      if (rowObj[headerNameFrom].hasOwnProperty('result')) {
        newValue = rowObj[headerNameFrom]['result'];
      } else {
        newValue = rowObj[headerNameFrom];
      }
      if (this.mode === 'copy') {
        const sheetInt = primaryWorkbook.currentSheetInt;
        primaryWorkbook.workbook.getWorksheet(sheetInt + 1).getRow(rowObj.mappedRow).getCell(columnNumber).value = newValue;
      }

      newMappedRow['mappedRow'] = rowObj['rowNumber'];
      newMappedRow['rowNumber'] = rowObj['mappedRow'];
      newMappedRow['newValue'] = isNaN(newValue) ? newValue : Number(newValue);
      newMappedRow['oldValue'] = isNaN(rowObj['mappedRowOldValue']) ? rowObj['mappedRowOldValue'] : Number(rowObj['mappedRowOldValue']);

      genericMap[headerNameTo][rowObj['mappedRow']] = newMappedRow;
    });
  }

  // Small wrapper to make this look less ugly
  getWorkbookByFile(workbooks: Array<ASWorkbook>, filename: string) {
    const wb = workbooks.filter(workbook => {
      return workbook.filename === filename;
    })[0];
    return wb;
  }
}
