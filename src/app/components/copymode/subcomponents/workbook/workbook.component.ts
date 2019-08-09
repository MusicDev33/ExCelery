import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ASWorkbook } from '../../../../model/asworkbook';
import { Header } from '../../../../model/header';
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

  @Output()
  copy = new EventEmitter<any>();

  @Output()
  save = new EventEmitter<ASWorkbook>();

  @Output()
  selectDiff = new EventEmitter<string>();

  @Output()
  selectCopy = new EventEmitter<string>();

  @Output()
  selectHeader = new EventEmitter<string>();

  constructor(public store: CopyStoreService) { }

  ngOnInit() { }

  createHeader(header: string, filename: string, workbook: ASWorkbook) {
    const isKey = this.store.keyPair.keyExists(filename, header);
    const isDiff = this.store.isDiffSelected(filename, header);
    const isSelected = this.store.isSelected(filename, header);
    const headerParams = {isKey: isKey, diffMode: isDiff, copyMode: isSelected};
    const newHeader = new Header(header, filename, workbook.getCellsFromHeader(header), headerParams);
    return newHeader;
  }

  closeButtonClicked() {
    this.close.emit(this.workbook.filename);
  }

  copyButtonClicked() {
    this.copy.emit();
  }

  saveButtonClicked() {
    this.save.emit(this.workbook);
  }

  diffSelected(header: Header) {
    this.selectDiff.emit(header.name);
  }

  copySelected(header: Header) {
    this.selectCopy.emit(header.name);
  }

  headerSelected(header: Header) {
    this.selectHeader.emit(header.name);
  }
}
