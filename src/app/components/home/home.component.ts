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

  }

  dragStart($event){
    $event.preventDefault();
    this.electron.ipcRenderer.send('ondragstart', 'event')
    console.log("Dropped")
  }

  onDrop($event){
    $event.preventDefault();
    console.log("Dropped")
  }

}
