import { TestBed, async, inject } from '@angular/core/testing';

import { HandleCheckerModule } from './handle-checker.module';
import { ALL_HANDLE_RULES, HandleRule } from './handle-rule';
import { MinLengthRule, FccRule, PhoneticAlphabetRule, SubstringRule, EditDistanceRule, AmericanSoundexRule } from './handle-rules';
import { HandleService } from './handle.service';
import { MockHandleService } from './handle.service.mock';

describe('Handle rules', () => {
  const expectNoConflicts = (rule, name) => {
    rule.check(name).then((conflicts) => {
      expect(conflicts.length).toBe(0, `conflicts for ${name}`);
    }).catch((e) => fail(e));
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HandleCheckerModule,
      ],
      providers: [
        { provide: HandleService, useClass: MockHandleService },
      ],
    });
  });

  describe('ALL_HANDLE_RULES', () => {
    it('should inject all rules', inject([ALL_HANDLE_RULES], (rules: HandleRule[]) => {
      expect(rules).toBeTruthy();
      expect(rules.length).toBe(6);
      let ids = rules.map((x) => x.id);
      expect(ids).toEqual(jasmine.arrayContaining(
        ['min-length', 'fcc', 'substring', 'edit-distance', 'american-soundex']));
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

  describe('PhoneticAlphabetRule', () => {
    it('should complain if a name is just phonetic words', async(inject([PhoneticAlphabetRule], (rule: HandleRule) => {
      let checkit = (name) => {
        rule.check(name).then((conflicts) => {
          expect(conflicts.length).toBe(1, `no conflicts for ${name}`);
          expect(conflicts[0].candidateName).toBe(name);
          expect(conflicts[0].description).toMatch('phonetic alphabet');
        }).catch((e) => fail(e));
        checkit('Fox Trot');
        checkit('FoxTrot');
        checkit('Tango Charlie');
        checkit('golf uniform');
        checkit('Romeo & Juliett');
        checkit('WhiskeyTangoFoxtrot');
        checkit('Quebec2Lima');
      };
    })));

    it('should not complain if a name contains non-phonetics', async(inject([PhoneticAlphabetRule], (rule: HandleRule) => {
      expectNoConflicts(rule, 'Baker');
      expectNoConflicts(rule, 'Indian');
      expectNoConflicts(rule, 'Wherefore Romeo');
      expectNoConflicts(rule, 'Quebec City');
      expectNoConflicts(rule, 'Two Kilos');
      expectNoConflicts(rule, 'Hotels');
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
          expect(conflicts.length).toBeGreaterThan(0, `no conflicts for ${name}`);
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
          expect(conflicts.length).toBeGreaterThan(0, `no conflicts for ${name}`);
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

  describe('EditDistanceRule', () => {
    it('should complain when edit distance is 1', async(inject([EditDistanceRule], (rule: HandleRule) => {
      let checkit = (name, existing) => {
        rule.check(name).then((conflicts) => {
          expect(conflicts.length).toBeGreaterThan(0, `no conflicts for ${name}`);
          let found = conflicts.find((x) => x.conflict.name === existing);
          expect(found).toBeTruthy(`${existing} not found in ${JSON.stringify(conflicts)}`);
          expect(found.candidateName).toBe(name);
          expect(found.description).toMatch(`${name} is spelled like ${existing}`);
        }).catch((e) => fail(e));
      };
      checkit('Braco', 'Bravo'); // change
      checkit('Gold', 'Golf'); // change
      checkit('mile', 'Mike'); // change
      checkit('Movember', 'November'); // change
      checkit('oshcar', 'Oscar'); // add
      checkit('ViCtOrY', 'Victor'); // add
      checkit('ZUL', 'Zulu'); // add
      checkit('I\'m A', 'Lima'); // remove
      checkit('Rome', 'Romeo'); // remove
    })));

    it('should not complain when edit distance is 2+', async(inject([EditDistanceRule], (rule: HandleRule) => {
      expectNoConflicts(rule, 'Alpha');
      expectNoConflicts(rule, 'Bravado');
      expectNoConflicts(rule, 'Golfer');
      expectNoConflicts(rule, 'Julie');
      expectNoConflicts(rule, 'Vember');
      expectNoConflicts(rule, 'Popo');
      expectNoConflicts(rule, 'Sex-ray');
    })));
  });

  describe('AmericanSoundexRule', () => {
    it('should complain when soundex matches', async(inject([AmericanSoundexRule], (rule: HandleRule) => {
      let checkit = (name, existing) => {
        rule.check(name).then((conflicts) => {
          expect(conflicts.length).toBeGreaterThan(0, `no conflicts for ${name}`);
          let found = conflicts.find((x) => x.conflict.name === existing);
          expect(found).toBeTruthy(`${existing} not found in ${JSON.stringify(conflicts)}`);
          expect(found.candidateName).toBe(name);
          expect(found.description).toMatch(`${name} may sound like ${existing}`);
        }).catch((e) => fail(e));
      };
      checkit('alpha', 'Alfa');
      checkit('BRAVE', 'Bravo');
      checkit('FocsDryad', 'Foxtrot');
      checkit('Jeweled', 'Juliett');
      checkit('Mice', 'Mike');
      checkit('Nabenfir', 'November');
      checkit('Sero', 'Sierra');
      checkit('Victoria', 'Victor');
      checkit('Wishco', 'Whiskey');
    })));

    it('should not complain when soundex fails', async(inject([AmericanSoundexRule], (rule: HandleRule) => {
      expectNoConflicts(rule, 'Elfa');
      expectNoConflicts(rule, 'Shirley');
      expectNoConflicts(rule, 'Foxrot');
      expectNoConflicts(rule, 'Motel');
      expectNoConflicts(rule, 'Quebec City');
      expectNoConflicts(rule, 'Unicorn');
      expectNoConflicts(rule, 'Vitcor');
    })));
  });
});
