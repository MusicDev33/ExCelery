import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { CopyStoreService } from '../../../../providers/copymode/copystore.service';
import { ASWorkbook } from '../../../../model/asworkbook';

@Component({
  selector: 'app-controlpanel',
  templateUrl: './controlpanel.component.html',
  styleUrls: ['./controlpanel.component.scss']
})
export class ControlPanelComponent implements OnInit {

  constructor(public store: CopyStoreService) { }

  @Output()
  save = new EventEmitter<ASWorkbook>();

  ngOnInit() {
  }

  // Wrapper functions
  copyClicked() {
    this.store.copyColumns();
  }

  saveClicked() {
    const primaryFile = this.store.keyPair.primaryFile;
    const primaryWorkbook = this.store.getWorkbookByFileName(primaryFile);
    this.save.emit(primaryWorkbook);
  }
}
