/* tslint:disable:no-unused-variable */

import { fakeAsync, inject, TestBed } from '@angular/core/testing';
import { BaseRequestOptions, Headers, Http, Request, RequestMethod, Response, ResponseOptions } from '@angular/http';
import { MockBackend } from '@angular/http/testing';

import { ApiRequest, SecretClubhouseService } from './secret-clubhouse.service';
import { NotificationsService, SimpleNotificationsModule } from 'angular2-notifications';

describe('SecretClubhouseService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
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

  it('should inject', inject([SecretClubhouseService], (service: SecretClubhouseService) => {
    expect(service).toBeTruthy();
  }));

  it('should perform GET requests', fakeAsync(inject([SecretClubhouseService, MockBackend],
      (service: SecretClubhouseService, backend: MockBackend) => {
    let capturedRequest: Request;
    let mockResponse: Response;
    backend.connections.subscribe((c) => {
      capturedRequest = c.request;
      c.mockRespond(mockResponse);
    });
    mockResponse = new Response(new ResponseOptions({
      status: 200,
      body: JSON.stringify({id: 1})
    }));
    service.request(ApiRequest.get('foo/1'))
      .subscribe((response) => {
        expect(capturedRequest).toBeTruthy();
        expect(capturedRequest.method).toBe(RequestMethod.Get);
        expect(capturedRequest.url).toBe('/api/v0/foo/1');
        expect(response.status).toBe(200);
        expect(response.json().id).toBe(1);
      });
    mockResponse = new Response(new ResponseOptions({
      status: 400,
      body: JSON.stringify({message: 'whiskey tango foxtrot'}),
    }));
    service.request(ApiRequest.get('foo/bar'))
      .subscribe((response) => {
        expect(capturedRequest).toBeTruthy();
        expect(capturedRequest.method).toBe(RequestMethod.Get);
        expect(capturedRequest.url).toBe('/api/v0/foo/bar');
        expect(response.status).toBe(400);
        expect(response.json().message).toBe('whiskey tango foxtrot');
      });
  })));

  it('should perform POST requests', fakeAsync(inject([SecretClubhouseService, MockBackend],
      (service: SecretClubhouseService, backend: MockBackend) => {
    let capturedRequest: Request;
    let mockResponse: Response;
    backend.connections.subscribe((c) => {
      capturedRequest = c.request;
      c.mockRespond(mockResponse);
    });
    mockResponse = new Response(new ResponseOptions({
      status: 200,
      body: JSON.stringify({id: 1, name: 'new value'})
    }));
    service.request(ApiRequest.post('foo', {}, {name: 'value'}))
      .subscribe((response) => {
        expect(capturedRequest).toBeTruthy();
        expect(capturedRequest.method).toBe(RequestMethod.Post);
        expect(capturedRequest.url).toBe('/api/v0/foo');
        expect(capturedRequest.headers.get('Content-Type')).toBe('application/json');
        expect(capturedRequest.json().name).toBe('value');
        expect(response.status).toBe(200);
        expect(response.json().id).toBe(1);
        expect(response.json().name).toBe('new value');
      });
    mockResponse = new Response(new ResponseOptions({
      status: 400,
      body: JSON.stringify({message: 'whiskey tango foxtrot'}),
    }));
    service.request(ApiRequest.post('foo/1'))
      .subscribe((response) => {
        expect(capturedRequest).toBeTruthy();
        expect(capturedRequest.method).toBe(RequestMethod.Post);
        expect(capturedRequest.url).toBe('/api/v0/foo/1');
        expect(response.status).toBe(400);
        expect(response.json().message).toBe('whiskey tango foxtrot');
      });
  })));

  it('should pass parameters', fakeAsync(inject([SecretClubhouseService, MockBackend],
      (service: SecretClubhouseService, backend: MockBackend) => {
    let capturedRequest: Request;
    let mockResponse: Response;
    backend.connections.subscribe((c) => {
      capturedRequest = c.request;
      c.mockRespond(mockResponse);
    });
    mockResponse = new Response(new ResponseOptions({
      status: 200,
      body: JSON.stringify({id: 1})
    }));
  service.request(ApiRequest.post('foo/1', {year: 1999, select: 'stuff'}))
      .subscribe((response) => {
        expect(capturedRequest).toBeTruthy();
        expect(capturedRequest.method).toBe(RequestMethod.Post);
        expect(capturedRequest.url).toBe('/api/v0/foo/1?year=1999&select=stuff');
        expect(response.status).toBe(200);
        expect(response.json().id).toBe(1);
      });
    service.request(ApiRequest.get('bar',
        {game: 'AD&D', missing: null, year: [2016, 2017]/*, obj: {a: 1, b: 'x=y'}*/}))
      .subscribe((response) => {
        expect(capturedRequest).toBeTruthy();
        expect(capturedRequest.method).toBe(RequestMethod.Get);
        expect(capturedRequest.url)
          .toBe('/api/v0/bar?game=AD%26D&year%5B%5D=2016&year%5B%5D=2017');
          // .toBe('/api/v0/bar?game=AD%26D&year%5B%5D=2016&year%5B%5D=2017&obj.a=1&obj.b=x%3Dy');
        expect(response.status).toBe(200);
        expect(response.json().id).toBe(1);
      });
  })));
});
