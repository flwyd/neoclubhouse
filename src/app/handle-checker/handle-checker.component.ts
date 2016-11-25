import { Component, OnInit } from '@angular/core';

import { Handle } from '../handle';
import { HandleService } from '../handle.service';

@Component({
  selector: 'app-handle-checker',
  templateUrl: './handle-checker.component.html',
  styleUrls: ['./handle-checker.component.scss']
})
export class HandleCheckerComponent implements OnInit {
  handles: Handle[] = [];

  constructor(private handleService: HandleService) { }

  ngOnInit() {
    // TODO observable
    this.handleService.getHandles().then(handles => this.handles = handles);
  }
}
