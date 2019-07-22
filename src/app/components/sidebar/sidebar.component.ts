import { Component, OnInit, NgZone, Output, EventEmitter } from '@angular/core';
import { ElectronService } from '../../providers/electron.service'
import { ExcelService } from '../../providers/excel.service'
import { FilepathService } from '../../providers/filepath.service'
import { Borders, FillPattern, Font, Workbook, Worksheet } from 'exceljs';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  navbarActive: boolean = false;
  workbooks: Array<string> = [];
  openWorkbooks: Array<string> = [];
  pathText: string;

  workbook: Workbook;

  constructor(
    public electron: ElectronService,
    public ngZone: NgZone,
    public fpService: FilepathService,
    public xlService: ExcelService) { }

  ngOnInit() {
    this.xlService.loadExcel(this.fpService.path, () => {
      console.log(this.xlService.getWorkbooks())
      this.ngZone.run(() => {
        this.workbooks = this.xlService.getWorkbooks()
      })
    })
    this.xlService.currentWorkbook.subscribe(wb => this.workbook = wb)
  }

  toggleNavbarClicked(){
    this.navbarActive = !this.navbarActive
  }

  excelButtonClicked(){
    this.navbarActive = false
  }

  openWorkbook(filename){
    this.xlService.openWorkbook(filename)
    this.openWorkbooks.push(filename)
  }

  //this is to open a file that's already open
  openTab(filename){
    console.log("Opening tab:")
    console.log(filename)
  }

  closeTab(filename){
    var index = this.openWorkbooks.indexOf(filename);
    if (index !== -1) this.openWorkbooks.splice(index, 1);
    console.log("Closing tab:")
    console.log(filename)
  }
}
