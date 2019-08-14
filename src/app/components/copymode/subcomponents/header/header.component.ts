import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
// I should probably find a better way to do this
import { Header } from '../../../../model/header';

import { CopyStoreService } from '../../../../providers/copymode/copystore.service';

@Component({
  selector: 'app-header-box',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  constructor(public store: CopyStoreService) { }

  // INPUTS
  @Input()
  header: Header;

  @Input()
  keysFull: boolean;

  @Input()
  isPrimary: boolean;

  @Input()
  previewOpen: boolean;


  // OUTPUTS
  @Output()
  selectKey = new EventEmitter<Header>();

  @Output()
  selectCopy = new EventEmitter<Header>();

  @Output()
  selectDiff = new EventEmitter<Header>();

  @Output()
  selectHeader = new EventEmitter<Header>();


  ngOnInit() {}

  switchKey() {
    this.header.isKey = !this.header.isKey;
    this.selectKey.emit(this.header);
  }

  switchCopyMode() {
    this.header.copyMode = !this.header.copyMode;
    this.selectCopy.emit(this.header);
  }

  switchDiffMode() {
    this.header.diffMode = !this.header.diffMode;
    this.selectDiff.emit(this.header);
  }

  onHeaderClick() {
    this.selectHeader.emit(this.header);
  }

  tooltipText(cell) {
    if (!this.keysFull) {
      return cell.value;
    }

    if (this.keysFull) {
      return this.store.getWorkbookByFileName(this.header.filename)
              .getKeyCellValue(this.store.keyPair.getHeaderFromFile(this.header.filename), cell.row);
    }
  }
}
