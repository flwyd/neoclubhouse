import { Injectable } from '@angular/core';

import { HANDLES } from './mock-handles';
import { Handle } from './handle';

@Injectable()
export class HandleService {

  constructor() { }

  getHandles(): Promise<Handle[]> {
    // TODO switch to observable
    return Promise.resolve(HANDLES);
  };
}
