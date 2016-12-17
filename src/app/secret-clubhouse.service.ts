import { Injectable } from '@angular/core';
import { Headers, Http, Request, RequestMethod, Response, URLSearchParams } from '@angular/http';
import { NotificationsService } from 'angular2-notifications';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { dmsUri } from './secret-clubhouse';
import { environment } from '../environments/environment';

const conf = environment.secretClubhouse;

export class AuthState {
  loggedIn: boolean = false;
  callsign: string = '';
  email: string = '';
}

/** A request to a Secret Clubhouse API. */
export class ApiRequest {
  version = 'v0';

  static get(path: string, parameters = {}): ApiRequest {
    return new ApiRequest(RequestMethod.Get, path, parameters);
  }

  static post(path: string, parameters = {}, body: any = undefined,
      contentType = 'application/json'): ApiRequest {
    return new ApiRequest(RequestMethod.Post, path, parameters);
  }

  static put(path: string, parameters = {}, body: any = undefined,
      contentType = 'application/json'): ApiRequest {
    return new ApiRequest(RequestMethod.Put, path, parameters, body);
  }

  static patch(path: string, parameters = {}, body: any = undefined,
      contentType = 'application/json'): ApiRequest {
    return new ApiRequest(RequestMethod.Patch, path, parameters, body);
  }

  static delete(path: string, parameters = {}): ApiRequest {
    return new ApiRequest(RequestMethod.Delete, path, parameters);
  }

  constructor(
    public method: RequestMethod,
    public path: string,
    public parameters = {},
    public body: any = undefined,
    public contentType: string = null,
  ) { }
}

@Injectable()
export class SecretClubhouseService {
  private authState = new BehaviorSubject(new AuthState());
  private authToken = '';
  private readonly authCheckUri = dmsUri('security', 'authJson');
  private polling = false;

  // TODO Get notified somehow when logout happens in the embed iframe

  constructor(
    private http: Http,
    private notifications: NotificationsService
  ) {
    setTimeout(() => this.checkAuth(), 0);
  }

  /** Dispatches a request to the Clubhouse API. */
  request(r: ApiRequest): Observable<Response> {
    let params = new URLSearchParams();
    for (let name of Object.keys(r.parameters)) {
      let value = r.parameters[name];
      switch (typeof value) {
        case 'string':
          params.set(name, value);
          break;
        case 'boolean':
        case 'number':
          params.set(name, String(value));
          break;
        case 'object':
          if (value && 'length' in value && typeof value.length === 'number') {
            for (let i = 0; i < value.length; ++i) {
              params.append(`${name}[]`, String(value[i]));
            }
          } else if (value) {
            // TODO convert objects to dotted notation (recursively?)
            throw `Don't know how to URL-encode object ${value} for ${name}`;
          }
          break; // ignore null
        case 'function':
          throw `Don't know how to URL-encode function ${value} for ${name}`;
        case 'undefined':
          break; // ignore
      }
    }
    let headers = new Headers();
    if (r.contentType) {
      headers.append('Content-Type', r.contentType);
    }
    if (this.authToken) {
      headers.append('X-Clubhouse-Token', this.authToken);
    }
    return this.http.request(new Request({
      method: r.method,
      headers: headers,
      url: `${conf.apiUri}/${r.version}/${r.path}`,
      search: params,
      body: r.body
    }));
    // TODO listen to response to get auth headers
  }

  getAuthState(): Observable<AuthState> { return this.authState; }

  checkAuth(): Promise<boolean> {
    return this.http.get(this.authCheckUri)
      .toPromise()
      .then((response) => {
        this.authToken = response.headers.get('X-Clubhouse-Token');
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
