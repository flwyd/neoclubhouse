/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { BaseRequestOptions, Http, Response, ResponseOptions } from '@angular/http';
import { MockBackend } from '@angular/http/testing';
import { AuthState, SecretClubhouseService } from './secret-clubhouse.service';
import { NotificationsService, SimpleNotificationsModule } from 'angular2-notifications';

function mockResponse(backend: MockBackend, result: any): void {
  backend.connections.subscribe((c) => {
    if (c.request.url.match(/DMSc=security&DMSm=authJson/)) {
      let response = new Response(new ResponseOptions({
        body: JSON.stringify(result)
      }));
      c.mockRespond(response);
    }
  });
}

describe('SecretClubhouseService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SimpleNotificationsModule,
      ],
      providers: [
        BaseRequestOptions,
        MockBackend,
        {
          provide: Http,
          deps: [MockBackend, BaseRequestOptions],
          useFactory: (backend, options) => new Http(backend, options)
        },
        SecretClubhouseService,
      ]
    });
  });

  it('should report a user is not logged in', async(inject([SecretClubhouseService, MockBackend],
    (service: SecretClubhouseService, backend: MockBackend) => {
      expect(service).toBeTruthy();
      mockResponse(backend, { data: { loggedIn: false } });
      let state: AuthState = null;
      service.getAuthState().subscribe({
        next: (val) => state = val
      });
      expect(state.loggedIn).toBe(false);
      service.checkAuth().then((result) => {
        expect(result).toBe(false);
        expect(state.loggedIn).toBe(false);
      });
    })));

  it('should report a user is not logged in', async(inject([SecretClubhouseService, MockBackend],
    (service: SecretClubhouseService, backend: MockBackend) => {
      expect(service).toBeTruthy();
      mockResponse(backend,
        { data: { loggedIn: true, callsign: 'Danger', email: 'danger@example.com' } });
      let state: AuthState = null;
      service.getAuthState().subscribe({
        next: (val) => state = val
      });
      expect(state.loggedIn).toBe(false);
      service.checkAuth().then((result) => {
        expect(result).toBe(true);
        expect(state.loggedIn).toBe(true);
        expect(state.callsign).toBe('Danger');
        expect(state.email).toBe('danger@example.com');
      });
    })));

  it('should show a notification on HTTP failure', async(inject([SecretClubhouseService, MockBackend, NotificationsService],
    (service: SecretClubhouseService, backend: MockBackend, notifications) => {
      backend.connections.subscribe((c) => {
        if (c.request.url.match(/DMSc=security&DMSm=authJson/)) {
          c.mockError(new Error('it failed!'));
        }
      });
      spyOn(notifications, 'error');
      spyOn(console, 'error');
      let state: AuthState = null;
      service.getAuthState().subscribe({
        next: (val) => state = val
      });
      expect(state.loggedIn).toBe(false);
      service.checkAuth().then((result) => {
        expect(notifications.error).toHaveBeenCalled();
        expect(console.error).toHaveBeenCalled();
        expect(result).toBe(false);
        expect(state.loggedIn).toBe(false);
      });
    })));
});
