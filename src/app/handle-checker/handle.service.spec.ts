/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { HandleService } from './handle.service';
import { BaseRequestOptions, Http, Response, ResponseOptions } from '@angular/http';
import { MockBackend } from '@angular/http/testing';

describe('HandleService', () => {
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
        HandleService
      ],
    });
  });

  it('should inject', inject([HandleService], (service: HandleService) => {
    expect(service).toBeTruthy();
  }));

  it('should return some handles', async(inject([HandleService, MockBackend], (service: HandleService, backend: MockBackend) => {
    backend.connections.subscribe((c) => {
      if (c.request.url.match(/DMSc=security&DMSm=listReservedEntities/)) {
        let response = new Response(new ResponseOptions({
          body: JSON.stringify([
            {name: 'Danger', type: 'vintage ranger'},
            {name: 'Zebra', type: 'reserved'},
          ])
        }));
        c.mockRespond(response);
      }
    });
    service.getHandles().then((handles) => {
      expect(handles).toEqual(jasmine.arrayContaining([
        jasmine.objectContaining({name: 'Alfa'}),
        jasmine.objectContaining({name: 'Zulu'}),
        jasmine.objectContaining({name: 'Danger'}),
        jasmine.objectContaining({name: 'Zebra'}),
      ]));
    });
  })));
});
