import { Component, OnInit, NgZone, Output, EventEmitter } from '@angular/core';
import { ElectronService } from '../../providers/electron.service';
import { ExcelService, ExcelFile } from '../../providers/excel.service';
import { FilepathService } from '../../providers/filepath.service';
import { Workbook, Worksheet } from 'exceljs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  navbarActive = false;
  workbooks: Array<string> = [];
  openWorkbooks: Array<string> = [];
  pathText: string;

  workbook: ExcelFile;

  /*
  Right now, this is the only time I need to interact with
  Bootstrap outside of the DOM. I'm keeping track of the UI state
  because I don't want to download an entire library
  just for this one use case.
  */
  filesCollapsed = true;

  constructor(
    public electron: ElectronService,
    public ngZone: NgZone,
    public fpService: FilepathService,
    public xlService: ExcelService,
    public router: Router) { }

  ngOnInit() {
    this.xlService.loadExcel(this.fpService.path, () => {
      this.ngZone.run(() => {
        this.workbooks = this.xlService.getWorkbooks();
      });
    });
    this.xlService.currentWorkbook.subscribe(wb => this.workbook = wb);
  }

  refreshFiles() {
    this.xlService.loadExcel(this.fpService.path, () => {
      this.ngZone.run(() => {
        this.workbooks = this.xlService.getWorkbooks();
      });
    });
  }

  toggleNavbarClicked() {
    this.navbarActive = !this.navbarActive;

    this.filesCollapsed = true;
  }

  excelButtonClicked() {
    this.navbarActive = false;
    this.filesCollapsed = !this.filesCollapsed;
  }

  openWorkbook(filename) {
    this.xlService.openWorkbook(filename);
    // this.openWorkbooks.push(filename)
  }
}
