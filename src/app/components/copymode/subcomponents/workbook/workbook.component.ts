import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ASWorkbook } from '../../../../model/asworkbook';
import { KeyPair } from '../../../../model/keypair';

@Component({
  selector: 'app-workbook-view',
  templateUrl: './workbook.component.html',
  styleUrls: ['./workbook.component.scss']
})
export class WorkbookComponent implements OnInit {

  searchText = '';

  @Input()
  workbook: ASWorkbook;

  @Input()
  keyPair: KeyPair;

  constructor() { }

  ngOnInit() { }

}
