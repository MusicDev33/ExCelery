import { Component, OnInit, OnDestroy } from '@angular/core';
import { Workbook, Worksheet } from 'exceljs';
import { Subscription } from 'rxjs';
import { ASWorkbook } from '../../model/asworkbook';

import { ElectronService } from '../../providers/electron.service';
import { ExcelService, ExcelFile } from '../../providers/excel.service';
import { ColorgenService } from '../../providers/colorgen.service';
import { AbstracterizerService } from '../../providers/abstracterizer.service';
import { KeyService } from '../../providers/key.service';

@Component({
  selector: 'app-copymode',
  templateUrl: './copymode.component.html',
  styleUrls: ['./copymode.component.scss']
})
export class CopymodeComponent implements OnInit, OnDestroy {

  currentWorkbooks: Array<ASWorkbook> = [];

  activeTextfield = '';

  searchText = '';
  activeText = '';

  subscription: Subscription;

  // The cells from the copyFromHeader will copy to the copyToHeader
  copyToHeader = '';
  copyFromHeader = '';

  editCount = 0;

  columnPreviews = {};

  // Shows which rows were copied to which
  rowMap = {};

  constructor(
    public electron: ElectronService,
    public excel: ExcelService,
    public colorGen: ColorgenService,
    public abstract: AbstracterizerService,
    public keyService: KeyService) { }

  ngOnInit() {
    // wb is an excel file interface
    this.subscription = this.excel.currentWorkbook.subscribe(wb => {
      if (wb.workbook.getWorksheet(1)) {
        const newWorkbook = new ASWorkbook(wb.workbook, wb.filename, this.abstract);
        this.currentWorkbooks.push(newWorkbook);
      }
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  setActiveText(textfieldName) {
    if (this.activeTextfield === textfieldName) {
      this.activeTextfield = '';
    } else {
      this.activeTextfield = textfieldName;
    }
  }

  // Fuzzy logic that will hopefully be fixed soon
  checkMarkClicked(filename, header) {
    if (!this.keyService.doBothKeysExist()) {
      return;
    }

    if (this.keyService.getWhichKeyFileIn(filename) === 1) {
      if (this.copyToHeader === this.keyService.createKey(filename, header)) {
        this.copyToHeader = '';
        return;
      }
      this.copyToHeader = this.keyService.createKey(filename, header);
    } else if (this.keyService.getWhichKeyFileIn(filename) === 2) {
      if (this.copyFromHeader === this.keyService.createKey(filename, header)) {
        this.copyFromHeader = '';
        return;
      }
      this.copyFromHeader = this.keyService.createKey(filename, header);
    }
  }

  isSelected(filename, header) {
    return this.keyService.createKey(filename, header) === this.copyToHeader ||
      this.keyService.createKey(filename, header) === this.copyFromHeader;
  }

  headerSearchbarClicked() {
    this.activeTextfield = '';
    this.activeText = '';
  }

  headerClicked(filename, header) {
    if (this.columnPreviews[filename] === header) {
      this.columnPreviews[filename] = '';
    } else {
      this.columnPreviews[filename] = header;
    }
  }

  copyColumns() {
    const editArray = [];

    const primaryKeyFile = this.keyService.primaryFile;
    const primaryKeyHeader = this.keyService.primaryHeader;
    const secondaryKeyFile = this.keyService.secondaryFile;
    const secondaryKeyHeader = this.keyService.secondaryHeader;

    const primaryWorkbook = this.currentWorkbooks.filter(workbook => {
      return workbook.filename === primaryKeyFile;
    });

    const primaryRows = primaryWorkbook[0]['rows'];

    const secondaryWorkbook = this.currentWorkbooks.filter(workbook => {
      return workbook.filename === secondaryKeyFile;
    });

    const secondaryRows = secondaryWorkbook[0]['rows'];

    const headerNameTo = this.copyToHeader.split(':')[1];
    const headerNameFrom = this.copyFromHeader.split(':')[1];
    const columnNumber = primaryWorkbook[0]['headerToColumnNumber'][headerNameTo];

    this.rowMap[headerNameTo] = {};

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
        if (value[0].hasOwnProperty('result')) {
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
        this.rowMap[headerNameTo][rowObj['mappedRow']] = newMappedRow;
      } else {
        const newValue = rowObj[headerNameFrom];
        primaryWorkbook[0].workbook.getWorksheet(1).getRow(rowObj.mappedRow).getCell(columnNumber).value = newValue;
        const newMappedRow = {};
        newMappedRow['mappedRow'] = rowObj['rowNumber'];
        newMappedRow['rowNumber'] = rowObj['mappedRow'];
        newMappedRow['newValue'] = newValue;
        newMappedRow['oldValue'] = rowObj['mappedRowOldValue'];
        this.rowMap[headerNameTo][rowObj['mappedRow']] = newMappedRow;
      }
    });

    this.editCount += 1;
    this.copyToHeader = '';
    this.copyFromHeader = '';
  }

  saveFile(workbook) {
    const currentdate = new Date();
    const datetime = ' ' + currentdate.getDate() + '-'
                    + (currentdate.getMonth() + 1)  + '-'
                    + currentdate.getFullYear() + ' ('
                    + currentdate.getHours() + '-'
                    + currentdate.getMinutes() + '-'
                    + currentdate.getSeconds() + ')';

    const filename = workbook.filename.split('.')[0];
    const fileExtension = workbook.filename.split('.')[1];

    const totalFilename = filename + datetime + '.' + fileExtension;
    this.excel.saveExcel(totalFilename, workbook.workbook, () => {
      console.log('Saved file: ' + totalFilename);
      this.editCount = 0;
      this.rowMap = {};
    });
  }

  closeFile(filename: string) {
    const index = this.currentWorkbooks.findIndex(x => x.filename === filename);
    if (index !== -1) { this.currentWorkbooks.splice(index, 1); }
    this.copyToHeader = '';
    this.copyFromHeader = '';
    this.keyService.deleteKeys();
    this.rowMap = {};
  }
}
