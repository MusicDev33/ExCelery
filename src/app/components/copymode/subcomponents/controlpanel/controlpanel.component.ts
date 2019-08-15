import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { CopyStoreService } from '../../../../providers/copymode/copystore.service';

@Component({
  selector: 'app-controlpanel',
  templateUrl: './controlpanel.component.html',
  styleUrls: ['./controlpanel.component.scss']
})
export class ControlPanelComponent implements OnInit {

  constructor(public store: CopyStoreService) { }

  ngOnInit() {
  }
}
