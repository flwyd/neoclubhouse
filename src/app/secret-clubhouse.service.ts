import { Injectable } from '@angular/core';
import { Headers, Http, Request, RequestMethod, Response, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { environment } from '../environments/environment';

const conf = environment.secretClubhouse;

/** A request to a Secret Clubhouse API. */
export class ApiRequest {
  version = 'v0';

  static get(path: string, parameters = {}): ApiRequest {
    return new ApiRequest(RequestMethod.Get, path, parameters);
  }

  static post(path: string, parameters = {}, body: any = null,
      contentType = 'application/json'): ApiRequest {
    return new ApiRequest(RequestMethod.Post, path, parameters, body, contentType);
  }

  static put(path: string, parameters = {}, body: any = null,
      contentType = 'application/json'): ApiRequest {
    return new ApiRequest(RequestMethod.Put, path, parameters, body, contentType);
  }

  static patch(path: string, parameters = {}, body: any = null,
      contentType = 'application/json'): ApiRequest {
    return new ApiRequest(RequestMethod.Patch, path, parameters, body, contentType);
  }

  static delete(path: string, parameters = {}): ApiRequest {
    return new ApiRequest(RequestMethod.Delete, path, parameters);
  }

  constructor(
    public method: RequestMethod,
    public path: string,
    public parameters = {},
    public body: any = null,
    public contentType: string = null,
  ) { }
}

@Injectable()
export class SecretClubhouseService {
  authToken = ''; // TODO make private; figure out interaction with AuthService

  // TODO Get notified somehow when logout happens in the embed iframe

  constructor(
    private http: Http,
  ) { }

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
}
