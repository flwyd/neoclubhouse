import {
  Component, Inject, Input, OnInit, animate, state, style, transition, trigger
} from '@angular/core';

import { Handle } from './handle';
import { ConflictPriority, HandleConflict, PRIORITY_ORDER } from './handle-conflict';
import { ALL_HANDLE_RULES, HandleRule } from './handle-rule';
import { HandleService } from './handle.service';

const _ = require('lodash');

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

export class RuleState {
  active = true;

  constructor(
    public rule: HandleRule,
  ) { }

  get name(): string { return RULE_NAMES[this.rule.id] || this.rule.id; }
}

/** View model for a single name conflict. */
export class ConflictViewModel {
  title: string;
  description: string;
  toolTip: string;
  counterpart: Handle;
  priority: ConflictPriority;
  classes: string[];
  priorityClass: string;
  ruleClass: string;
  handleTypeClass: string;
  expanded = false;

  constructor(
    hc: HandleConflict,
    public ruleState: RuleState
  ) {
    this.description = hc.description;
    this.priority = hc.priority;
    this.classes = [
      `handle-conflict-priority-${hc.priority}`,
      `handle-conflict-rule-${hc.ruleId}`,
    ];
    if (hc.conflict) {
      this.counterpart = hc.conflict;
      this.title = hc.conflict.name;
      this.toolTip =
        `Conflict with ${hc.conflict.type} handle ${hc.conflict.name} (${ruleState.name})`;
      let handleType = hc.conflict.type.toLowerCase().replace(/\W+/, '-');
      this.classes.push(`handle-conflict-type-${handleType}`);
    } else {
      this.title = ruleState.name;
      this.toolTip = ruleState.name;
    }
  }

  toggleExpanded() {
    this.expanded = !this.expanded;
    if (this.expanded) {
      this.classes.push('expanded');
    } else {
      let i = this.classes.indexOf('expanded');
      if (i >= 0) {
        this.classes.splice(i, 1);
      }
    }
  }
}

/** View model for all conflicts found for a potential handle. */
export class CheckViewModel {
  conflicts: ConflictViewModel[];

  constructor(
    public name: string,
    conflicts: ConflictViewModel[] = []
  ) {
    this.conflicts = _.sortBy(conflicts, [
      // first by priority
      (x) => PRIORITY_ORDER[x.priority],
      // second, put conflicts first if they don't match a specific existing handle
      (x) => !!x.counterpart,
      // third by title
      (x) => x.title.toLowerCase(),
      // if two entities share a handle, resolve by handle type
      (x) => x.counterpart ? x.counterpart.type : ''
    ]);
  }
}

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
      state('in', style({ opacity: 1 })),
      transition(':enter', [style({ opacity: 0 }), animate(200)]),
    ]),
    trigger('ruleStateDisplay', [
      state('true', style({
        display: 'inline',
      })),
      state('false', style({
        display: 'none',
      })),
      transition('true <=> false', animate(100)),
    ]),
  ],
})
export class HandleCheckerComponent implements OnInit {
  /** All known handles and reserved words. */
  handles: Handle[] = [];
  /** Prospective handles which have been checked in this session. */
  checkedNames: CheckViewModel[] = [];
  /** The name being entered or checked (bound to an input field). */
  @Input() currentName = '';
  /** Enabled/disabled state for each rule.  If !active, the rule won't be asked for conflicts. */
  @Input() ruleStates: RuleState[] = [];

  constructor(
    private handleService: HandleService,
    @Inject(ALL_HANDLE_RULES) private allRules: HandleRule[]) {
  }

  ngOnInit() {
    // TODO observable
    this.handleService.getHandles().then(handles => this.handles = handles);
    this.ruleStates = this.allRules.map((rule) => new RuleState(rule))
      .sort((a, b) => a.name < b.name ? -1 : 1);
  }

  /**
   * Check {@link currentName} against each active rule, appending results to {@link checkedNames}.
   */
  checkCurrentName(): Promise<void> {
    let name = this.currentName.trim();
    if (name === '') {
      return;
    }
    this.currentName = '';
    let promises = [];
    for (let state of this.ruleStates) {
      promises.push(state.rule.check(name)
        .then((conflicts) => conflicts.map((c) => new ConflictViewModel(c, state))));
    }
    return Promise.all(promises).then((conflicts: ConflictViewModel[]) => {
      let all = conflicts.reduce((acc, l) => acc.concat(l), []);
      this.checkedNames.unshift(new CheckViewModel(name, all));
    });
  }

  clearCheckedNames(): void {
    this.checkedNames.splice(0);
  }
}
