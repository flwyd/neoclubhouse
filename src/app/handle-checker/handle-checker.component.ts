import { Component, Inject, Input, OnInit } from '@angular/core';

import { Handle } from './handle';
import { HandleConflict } from './handle-conflict';
import { ALL_HANDLE_RULES, HandleRule } from './handle-rule';
import { HandleService } from './handle.service';

@Component({
  selector: 'app-handle-checker',
  templateUrl: './handle-checker.component.html',
  styleUrls: ['./handle-checker.component.scss']
})
export class HandleCheckerComponent implements OnInit {
  handles: Handle[] = [];
  checkedNames: {name: string, conflicts: HandleConflict[]}[] = [];
  @Input() currentName = '';

  constructor(
    private handleService: HandleService,
    @Inject(ALL_HANDLE_RULES) private allRules: HandleRule[]) {
  }

  ngOnInit() {
    // TODO observable
    this.handleService.getHandles().then(handles => this.handles = handles);
  }

  checkCurrentName() {
    let name = this.currentName.trim();
    if (name === '') {
      return;
    }
    let conflicts = [];
    for (let rule of this.allRules) {
      rule.check(name).then((results) => {
        Array.prototype.push.apply(conflicts, results);
      });
    }
    this.checkedNames.push({name: name, conflicts: conflicts});
  }

  conflictTip(conflict: HandleConflict) {
    return conflict.conflict ?
      `Conflict with ${conflict.conflict.type} handle ${conflict.conflict.name}` : '';
  }

  conflictClasses(conflict: HandleConflict) {
    return [
      `handle-conflict-priority-${conflict.priority}`,
      `handle-conflict-rule-${conflict.ruleId}`,
    ];
  }
}
