/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { HandleService } from './handle.service';
import { SecretClubhouseService } from '../secret-clubhouse.service';
import { BaseRequestOptions, Http, Response, ResponseOptions } from '@angular/http';
import { MockBackend } from '@angular/http/testing';
import { NotificationsService, SimpleNotificationsModule } from 'angular2-notifications';

/**
 * Jasmine unit tests for {@link HandleService}.  Provides a mock HTTP backend.
 * Tests for code which consumes the HandleService should generally provide a MockHandleService
 * rather than a mock HTTP backend for the real one.
 */
describe('HandleService', () => {
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
        HandleService
      ],
    });
  });

  it('should inject', inject([HandleService], (service: HandleService) => {
    expect(service).toBeTruthy();
  }));

  it('should return some handles', async(inject([HandleService, MockBackend], (service: HandleService, backend: MockBackend) => {
    backend.connections.subscribe((c) => {
      if (c.request.url.match(/api\/v0\/handles/)) {
        let response = new Response(new ResponseOptions({
          body: JSON.stringify({data: [
            { name: 'Danger', type: 'vintage ranger' },
            { name: 'Zebra', type: 'reserved' },
          ]})
        }));
        c.mockRespond(response);
      }
    });
    service.getHandles().then((handles) => {
      expect(handles).toEqual(jasmine.arrayContaining([
        jasmine.objectContaining({ name: 'Alfa' }),
        jasmine.objectContaining({ name: 'Zulu' }),
        jasmine.objectContaining({ name: 'Danger' }),
        jasmine.objectContaining({ name: 'Zebra' }),
      ]));
    });
  })));

  it('should notify on errors', async(inject([HandleService, MockBackend, NotificationsService],
    (service: HandleService, backend: MockBackend, notificationsService: NotificationsService) => {
      spyOn(console, 'error');
      let notifications = [];
      notificationsService.getChangeEmitter().subscribe({
        next: (notevt) => notifications.push(notevt)
      });
      backend.connections.subscribe((c) => {
        if (c.request.url.match(/DMSc=security&DMSm=listReservedEntities/)) {
          c.mockError(new Error('Some error'));
        }
      });
      service.getHandles().then((handles) => {
        expect(notifications.length).toBeGreaterThan(0, 'No notifications published');
        let titles = notifications.map((evt) => evt.notification.title);
        expect(titles).toMatch('Error loading handles');
        expect(titles).toMatch('No Rangers loaded');
        expect(console.error).toHaveBeenCalled();
      });
    }
  )));

  it('should warn on absence of Ranger handles', async(inject([HandleService, MockBackend, NotificationsService],
    (service: HandleService, backend: MockBackend, notificationsService: NotificationsService) => {
      let notifications = [];
      notificationsService.getChangeEmitter().subscribe({
        next: (notevt) => notifications.push(notevt)
      });
      backend.connections.subscribe((c) => {
        if (c.request.url.match(/api\/v0\/handles/)) {
          let response = new Response(new ResponseOptions({
            body: JSON.stringify({data: [
              { name: 'Berlin', type: 'reserved' },
              { name: 'Tokyo', type: 'reserved' },
            ]})
          }));
          c.mockRespond(response);
        }
      });
      service.getHandles().then((handles) => {
        expect(notifications.length).toBe(1, `Got ${JSON.stringify(notifications)} instead`);
        let titles = notifications.map((evt) => evt.notification.title);
        expect(titles).toMatch('No Rangers loaded');
      });
    }
  )));

  it('should not warn on if Rangers provided', async(inject([HandleService, MockBackend, NotificationsService],
    (service: HandleService, backend: MockBackend, notificationsService: NotificationsService) => {
      let notifications = [];
      notificationsService.getChangeEmitter().subscribe({
        next: (notevt) => notifications.push(notevt)
      });
      backend.connections.subscribe((c) => {
        if (c.request.url.match(/api\/v0\/handles/)) {
          let response = new Response(new ResponseOptions({
            body: JSON.stringify({data: [
              { name: 'Berlin', type: 'reserved' },
              { name: 'Tokyo', type: 'reserved' },
              { name: 'Dusty', type: 'vintage ranger' },
            ]})
          }));
          c.mockRespond(response);
        }
      });
      service.getHandles().then((handles) => {
        expect(notifications.length).toBe(0, `Got ${JSON.stringify(notifications)} instead`);
      });
    }
  )));
});
