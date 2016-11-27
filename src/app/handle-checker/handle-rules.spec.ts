import { TestBed, async, inject } from '@angular/core/testing';

import { ALL_HANDLE_RULES, HandleRule } from './handle-rule';
import { MinLengthRule, FccRule, SubstringRule } from './handle-rules';
import { HandleService } from './handle.service';
import { MockHandleService } from './handle.service.mock';

describe('Handle rules', () => {
  const expectNoConflicts = (rule, name) => {
    rule.check(name).then((conflicts) => {
      expect(conflicts.length).toBe(0);
    }).catch((e) => fail(e));
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {provide: HandleService, useClass: MockHandleService},
        MinLengthRule, FccRule, SubstringRule, // TODO HandleCheckerModule
        {
          provide: ALL_HANDLE_RULES,
          deps: [MinLengthRule, FccRule, SubstringRule],
          useFactory: (letters, fcc, substring) => [letters, fcc, substring]
        },
      ],
    });
  });

  describe('ALL_HANDLE_RULES', () => {
    it('should inject all rules', inject([ALL_HANDLE_RULES], (rules: HandleRule[]) => {
      expect(rules).toBeTruthy();
      expect(rules.length).toBe(3);
      let ids = rules.map((x) => x.id);
      expect(ids).toEqual(jasmine.arrayContaining(['min-length', 'fcc', 'substring']));
    }));
  });

  describe('MinLengthRule', () => {
    it('should complain about 1-2 letters', async(inject([MinLengthRule], (rule: HandleRule) => {
      let checkit = (name) => {
        rule.check(name).then((conflicts) => {
          expect(conflicts.length).toBe(1);
          expect(conflicts[0].candidateName).toBe(name);
          expect(conflicts[0].description).toMatch('too short');
        }).catch((e) => fail(e));
      };
      checkit('X');
      checkit('a');
      checkit('It');
      checkit('me');
      checkit('W.');
    })));

    it('should not complain about two capitals', async(inject([MinLengthRule], (rule: HandleRule) => {
      expect(rule).toBeTruthy();
      expectNoConflicts(rule, 'LK');
      expectNoConflicts(rule, 'TC');
    })));

    it('should not complain about 3+ characters', async(inject([MinLengthRule], (rule: HandleRule) => {
      expect(rule).toBeTruthy();
      expectNoConflicts(rule, 'It Is To Be');
      expectNoConflicts(rule, 'Foo');
      expectNoConflicts(rule, 'a2z');
      expectNoConflicts(rule, 'j.c');
      expectNoConflicts(rule, 'd d');
    })));

    it('should complain about non-alphabetic names', async(inject([MinLengthRule], (rule: HandleRule) => {
      expect(rule).toBeTruthy();
      let checkit = (name) => {
        rule.check(name).then((conflicts) => {
          expect(conflicts.length).toBe(1);
          expect(conflicts[0].candidateName).toBe(name);
          expect(conflicts[0].description).toMatch('should have letters');
        }).catch((e) => fail(e));
      };
      checkit('1234');
      checkit('56 78');
      checkit('@');
      checkit('\u0391\u0392\u0393');
      checkit(String.fromCodePoint(0x1F4A9));
    })));

    it('should not complain if there\'s at least one letter', async(inject([MinLengthRule], (rule: HandleRule) => {
      expect(rule).toBeTruthy();
      expectNoConflicts(rule, 'Go2Girl');
      expectNoConflicts(rule, 'B-4');
      expectNoConflicts(rule, '2x4');
    })));
  });

  describe('FccRule', () => {
    it('should complain about the Carlin 7', async(inject([FccRule], (rule: HandleRule) => {
      let checkit = (name) => {
        rule.check(name).then((conflicts) => {
          expect(conflicts.length).toBe(1);
          expect(conflicts[0].candidateName).toBe(name);
          expect(conflicts[0].description).toMatch('FCC');
        }).catch((e) => fail(e));
      };
      checkit('Hot shit handle');
      checkit('Piss-ant');
      checkit('Fuck Censorship');
      checkit('Why Cunt?');
      checkit('CockSucker');
      checkit('Charismatic Motherfucker');
      checkit('2Tits');
    })));

    it('should not complain about substrings', async(inject([FccRule], (rule: HandleRule) => {
      expectNoConflicts(rule, 'BassHit');
      expectNoConflicts(rule, 'pisser');
      expectNoConflicts(rule, 'Metric Fuckton');
      expectNoConflicts(rule, 'Scunthorpe');
      expectNoConflicts(rule, 'Cocksuckers');
      expectNoConflicts(rule, 'BadAssMotherfucker');
      expectNoConflicts(rule, 'Twotits');
    })));
  });

  describe('SubstringRule', () => {
    it('should complain about exact matches', async(inject([SubstringRule], (rule: HandleRule) => {
      let checkit = (name) => {
        rule.check(name).then((conflicts) => {
          expect(conflicts.length).toBe(1);
          expect(conflicts[0].candidateName).toBe(name);
          expect(conflicts[0].description).toMatch('in use');
          expect(conflicts[0].conflict.name.toUpperCase()).toBe(name.toUpperCase());
        }).catch((e) => fail(e));
      };
      checkit('Zulu');
      checkit('golf');
      checkit('CHARLIE');
    })));

    it('should complain when name is a substring', async(inject([SubstringRule], (rule: HandleRule) => {
      let checkit = (name, existing) => {
        rule.check(name).then((conflicts) => {
          expect(conflicts.length).toBeGreaterThan(0);
          let found = conflicts.find((x) => x.conflict.name === existing);
          expect(found).toBeTruthy(`${existing} not found in ${JSON.stringify(conflicts)}`);
          expect(found.candidateName).toBe(name);
          expect(found.description).toMatch(`${existing} contains ${name}`);
        }).catch((e) => fail(e));
      };
      checkit('Fox', 'Foxtrot');
      checkit('Ray', 'X-ray');
      checkit('Julie', 'Juliett');
      checkit('pa', 'Papa');
      checkit('eMbEr', 'November');
      checkit('ot', 'Hotel');
      checkit('ot', 'Foxtrot');
    })));

    it('should complain when name contains another', async(inject([SubstringRule], (rule: HandleRule) => {
      let checkit = (name, existing) => {
        rule.check(name).then((conflicts) => {
          expect(conflicts.length).toBeGreaterThan(0);
          let found = conflicts.find((x) => x.conflict.name === existing);
          expect(found).toBeTruthy(`${existing} not found in ${JSON.stringify(conflicts)}`);
          expect(found.candidateName).toBe(name);
          expect(found.description).toMatch(`${name} contains ${existing}`);
        }).catch((e) => fail(e));
      };
      checkit('TheGolfather', 'Golf');
      checkit('paparazi', 'Papa');
      checkit('Gary Indiana', 'India');
      checkit('Hotel Moron', 'Hotel');
      checkit('CzEcHoSlOvAkIa', 'Echo');
    })));
  });
});
