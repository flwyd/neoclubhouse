/* tslint:disable:no-unused-variable */

import { async, inject, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NotificationsService, SimpleNotificationsModule } from 'angular2-notifications';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { AppComponent } from './app.component';
import { AuthService } from './auth/auth.service';
import { AuthState } from './auth/auth-state';
import { SecretClubhouseService } from './secret-clubhouse.service';

/**
 * Jasmine tests for application component.
 * @see https://angular.io/docs/ts/latest/guide/testing.html
 */
describe('AppComponent', () => {
  beforeEach(() => {
    let authState = new BehaviorSubject(AuthState.anonymous());
    let authService = {
      getAuthState: () => authState,
      getKnownAuthState: () => authState.filter((s) => s.stateKnown),
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
          provide: AuthService,
          useValue: authService,
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

  it('should start auth polling', async(inject([AuthService, NotificationsService],
      (authService, notifications: NotificationsService) => {
    spyOn(authService, 'checkAuthPeriodically');
    spyOn(notifications, 'error');
    let fixture = TestBed.createComponent(AppComponent);
    let app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
    fixture.detectChanges();
    expect(authService.checkAuthPeriodically).toHaveBeenCalled();
    expect(notifications.error).toHaveBeenCalled();
  })));
});
