/* tslint:disable:no-unused-variable */

import { TestBed, async, fakeAsync, inject, tick } from '@angular/core/testing';
import { BaseRequestOptions, Headers, Http, Response, ResponseOptions } from '@angular/http';
import { MockBackend } from '@angular/http/testing';

import { AuthState } from './auth-state';
import { AuthService } from './auth.service';
import { Role } from './role';
import { SecretClubhouseService } from '../secret-clubhouse.service';

function mockResponse(backend: MockBackend, result: any): void {
  backend.connections.subscribe((c) => {
    if (c.request.url.match(/\/v0\/auth\/check/)) {
      let headers = new Headers();
      if (result.auth && result.auth.loggedIn) {
        headers.append('X-Clubhouse-Token', 'TestToken');
      }
      let response = new Response(new ResponseOptions({
        body: JSON.stringify(result),
        headers: headers,
      }));
      c.mockRespond(response);
    }
  });
}

describe('AuthService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
      ],
      providers: [
        AuthService,
        SecretClubhouseService,
        BaseRequestOptions,
        MockBackend,
        {
          provide: Http,
          deps: [MockBackend, BaseRequestOptions],
          useFactory: (backend, options) => new Http(backend, options)
        },
      ]

    });
  });

  it('should inject', inject([AuthService], (service: AuthService) => {
    expect(service).toBeTruthy();
  }));

  it('should report a user is not logged in', fakeAsync(inject([AuthService, MockBackend],
      (service: AuthService, backend: MockBackend) => {
    expect(service).toBeTruthy();
    mockResponse(backend, { auth: { loggedIn: false } });
    let state: AuthState = null;
    service.getAuthState().subscribe({
      next: (val) => state = val
    });
    expect(state.stateKnown).toBe(false, 'state was prematurely known');
    expect(state.loggedIn).toBe(false, 'state was prematurely logged in');
    tick();
    expect(state.stateKnown).toBe(true, 'state was unknown');
    expect(state.loggedIn).toBe(false, 'user was logged in');
  })));

  it('should report a user is logged in', fakeAsync(inject([AuthService, MockBackend],
      (service: AuthService, backend: MockBackend) => {
    expect(service).toBeTruthy();
    mockResponse(backend, {
      auth: {
        loggedIn: true, callsign: 'Danger', email: 'danger@example.com',
        roles: ['ROLE_MENTOR', 'ROLE_TRAINER']
      }
    });
    let state: AuthState = null;
    service.getAuthState().subscribe({
      next: (val) => state = val
    });
    expect(state.stateKnown).toBe(false, 'state was prematurely known');
    expect(state.loggedIn).toBe(false, 'state was prematurely logged in');
    tick();
    expect(state.stateKnown).toBe(true, 'state was unknown');
    expect(state.loggedIn).toBe(true, 'user was logged out');
    expect(state.callsign).toBe('Danger');
    expect(state.email).toBe('danger@example.com');
    expect(state.hasRole(Role.MENTOR)).toBe(true);
    expect(state.hasRole(Role.TRAINER)).toBe(true);
  })));
});
