import { Component, Inject, Input, OnInit,
  animate, state, style, transition, trigger } from '@angular/core';

import { Handle } from './handle';
import { HandleConflict } from './handle-conflict';
import { ALL_HANDLE_RULES, HandleRule } from './handle-rule';
import { HandleService } from './handle.service';

/** Mapping from {@link HandleRule#id} to display string. */
const RULE_NAMES = {
  'american-soundex': 'American Soundex',
  'double-metaphone': 'Double Metaphone',
  'edit-distance': 'Edit distance',
  'eye-rhyme': 'Eye rhymes',
  'fcc': 'FCC words',
  'min-length': 'Minimum length',
  'phonetic-alphabet': 'NATO phonetic letters',
  'substring': 'Substring match',
};

/**
 * View for the Ranger handle checker.  Loads a list of {@link HandleRule}s and presents a form for
 * entering prospective handles.  Each rule applies its own logic and returns a list of potential
 * conflicts, which this component displays.  Rules can be disabled via checkboxes.
 * This component also shows a list of all known handles and other reserved words to facilitate
 * handle browsing and textual searches.
 */
@Component({
  selector: 'app-handle-checker',
  templateUrl: './handle-checker.component.html',
  styleUrls: ['./handle-checker.component.scss'],
  animations: [
    trigger('tableInsert', [
      state('in', style({opacity: 1})),
      transition(':enter', [style({opacity: 0}), animate(200)]),
    ])
  ],
})
export class HandleCheckerComponent implements OnInit {
  /** All known handles and reserved words. */
  handles: Handle[] = [];
  /** Prospective handles which have been checked in this session. */
  checkedNames: {name: string, conflicts: HandleConflict[]}[] = [];
  /** The name being entered or checked (bound to an input field). */
  @Input() currentName = '';
  /** Enabled/disabled state for each rule.  If !active, the rule won't be asked for conflicts. */
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

  /**
   * Check {@link currentName} against each active rule, appending results to {@link checkedNames}.
   */
  checkCurrentName(): void {
    let name = this.currentName.trim();
    if (name === '') {
      return;
    }
    let promises = [];
    for (let state of this.ruleState) {
      if (state.active) {
        promises.push(state.rule.check(name));
      }
    }
    Promise.all(promises).then((conflicts: HandleConflict[][]) => {
      let all = conflicts.reduce((acc, l) => acc.concat(l), []);
      this.checkedNames.unshift({name: name, conflicts: all});
    });
    this.currentName = '';
  }

  /** Tool tip for a {@link HandleConflict}. */
  conflictTip(c: HandleConflict): string {
    return c.conflict ?
      `Conflict with ${c.conflict.type} handle ${c.conflict.name} (${RULE_NAMES[c.ruleId]})`
      : '';
  }

  /** List of CSS classes to apply to a {@link HandleConflict}. */
  conflictClasses(conflict: HandleConflict): string[] {
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
