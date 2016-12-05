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
  private readonly authCheckInterval = environment.secretClubhouse.authCheckFrequencyMs;

  // TODO Get notified somehow when logout happens in the embed iframe

  constructor(
    private http: Http,
    private notifications: NotificationsService
  ) {
    setTimeout(() => this.checkAuth(), 0);
    setInterval(() => this.checkAuth(), this.authCheckInterval);
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
          { id: 'login-check-error', timeOut: this.authCheckInterval / 5 });
        return false;
      });
  }
}
