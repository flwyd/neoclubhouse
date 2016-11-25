/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { HandleService } from './handle.service';

describe('HandleService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HandleService]
    });
  });

  it('should inject', inject([HandleService], (service: HandleService) => {
    expect(service).toBeTruthy();
  }));

  it('should return some handles', async(inject([HandleService], (service: HandleService) => {
    service.getHandles().then((handles) => {
      expect(handles).toEqual(jasmine.arrayContaining([
        jasmine.objectContaining({name: 'Alfa'}),
        jasmine.objectContaining({name: 'Zulu'})]));
    });
  })));
});
