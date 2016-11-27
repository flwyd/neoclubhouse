import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { PHONETIC_ALPHABET } from './static-handles';
import { Handle } from './handle';

import 'rxjs/add/operator/toPromise';

@Injectable()
export class HandleService {
  // TODO Map /api/ in secretclubhouse.  The /rangeroffice only works for Stonebeard's proxy setup.
  private readonly handlesUrl = '/rangeroffice/?DMSc=security&DMSm=listReservedEntities';
  // TODO switch to observable
  private allHandles: Promise<Handle[]>;

  constructor(private http: Http) { }

  getHandles(): Promise<Handle[]> {
    if (!this.allHandles) {
      this.allHandles = Promise.all([
        this.fetchHandles(),
        Promise.resolve(PHONETIC_ALPHABET)
      ]).then((results) => Array.prototype.concat.apply([], results).sort(Handle.comparator));
    }
    return this.allHandles;
  };

  private fetchHandles(): Promise<Handle[]> {
    return this.http.get(this.handlesUrl)
      .toPromise()
      .then((response) => response.json() as Handle[])
      .catch((e) => {
        console.warn(`Error loading handles from ${this.handlesUrl}: ${e}`);
        return [];
      });
  }
}
