import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, CanLoad, Route, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { AuthService } from './auth.service';
import { Role } from './role';

import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';

/**
 * Guard requiring a user have one of a set of Roles in order to access a route.
 * To use this guard, set data.allowedRoles to an array of roles, any of which grant access.
 * canActivate, canActivateChild, and canLoad are all supported.
 * @example
 * {
 *   path: 'training',
 *   component: TrainingComponent,
 *   canActivate: [HasRoleGuard],
 *   data: { allowedRoles: [RoleNames.MENTOR, RoleNames.TRAINER] }
 *  }
 * @see https://angular.io/docs/ts/latest/guide/router.html#!#guards
 */
@Injectable()
export class HasRoleGuard implements CanActivate, CanActivateChild, CanLoad {
  constructor(
    private auth: AuthService,
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.checkRoles(route.data['allowedRoles'], state.url);
  }

  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.canActivate(childRoute, state);
  }

  canLoad(route: Route): Observable<boolean> {
    return this.checkRoles(route.data['allowedRoles'], `/${route.path}`);
  }

  private checkRoles(roles: Array<Role | string>, url: string): Observable<boolean> {
    if (!roles || roles.length === 0) {
      console.warn(`Route data.allowedRoles is empty for ${url}; assuming allowed`);
      return Observable.of(true);
    }
    let mapped = roles.map((r) => {
      let role = Role.lookup(r);
      if (role === undefined) {
        console.warn(`Unknown role ${r}`);
      }
      return role;
    }).filter((r) => r !== undefined);
    return this.auth.getKnownAuthState().map((auth) => mapped.some((r) => auth.hasRole(r)));
    // TODO show a dialog if not allowed
  }
}
