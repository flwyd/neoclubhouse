import { Injectable } from '@angular/core';
import { NotificationsService } from 'angular2-notifications';

import { PHONETIC_ALPHABET } from './static-handles';
import { Handle } from './handle';
import { ApiRequest, SecretClubhouseService } from '../secret-clubhouse.service';

import 'rxjs/add/operator/toPromise';

/**
 * Service for loading Ranger callsigns and other reserved handles and radio jargon.
 */
@Injectable()
export class HandleService {
  // TODO switch to observable
  private allHandles: Promise<Handle[]>;

  constructor(
    private clubhouse: SecretClubhouseService,
    private notifications: NotificationsService
  ) { }

  getHandles(): Promise<Handle[]> {
    if (!this.allHandles) {
      this.allHandles = Promise.all([
        this.fetchHandles(),
        Promise.resolve(PHONETIC_ALPHABET)
      ]).then((results: Handle[][]) => {
        let handles: Handle[] = [].concat(...results).sort(Handle.comparator);
        if (!handles.some((h) => h.type.match(/ranger/i) !== null)) {
          this.notifications.alert('No Rangers loaded',
            `No Ranger handles were found.  Make sure you're logged in to the Secret Clubhouse.`);
        }
        return handles;
      });
    }
    return this.allHandles;
  };

  private fetchHandles(): Promise<Handle[]> {
    return this.clubhouse.request(ApiRequest.get('handles'))
      .toPromise()
      .then((response) => response.json().data as Handle[])
      .catch((err) => {
        if (err) {
          console.error(`Error loading handles: ${err}`);
          if (err instanceof Error) {
            this.notifications.error('Error loading handles', `${err.name}: ${err.message}`);
          } else if (err.json) {
            this.notifications.error('Error loading handles', err.json().error.message);
          } else {
            this.notifications.error('Error loading handles', err);
          }
        } else {
          console.error('Unknown error loading handles');
          this.notifications.error('Error loading handles', 'Unfortunately, we don\'t know why');
        }
        return [];
      });
  }
}
