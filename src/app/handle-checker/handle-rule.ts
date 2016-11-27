import { OpaqueToken } from '@angular/core';

import { HandleConflict } from './handle-conflict';

export interface HandleRule {
  id: string;

  check(candidateName: string): Promise<HandleConflict[]>;
}

export let ALL_HANDLE_RULES = new OpaqueToken('handle-rule.all');
