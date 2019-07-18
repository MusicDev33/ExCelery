import { Component, OnInit, NgZone } from '@angular/core';
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
  sheets: Array<string> = [];
  pathText: string;

  constructor(public electron: ElectronService, public ngZone: NgZone) { }

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
}
