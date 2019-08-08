import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ASWorkbook } from '../../../../model/asworkbook';

@Component({
  selector: 'app-workbook-view',
  templateUrl: './workbook.component.html',
  styleUrls: ['./workbook.component.scss']
})
export class WorkbookComponent implements OnInit {

  @Input()
  workbook: ASWorkbook;

  constructor() { }

  ngOnInit() { }

}
