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

  primaryFileReturn() {
    return this.store.keyPair.primaryFile.length ? this.store.keyPair.primaryFile : 'No file selected';
  }

  secondaryFileReturn() {
    return this.store.keyPair.secondaryFile.length ? this.store.keyPair.secondaryFile : 'No file selected';
  }

  copyToHeaderReturn() {
    return this.store.copyToHeader.length ? this.store.copyToHeader.split(':')[1] : 'No header selected';
  }

  copyFromHeaderReturn() {
    return this.store.copyFromHeader.length ? this.store.copyFromHeader.split(':')[1] : 'No header selected';
  }

  // Wrapper functions
  copyClicked() {
    // Should this method even be in the copy store???
    if (this.store.copyToHeader.length && this.store.copyFromHeader.length) {
      this.store.copyColumns();
    }
  }

  saveClicked() {
    if (this.store.editCount > 0) {
      const primaryFile = this.store.keyPair.primaryFile;
      const primaryWorkbook = this.store.getWorkbookByFileName(primaryFile);
      this.save.emit(primaryWorkbook);
    }
  }
}
