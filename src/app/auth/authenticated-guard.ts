import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { AuthService } from './auth.service';

import 'rxjs/add/operator/map';

/**
 * Guard requiring a user be authenticated before they can use a component.
 * @see https://angular.io/docs/ts/latest/guide/router.html#!#guards
 */
@Injectable()
export class AuthenticatedGuard implements CanActivate, CanActivateChild {
  constructor(
    private auth: AuthService,
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.auth.getKnownAuthState().map((auth) => auth.loggedIn);
    // TODO this.router.navigate(['/login']) if not logged in
  }

  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.canActivate(childRoute, state);
  }
}
