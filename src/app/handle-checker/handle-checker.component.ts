import { Component, Inject, Input, OnInit } from '@angular/core';

import { Handle } from './handle';
import { HandleConflict } from './handle-conflict';
import { ALL_HANDLE_RULES, HandleRule } from './handle-rule';
import { HandleService } from './handle.service';

const RULE_NAMES = {
  'american-soundex': 'American Soundex',
  'edit-distance': 'Edit distance',
  'fcc': 'FCC words',
  'min-length': 'Minimum length',
  'phonetic-alphabet': 'NATO phonetic letters',
  'substring': 'Substring match',
};

@Component({
  selector: 'app-handle-checker',
  templateUrl: './handle-checker.component.html',
  styleUrls: ['./handle-checker.component.scss']
})
export class HandleCheckerComponent implements OnInit {
  handles: Handle[] = [];
  checkedNames: {name: string, conflicts: HandleConflict[]}[] = [];
  @Input() currentName = '';
  @Input() ruleState: { rule: HandleRule, name: string, active: boolean }[] = [];

  constructor(
      private handleService: HandleService,
      @Inject(ALL_HANDLE_RULES) private allRules: HandleRule[]) {
  }

  ngOnInit() {
    // TODO observable
    this.handleService.getHandles().then(handles => this.handles = handles);
    this.ruleState = this.allRules.map((rule) => {
      return {rule: rule, name: RULE_NAMES[rule.id] || rule.id, active: true};
    }).sort((a, b) => a.name < b.name ? -1 : 1);
  }

  checkCurrentName() {
    let name = this.currentName.trim();
    if (name === '') {
      return;
    }
    let conflicts = [];
    for (let state of this.ruleState) {
      if (state.active) {
        state.rule.check(name).then((results) => {
          Array.prototype.push.apply(conflicts, results);
        });
      }
    }
    this.checkedNames.unshift({name: name, conflicts: conflicts});
    this.currentName = '';
  }

  conflictTip(conflict: HandleConflict) {
    return conflict.conflict ?
      `Conflict with ${conflict.conflict.type} handle ${conflict.conflict.name}` : '';
  }

  conflictClasses(conflict: HandleConflict) {
    let classes = [
      `handle-conflict-priority-${conflict.priority}`,
      `handle-conflict-rule-${conflict.ruleId}`,
    ];
    if (conflict.conflict) {
      let handleType = conflict.conflict.type.toLowerCase().replace(/\W+/, '-');
      classes.push(`handle-conflict-type-${handleType}`);
    }
    return classes;
  }
}
