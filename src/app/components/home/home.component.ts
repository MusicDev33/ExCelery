import { Component, OnInit } from '@angular/core';
import { ElectronService } from '../../providers/electron.service'
import { isDevMode } from '@angular/core';
import * as fs from 'fs';
import * as path from 'path'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  pathText: string;

  filePath: string;

  constructor(public electron: ElectronService) {
    console.log(isDevMode());
  }

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
  }

}
