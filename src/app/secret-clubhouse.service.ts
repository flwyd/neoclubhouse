import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { NotificationsService } from 'angular2-notifications';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { dmsUri } from './secret-clubhouse';
import { environment } from '../environments/environment';

export class AuthState {
  loggedIn: boolean = false;
  callsign: string = '';
  email: string = '';
}

@Injectable()
export class SecretClubhouseService {
  private authState = new BehaviorSubject(new AuthState());

  private readonly authCheckUri = dmsUri('security', 'authJson');
  private polling = false;

  // TODO Get notified somehow when logout happens in the embed iframe

  constructor(
    private http: Http,
    private notifications: NotificationsService
  ) {
    setTimeout(() => this.checkAuth(), 0);
  }

  getAuthState(): Observable<AuthState> { return this.authState; }

  checkAuth(): Promise<boolean> {
    return this.http.get(this.authCheckUri)
      .toPromise()
      .then((response) => {
        let state = response.json().data as AuthState || new AuthState();
        this.authState.next(state);
        return state.loggedIn;
      }).catch((err) => {
        console.error(`Error checking auth state from ${this.authCheckUri}: ${err}`);
        this.notifications.error('Error checking login state', `${err.name}: ${err.message}`,
          { id: 'login-check-error', timeOut: Math.max(10000, this.authCheckInterval / 5) });
        return false;
      });
  }

  /**
   * Periodically polls for auth state.  This method is idempotent: multiple calls won't set up
   * multiple polling intervals.
   */
  checkAuthPeriodically(): void {
    if (!this.polling && this.authCheckInterval > 0) {
      this.polling = true;
      setInterval(() => this.checkAuth(), this.authCheckInterval);
    }
  }

  private get authCheckInterval() { return environment.secretClubhouse.authCheckFrequencyMs; }
}
