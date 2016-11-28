import { Injectable } from '@angular/core';

import { Handle } from './handle';
import { HandleConflict } from './handle-conflict';
import { HandleRule } from './handle-rule';
import { HandleService } from './handle.service';

// TODO npm install double-metaphone and write a DoubleMetaphoneRule

/** Handle rule for handles that are too short or don't have any letters. */
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


/** Handle rule for words the FCC doesn't want broadcast. */
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


/** Handle rule warning of names which consist only of phonetic alphabet words. */
@Injectable()
export class PhoneticAlphabetRule implements HandleRule {
  get id(): string { return 'phonetic-alphabet'; }

  private phoneticRegex: Promise<RegExp>;

  constructor(handleService: HandleService) {
    this.phoneticRegex = handleService.getHandles().then((handles) => {
      let words = handles.filter((h) => h.type === 'phonetic-alphabet')
        .map((h) => h.name.toLowerCase());
      return new RegExp(`^(${words.join('|')})+$`, 'i');
    });
  }

  check(name: string): Promise<HandleConflict[]> {
    // words are separated by non-letter or changes in case
    let words = name.split(/([A-Z][a-z]*|[a-z]+|[0-9])\W*/)
      .filter((s) => s.length > 0)
      .map((s) => s.toLowerCase());
    if (words.length === 0) {
      return Promise.resolve([]);
    }
    return this.phoneticRegex.then((regex) => {
      if (name.replace(/[^A-Za-z]/, '').match(regex)) {
        return [new HandleConflict(
          name, 'consists entirely of NATO phonetic alphabet words', 'high', this.id)];
      }
      return [];
    });
  }
}


/** Handle rule identifying exact matches and substrings. */
@Injectable()
export class SubstringRule implements HandleRule {
  get id(): string { return 'substring'; }

  private cleaned: Promise<{ [name: string]: Handle }>;

