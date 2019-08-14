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
      this.store.openPreview(filename, header);
    }
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
