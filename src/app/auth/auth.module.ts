import { NgModule } from '@angular/core';

import { AuthService } from './auth.service';
import { AuthenticatedGuard } from './authenticated-guard';
import { HasRoleGuard } from './has-role-guard';

/**
 * Module configuring authentication/authorization services.
 * @see https://angular.io/docs/ts/latest/guide/dependency-injection.html
 */
@NgModule({
  imports: [
  ],
  providers: [
    AuthService,
    AuthenticatedGuard,
    HasRoleGuard,
  ]
})
export class AuthModule { }
