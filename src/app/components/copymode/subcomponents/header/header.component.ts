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

  @Input()
  header: Header;

  @Output('header-event')
  headerEmitter = new EventEmitter<Header>();


  ngOnInit() {
  }

  headerActionClicked(header: Header) {
    this.headerEmitter.emit(header);
  }

}
