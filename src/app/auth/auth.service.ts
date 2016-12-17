import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import { environment } from '../../environments/environment';
import { AuthState } from './auth-state';
import { ApiRequest, SecretClubhouseService } from '../secret-clubhouse.service';

import 'rxjs/add/operator/filter';

/**
 * Service managing authentication and authorization state for the user and session.
 */
@Injectable()
export class AuthService {
  private state = new BehaviorSubject(AuthState.unknown());
  private authCheckPending = false;
  private polling = false;

  constructor(
    private clubhouse: SecretClubhouseService,
  ) { }

  /**
   * Observes the authentication state.  The initial state is "unknown"; subscribers which
   * only want true/false logged in state should use {@code getKnownAuthState()}.
   */
  getAuthState(): Observable<AuthState> {
    if (!this.state.getValue().stateKnown) {
      setTimeout(() => this.checkAuth());
    }
    return this.state;
  }

  /** Observes the authentication state with unknown states filtered out. */
  getKnownAuthState(): Observable<AuthState> {
    return this.getAuthState().filter((state) => state.stateKnown);
  }

  checkAuth(): void {
    if (this.authCheckPending) {
      return;
    }
    this.authCheckPending = true;
    this.clubhouse.request(ApiRequest.post('auth/check'))
      .subscribe((response) => {
        this.clubhouse.authToken = response.headers.get('X-Clubhouse-Token');
        let data = response.json().auth;
        if (data.loggedIn) {
          this.state.next(AuthState.user(data.email, data.callsign));
          // console.debug('Logged in as', this.state.value);
        } else {
          this.state.next(AuthState.anonymous());
          // console.debug('Not currently logged in');
        }
      }, (error) => {
        this.state.next(AuthState.anonymous());
        // console.debug('Not currently logged in', error);
        this.authCheckPending = false;
      }, () => this.authCheckPending = false);
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
