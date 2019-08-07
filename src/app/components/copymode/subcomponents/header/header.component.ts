import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
// I should probably find a better way to do this
import { Header } from '../../../../model/header';

@Component({
  selector: 'app-header-box',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  constructor() { }

  // INPUTS
  @Input()
  header: Header;

  @Input()
  keysFull: boolean;

  @Input()
  isPrimary: boolean;

  @Input()
  previewOpen: boolean;

  @Input()
  rowMap: any;

  @Input()
  diffMap: any;


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
}
