/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { HandleCheckerComponent } from './handle-checker.component';
import { HandleCheckerModule } from './handle-checker.module';
import { ALL_HANDLE_RULES } from './handle-rule';
import { MinLengthRule, FccRule, SubstringRule } from './handle-rules';
import { HandleService } from './handle.service';
import { MockHandleService } from './handle.service.mock';

/** Jasmine unit tests for {@link HandleCheckerComponent}. */
describe('HandleCheckerComponent', () => {
  let component: HandleCheckerComponent;
  let fixture: ComponentFixture<HandleCheckerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        HandleCheckerModule,
      ],
      providers: [
        { provide: HandleService, useClass: MockHandleService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HandleCheckerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a table of all handles', async(() => {
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

  it('should have a table of checked handles', async(() => {
    fixture.detectChanges();
    let table = fixture.debugElement.query(By.css('.checked-handles'));
    expect(table).toBeTruthy();
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      let names = table.queryAll(By.css('.handle-row .handle-name'));
      expect(names.length).toBe(0); // starts empty
    });
  }));

  it('should check input handles', async(() => {
    fixture.detectChanges();
    let input = fixture.debugElement.query(By.css('#handle-check-input'));
    expect(input).toBeTruthy();
    let inputEl = input.nativeElement;
    expect(inputEl.textContent).toBe('');
    let button = fixture.debugElement.query(By.css('button[type="submit"]'));
    expect(button).toBeTruthy();
    let table = fixture.debugElement.query(By.css('.checked-handles'));
    expect(table).toBeTruthy();
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      inputEl.value = 'nov';
      inputEl.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(component.currentName).toBe('nov');
      button.nativeElement.click();
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        let rows = table.queryAll(By.css('.handle-row'));
        expect(rows.length).toBe(1);
        let row = rows[0];
        let nameCell = row.query(By.css('.handle-name'));
        expect(nameCell.nativeElement.textContent).toBe('nov');
        let substringConflict = row.query(By.css('.handle-conflict-rule-substring'));
        expect(substringConflict.nativeElement.textContent).toMatch('November');
        expect(inputEl.textContent).toBe(''); // submit clears input
      });
    });
  }));
});
