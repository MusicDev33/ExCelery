import { Component, OnInit, NgZone } from '@angular/core';
import { ElectronService } from '../../providers/electron.service'
import { isDevMode } from '@angular/core';
import * as fs from 'fs';
import * as path from 'path'
import { Borders, FillPattern, Font, Workbook, Worksheet } from 'exceljs';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  navbarActive: boolean = false;
  sheets: Array<string> = [];
  pathText: string;

  openedWorkbook: Workbook;

  constructor(
    public electron: ElectronService,
    public ngZone: NgZone) { }

  ngOnInit() {
    if (isDevMode()){
      console.log(this.electron.remote.app.getAppPath())
      this.pathText = this.electron.remote.app.getAppPath()
    }else{
      this.pathText = process.env.PORTABLE_EXECUTABLE_DIR
      console.log(this.pathText)
    }

    if (!fs.existsSync(this.pathText + "/sheets")){
      fs.mkdirSync(this.pathText + "/sheets");
    }

    fs.readdir(this.pathText + "/sheets", (err, files) => {
      if (files){
        files.forEach((wb) =>{
          if (!wb.startsWith("~")){
            this.sheets.push(wb)
          }
        })
        this.ngZone.run( () => {
          this.sheets = files
        })
      }
    });
  }

  toggleNavbarClicked(){
    this.navbarActive = !this.navbarActive
  }

  excelButtonClicked(){
    this.navbarActive = false
  }

  openWorkbook(filename){
    this.openedWorkbook = new Workbook();
    this.openedWorkbook.xlsx.readFile(this.pathText + "/sheets/" + filename)
      .then(() => {
        // use workbook
        var ws = this.openedWorkbook.getWorksheet(1);
        console.log(ws.getRow(1).getCell('B').value);
      });
  }
}
