import { Component, OnInit, NgZone } from '@angular/core';
import { ElectronService } from '../../providers/electron.service'
import { ExcelService } from '../../providers/excel.service'
import { FilepathService } from '../../providers/filepath.service'

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  navbarActive: boolean = false;
  workbooks: Array<string> = [];
  pathText: string;

  openedWorkbook: Workbook;

  constructor(
    public electron: ElectronService,
    public ngZone: NgZone,
    public fpService: FilepathService,
    public xlService: ExcelService) { }

  ngOnInit() {
    this.xlService.loadExcel(this.fpService.path, () => {
      console.log(this.xlService.getWorkbooks())
      this.ngZone.run( () => {
        this.workbooks = this.xlService.getWorkbooks()
      })
    })
  }

  toggleNavbarClicked(){
    this.navbarActive = !this.navbarActive
  }

  excelButtonClicked(){
    this.navbarActive = false
  }

  openWorkbook(filename){
    this.xlService.openWorkbook(filename)
  }
}
