import { Component, OnInit } from '@angular/core';
import { ElectronService } from '../../providers/electron.service'
import { isDevMode } from '@angular/core';
import * as fs from 'fs';
import * as path from 'path'

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  navbarActive: boolean = false;
  sheets: Array<string>;
  pathText: string;

  constructor(public electron: ElectronService) { }

  ngOnInit() {
    if (isDevMode()){
      console.log(this.electron.remote.app.getAppPath())
      this.pathText = this.electron.remote.app.getAppPath()
    }else{
      this.pathText = process.env.PORTABLE_EXECUTABLE_DIR
    }

    if (!fs.existsSync(this.pathText + "/sheets")){
      fs.mkdirSync(this.pathText + "/sheets");
    }

    fs.readdir('./sheets', (err, files) => {
      if (files){
        this.sheets = [];
        files.forEach(file => {
          console.log(file);
          this.sheets.push(file)
        });
      }
    });
  }

  toggleNavbarClicked(){
    this.navbarActive = !this.navbarActive
  }

}
