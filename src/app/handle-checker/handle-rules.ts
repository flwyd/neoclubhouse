import { Injectable } from '@angular/core';

import { Handle } from './handle';
import { HandleConflict } from './handle-conflict';
import { HandleRule } from './handle-rule';
import { HandleService } from './handle.service';

@Injectable()
export class MinLengthRule implements HandleRule {
  get id(): string { return 'min-length'; }

  check(name: string): Promise<HandleConflict[]> {
    let result = [];
    if (name.trim().length === 0) {
      return Promise.resolve(result);
    }
    if (!name.match(/[a-z]/i)) {
      result.push(new HandleConflict(name, 'should have letters', 'medium', this.id));
    } else if (name.length < 3 && !name.match(/^[A-Z]{2}$/)) {
      result.push(new HandleConflict(name, 'might be too short', 'high', this.id));
    }
    return Promise.resolve(result);
  }
}

@Injectable()
export class FccRule implements HandleRule {
  get id(): string { return 'fcc'; }

  // CONSIDER making these Handles so rhyming checkers can use them
  private obsceneWords = {
    // the Carlin 7
    'shit': true,
    'piss': true,
    'fuck': true,
    'cunt': true,
    'cocksucker': true,
    'motherfucker': true,
    'tits': true,
  };

  check(name: string): Promise<HandleConflict[]> {
    let result = [];
    for (let word of name.toLowerCase().split(/[^a-z]+/)) {
      if (this.obsceneWords[word]) {
        result.push(new HandleConflict(name, `${word} is frowned on by the FCC`, 'high', this.id));
      }
    };
    return Promise.resolve(result);
  }
}

@Injectable()
export class SubstringRule implements HandleRule {
  get id(): string { return 'substring'; }

  private cleaned: Promise<{[name: string]: Handle}>;

  constructor(handleService: HandleService) {
    this.cleaned = handleService.getHandles().then((handles) => {
      let cache: {[name: string]: Handle} = {};
      for (let handle of handles) {
        cache[this.clean(handle.name)] = handle;
      }
      return cache;
    });
  }

  check(candidateName: string): Promise<HandleConflict[]> {
    let name = this.clean(candidateName);
    if (name.length === 0) {
      return Promise.resolve([]);
    }
    return this.cleaned.then((cleaned) => {
      let result = [];
      for (let targetName of Object.keys(cleaned)) {
        let targetHandle = cleaned[targetName];
        if (name.length === targetName.length) {
          if (name === targetName) {
            result.push(new HandleConflict(
              candidateName, `${targetHandle.name} is already in use`,
              'high', this.id, targetHandle));
          }
        } else if (name.length < targetName.length) {
          if (targetName.indexOf(name) >= 0) {
            result.push(new HandleConflict(
              candidateName, `${targetHandle.name} contains ${candidateName}`,
              'medium', this.id, targetHandle));
          }
        } else {
          if (name.indexOf(targetName) >= 0) {
            result.push(new HandleConflict(
              candidateName, `${candidateName} contains ${targetHandle.name}`,
              'medium', this.id, targetHandle));
          }
        }
      }
      return result;
    });
  }

  private clean(name: string): string {
    if (name.match(/^[A-Z]([ .-][A-Z])*$/)) {
      // Acronyms are usually pronounced letter-by-letter; don't flag phonemes
      // that happen to include them.  Transform to space-separated letters.
      return name.trim().replace(/\W+/g, '').split(new RegExp('')).join(' ');
    }
    return name.trim().toLowerCase().replace(/\W+/g, '');
  }
}