  constructor(handleService: HandleService) {
    this.cleaned = handleService.getHandles().then((handles) => {
      let cache: { [name: string]: Handle } = {};
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


/** Handle rule catching names spelled similarly based on Levenshtein edit distance. */
@Injectable()
export class EditDistanceRule implements HandleRule {
  private readonly maxDistance = 1;
  private cleaned: Promise<{ [name: string]: Handle }>;

  constructor(handleService: HandleService) {
    this.cleaned = handleService.getHandles().then((handles) => {
      let cache: { [name: string]: Handle } = {};
      for (let handle of handles) {
        cache[this.clean(handle.name)] = handle;
      }
      return cache;
    });
  }

  get id(): string { return 'edit-distance'; }

  check(candidateName: string): Promise<HandleConflict[]> {
    let name = this.clean(candidateName);
    if (name.length === 0) {
      return Promise.resolve([]);
    }
    return this.cleaned.then((cleaned) => {
      let result = [];
      for (let targetName of Object.keys(cleaned)) {
        let targetHandle = cleaned[targetName];
        if (this.withinEditDistance(name, targetName, this.maxDistance)
          && candidateName.toLowerCase() !== targetHandle.name.toLowerCase()) {
          result.push(new HandleConflict(
            candidateName, `${candidateName} is spelled like ${targetHandle.name}`,
            'medium', this.id, targetHandle));
        }
      }
      return result;
    });
  }

  private clean(name: string) {
    return name.trim().toLowerCase().replace(/\W+/g, '');
  }

  private withinEditDistance(source, target, maxDistance): boolean {
    if (Math.abs(source.length - target.length) > maxDistance) {
      return false; // more than max insertions needed
    }
    // TODO this can be optimized by only calculating a diagonal slice of the
    // array of width 1 + 2 * maxDistance.  See Algorithms for Approximate String
    // Matching by Esko Ukkonen https://www.cs.helsinki.fi/u/ukkonen/InfCont85.PDF
    let d = new Array(source.length + 1);
    for (let i = 0; i <= source.length; ++i) {
      d[i] = new Array(target.length + 1);
      d[i][0] = i;
    }
    for (let j = 0; j <= target.length; ++j) {
      d[0][j] = j;
    }
    for (let j = 1; j <= target.length; ++j) {
      let rowMin = d[0][j];
      for (let i = 1; i <= source.length; ++i) {
        if (source.charAt(i - 1) === target.charAt(j - 1)) {
          d[i][j] = d[i - 1][j - 1];
        } else {
          d[i][j] = Math.min(
            d[i - 1][j] + 1,  // deletion
            d[i][j - 1] + 1,  // insertion
            d[i - 1][j - 1] + 1);  // substitution
        }
        rowMin = Math.min(rowMin, d[i][j]);
      }
      if (rowMin > maxDistance) {
        return false; // already exceeded max
      }
    }
    return d[source.length][target.length] <= maxDistance;
  }
}


/** Handle rule implementing the old standard American Soundex phonetic algorithm. */
@Injectable()
export class AmericanSoundexRule implements HandleRule {
  private readonly maxLength = 6; // official soundex implementation is 4
  private hashed: Promise<{ [name: string]: Handle[] }>;

  constructor(handleService: HandleService) {
    this.hashed = handleService.getHandles().then((handles) => {
      let result: { [name: string]: Handle[] } = {};
      for (let handle of handles) {
        let hash = this.soundex(handle.name);
        if (hash) {
          if (!result[hash]) {
            result[hash] = [];
          }
          result[hash].push(handle);
        }
      }
      return result;
    });
  }

  get id(): string { return 'american-soundex'; }

  check(name: string): Promise<HandleConflict[]> {
    let hash = this.soundex(name);
    if (hash.length === 0) {
      return Promise.resolve([]);
    }
    return this.hashed.then((hashed) => {
      let result = [];
      if (hash in hashed) {
        for (let targetHandle of hashed[hash]) {
          if (name.toLowerCase() !== targetHandle.name.toLowerCase()) {
            result.push(new HandleConflict(
              name, `${name} may sound like ${targetHandle.name}`,
              'medium', this.id, targetHandle));
          }
        }
      }
      return result;
    });
  }

  /**
   * From http://en.wikipedia.org/wiki/Soundex
   * 1. The first letter of the name is the letter of the Soundex code,
   *    and is not coded to a number.
   * 2. Replace consonants with digits as follows (after the first letter):
   *    b, f, p, v => 1
   *    c, g, j, k, q, s, x, z => 2
   *    d, t => 3
   *    l => 4
   *    m, n => 5
   *    r => 6
   *    h, w are not coded
   * 3. Two adjacent letters with the same number are coded as a
   *    single number. Letters with the same number separated by an
   *    h or w are also coded as a single number.
   * 4. Continue until you have one letter and three numbers.
   *    If you run out of letters, fill in 0s until there are three numbers.
   */
  private soundex(name: string): string {
    name = name.toUpperCase().replace(/[^A-Z]+/g, '');
    if (name.length === 0) {
      return '';
    }
    let result = name[0];
    let prevNum = this.numericValue(result);
    for (let i = 1; i < name.length && result.length < this.maxLength; ++i) {
      let num = this.numericValue(name[i]);
      if (num > 0 && num !== prevNum) {
        result += num;
      }
      if (num !== -2) { // H&W don't separate matching letters
        prevNum = num;
      }
    }
    while (result.length < this.maxLength) {
      result += '0';
    }
    return result;
  }

  private numericValue(letter: string): number {
    if (letter.match(/^[AEIOUY]/)) { return -1; }
    if (letter.match(/^[HW]/)) { return -2; }
    if (letter.match(/^[BFPV]/)) { return 1; }
    if (letter.match(/^[CGJKQSXZ]/)) { return 2; }
    if (letter.match(/^[DT]/)) { return 3; }
    if (letter.match(/^[L]/)) { return 4; }
    if (letter.match(/^[MN]/)) { return 5; }
    if (letter.match(/^[R]/)) { return 6; }
  }
}
