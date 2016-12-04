import { OpaqueToken } from '@angular/core';

import { HandleConflict } from './handle-conflict';

/**
 * A rule or heuristic which can identify potential conflicts with a proposed handle.
 * Implementations are in handle-rules.ts.
 */
export interface HandleRule {
  id: string;

  check(candidateName: string): Promise<HandleConflict[]>;
}

/** Injection key for HandleRule[]: an array of all known rules. */
export let ALL_HANDLE_RULES = new OpaqueToken('handle-rule.all');
