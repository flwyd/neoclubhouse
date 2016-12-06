/* tslint:disable:no-unused-variable */

import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SimpleNotificationsModule } from 'angular2-notifications';
import { AppComponent } from './app.component';
import { SecretClubhouseService } from './secret-clubhouse.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

describe('AppComponent', () => {
  let clubhouse = null;

  beforeEach(() => {
    clubhouse = {
      getAuthState: () => new BehaviorSubject({ loggedIn: false }),
      checkAuthPeriodically: function() {},
    };
    TestBed.configureTestingModule({
      imports: [
        SimpleNotificationsModule,
        RouterTestingModule.withRoutes([
          { path: '', component: AppComponent }
        ]),
      ],
      declarations: [
        AppComponent
      ],
      providers: [
        {
          provide: SecretClubhouseService,
          useValue: clubhouse,
        },
      ],
    });
  });

  it('should create the app', async(() => {
    let fixture = TestBed.createComponent(AppComponent);
    let app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));

  it(`should have as title 'app works!'`, async(() => {
    let fixture = TestBed.createComponent(AppComponent);
    let app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('Ranger Neoclubhouse');
  }));

  it('should render title in a h1 tag', async(() => {
    let fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    let compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('h1').textContent).toContain('Ranger Neoclubhouse');
  }));

  it('should create start auth polling', async(() => {
    spyOn(clubhouse, 'checkAuthPeriodically');
    let fixture = TestBed.createComponent(AppComponent);
    let app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
    fixture.detectChanges();
    expect(clubhouse.checkAuthPeriodically).toHaveBeenCalled();
  }));
});
