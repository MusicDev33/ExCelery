import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ASWorkbook } from '../../../../model/asworkbook';
import { KeyPair } from '../../../../model/keypair';

import { CopyStoreService } from '../../../../providers/copymode/copystore.service';

@Component({
  selector: 'app-workbook-view',
  templateUrl: './workbook.component.html',
  styleUrls: ['./workbook.component.scss']
})
export class WorkbookComponent implements OnInit {

  searchText = '';

  @Input()
  workbook: ASWorkbook;

  @Output()
  close = new EventEmitter<string>();

  constructor(public store: CopyStoreService) { }

  ngOnInit() { }

  closeButtonClicked() {
    this.close.emit(this.workbook.filename);
  }
}
