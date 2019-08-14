import { Component, OnInit, NgZone, Output, EventEmitter } from '@angular/core';
import { ElectronService } from '../../providers/electron.service';
import { ExcelService, ExcelFile } from '../../providers/excel.service';
import { FilepathService } from '../../providers/filepath.service';
import { Workbook, Worksheet } from 'exceljs';
import { Router } from '@angular/router';
import { Observable, of, timer } from 'rxjs';
import { take } from 'rxjs/operators';

import { version } from '../../../../package.json';

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

  versionNumber = version;
  versionArray: Array<string>;
  versionBinary = '';
  versionUrl = '';

  workbook: ExcelFile;

  // File marked for delete
  markedFile: string;
  // Should be for type of timer, but TS doesn't like that for some reason
  trashTimers: Array<any> = [];

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
    this.versionUrl = 'https://github.com/MusicDev33/ExCelery/releases/tag/' + this.versionNumber;
    this.versionArray = this.versionNumber.split('.');
    this.versionToBinary();
    this.refreshFiles();
    this.xlService.currentWorkbook.subscribe(wb => this.workbook = wb);
  }

  versionToBinary() {
    this.versionArray.forEach( num => {
      this.versionBinary += Number(num).toString(2);
    });
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

  openWorkbook(filename: string) {
    this.xlService.openWorkbook(filename);
    // this.openWorkbooks.push(filename)
  }

  fileDeleted(filename: string) {
    this.fpService.deleteFile(filename, err => {
      if (err === null) {
        this.refreshFiles();
        this.unsubFromAllTimers();
      }
    });
    this.markedFile = '';
  }

  unsubFromAllTimers() {
    this.trashTimers.forEach( tTimer => {
      tTimer.unsubscribe();
    });
  }

  trashButtonClicked(filename: string) {
    if (this.markedFile === filename) {
      this.fileDeleted(filename);
    } else {
      this.markedFile = filename;
      const trashTimer = timer(2000, 1000);
      this.trashTimers.push(trashTimer);
      trashTimer.pipe(take(1)).subscribe(t => {
        if (t === 0) {
          this.markedFile = '';
        }
      });
    }
  }
}
