/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { HandleCheckerComponent } from './handle-checker.component';
import { HandleService } from '../handle.service';

describe('HandleCheckerComponent', () => {
  let component: HandleCheckerComponent;
  let fixture: ComponentFixture<HandleCheckerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HandleCheckerComponent ],
      providers: [ HandleService ], // TODO make a mock impl
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
      expect(names[0].nativeElement.textContent).toEqual('Alfa');
      expect(names[25].nativeElement.textContent).toEqual('Zulu');
    });
  }));
});
