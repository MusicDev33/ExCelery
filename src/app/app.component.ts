import { Component, isDevMode } from '@angular/core';
import { ElectronService } from './providers/electron.service';
import { FilepathService } from './providers/filepath.service';
import { ExcelService } from './providers/excel.service';
import { TranslateService } from '@ngx-translate/core';
import { AppConfig } from '../environments/environment';
import * as fs from 'fs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(public electronService: ElectronService,
    private translate: TranslateService,
    private filepathService: FilepathService,
    private xlService: ExcelService) {

    translate.setDefaultLang('en');
    console.log('AppConfig', AppConfig);

    if (electronService.isElectron()) {
      console.log('Mode Electron');
      console.log('Electron ipcRenderer', electronService.ipcRenderer);
      console.log('NodeJS childProcess', electronService.childProcess);
      if (isDevMode()) {
        this.filepathService.setPath(this.electronService.remote.app.getAppPath());
      } else {
        this.filepathService.setPath(process.env.PORTABLE_EXECUTABLE_DIR);
      }

      if (!fs.existsSync(this.filepathService.path + '/sheets')) {
        fs.mkdirSync(this.filepathService.path + '/sheets');
        fs.mkdirSync(this.filepathService.path + '/sheets/options');
      }
      this.xlService.setPath(this.filepathService.path);
    } else {
      console.log('Mode Web');
    }
  }
}
