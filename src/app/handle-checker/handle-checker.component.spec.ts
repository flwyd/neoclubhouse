/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { HandleCheckerComponent } from './handle-checker.component';
import { ALL_HANDLE_RULES } from './handle-rule';
import { MinLengthRule, FccRule, SubstringRule } from './handle-rules';
import { HandleService } from './handle.service';
import { MockHandleService } from './handle.service.mock';

describe('HandleCheckerComponent', () => {
  let component: HandleCheckerComponent;
  let fixture: ComponentFixture<HandleCheckerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ FormsModule ],
      declarations: [ HandleCheckerComponent ],
      providers: [
        {provide: HandleService, useClass: MockHandleService},
        MinLengthRule, FccRule, SubstringRule,
        {
          provide: ALL_HANDLE_RULES,
          deps: [MinLengthRule, FccRule, SubstringRule],
          useFactory: (letters, fcc, substring) => [letters, fcc, substring]
        },
      ], // TODO make a mock HandleService impl
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HandleCheckerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a table of handles', async(() => {
    fixture.detectChanges();
    let table = fixture.debugElement.query(By.css('.all-handles'));
    expect(table).toBeTruthy();
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      let names = table.queryAll(By.css('.handle-row .handle-name'));
      expect(names.length).toBe(26);
      expect(names[0].nativeElement.textContent.trim()).toEqual('Alfa');
      expect(names[25].nativeElement.textContent.trim()).toEqual('Zulu');
    });
  }));
});
