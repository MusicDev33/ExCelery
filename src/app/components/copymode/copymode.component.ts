import { Component, OnInit, OnDestroy } from '@angular/core';
import { Workbook, Worksheet } from 'exceljs';
import { Subscription } from 'rxjs';
import { ASWorkbook } from '../../model/asworkbook';
import { KeyPair } from '../../model/keypair';
import { Header } from '../../model/header';

import { ElectronService } from '../../providers/electron.service';
import { ExcelService, ExcelFile } from '../../providers/excel.service';
import { AbstracterizerService } from '../../providers/abstracterizer.service';
import { CopyStoreService } from '../../providers/copymode/copystore.service';

@Component({
  selector: 'app-copymode',
  templateUrl: './copymode.component.html',
  styleUrls: ['./copymode.component.scss']
})
export class CopymodeComponent implements OnInit, OnDestroy {

  subscription: Subscription;

  constructor(
    public electron: ElectronService,
    public excel: ExcelService,
    public abstract: AbstracterizerService,
    public store: CopyStoreService) { }

  ngOnInit() {
    // wb is an excel file interface
    this.subscription = this.excel.currentWorkbook.subscribe(wb => {
      if (wb.workbook.getWorksheet(1)) {
        const newWorkbook = new ASWorkbook(wb.workbook, wb.filename, this.abstract);
        this.store.keyPair = new KeyPair();
        this.store.currentWorkbooks.push(newWorkbook);
      }
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  checkMarkClicked(filename: string, header: string) {
    this.store.addCopyHeader(filename, header);
  }

  // DIFF
  diffButtonClicked(filename: string, header: string) {
    this.store.addDiffHeader(filename, header);
  }

  headerClicked(filename, header) {
    if (this.store.columnPreviews[filename] === header) {
      this.store.columnPreviews[filename] = '';
    } else {
      this.openPreview(filename, header);
    }
  }

  openPreview(filename: string, header: string) {
    this.store.columnPreviews[filename] = header;
  }

  // Column Copying
  // TODO: remove this into another service
  // Also, this needs to be broken up into
  // smaller functions
  copyColumns() {
    const editArray = [];

    const primaryKeyFile = this.store.keyPair.primaryFile;
    const primaryKeyHeader = this.store.keyPair.primaryHeader;
    const secondaryKeyFile = this.store.keyPair.secondaryFile;
    const secondaryKeyHeader = this.store.keyPair.secondaryHeader;

    const primaryWorkbook = this.store.currentWorkbooks.filter(workbook => {
      return workbook.filename === primaryKeyFile;
    });

    const primaryRows = primaryWorkbook[0]['rows'];

    const secondaryWorkbook = this.store.currentWorkbooks.filter(workbook => {
      return workbook.filename === secondaryKeyFile;
    });

    const secondaryRows = secondaryWorkbook[0]['rows'];

    const headerNameTo = this.store.copyToHeader.split(':')[1];
    const headerNameFrom = this.store.copyFromHeader.split(':')[1];
    const columnNumber = primaryWorkbook[0]['headerToColumnNumber'][headerNameTo];

    this.store.rowMap[headerNameTo] = {};

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
        value[0]['mappedRow'] = primaryRowObject['rowNumber'];
        if (primaryRowObject[headerNameTo] !== null && primaryRowObject[headerNameTo].hasOwnProperty('result')) {
          value[0]['mappedRowOldValue'] = primaryRowObject[headerNameTo]['result'];
        } else {
          value[0]['mappedRowOldValue'] = primaryRowObject[headerNameTo];
        }
        editArray.push(value[0]);
      }
    }

    editArray.forEach( (rowObj) => {
      if (rowObj[headerNameFrom].hasOwnProperty('result')) {
        const newValue = rowObj[headerNameFrom]['result'];
        primaryWorkbook[0].workbook.getWorksheet(1).getRow(rowObj.mappedRow).getCell(columnNumber).value = newValue;
        const newMappedRow = {};
        newMappedRow['mappedRow'] = rowObj['rowNumber'];
        newMappedRow['rowNumber'] = rowObj['mappedRow'];
        newMappedRow['newValue'] = newValue;
        newMappedRow['oldValue'] = rowObj['mappedRowOldValue'];
        this.store.rowMap[headerNameTo][rowObj['mappedRow']] = newMappedRow;
      } else {
        const newValue = rowObj[headerNameFrom];
        primaryWorkbook[0].workbook.getWorksheet(1).getRow(rowObj.mappedRow).getCell(columnNumber).value = newValue;
        const newMappedRow = {};
        newMappedRow['mappedRow'] = rowObj['rowNumber'];
        newMappedRow['rowNumber'] = rowObj['mappedRow'];
        newMappedRow['newValue'] = newValue;
        newMappedRow['oldValue'] = rowObj['mappedRowOldValue'];
        this.store.rowMap[headerNameTo][rowObj['mappedRow']] = newMappedRow;
      }
    });

    this.store.editCount += 1;
    this.store.copyToHeader = '';
    this.store.copyFromHeader = '';
  }

  saveFile(workbook) {
    let date = new Date().toLocaleString();
    date = date.replace(/\//g, '-');
    date = date.replace(/:\s*/g, '-');

    const filename = workbook.filename.split('.')[0];
    const fileExtension = workbook.filename.split('.')[1];

    const totalFilename = filename + ' ' + date + '.' + fileExtension;
    this.excel.saveExcel(totalFilename, workbook.workbook, () => {
      console.log('Saved file: ' + totalFilename);
      this.store.editCount = 0;
      this.store.rowMap = {};
    });
  }
}
