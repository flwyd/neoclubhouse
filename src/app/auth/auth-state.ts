import { Role } from './role';

/** Authentication state for the current session. */
export class AuthState {
  static unknown() {
    return new AuthState(undefined, '', '');
  }
  static anonymous(): AuthState {
    return new AuthState(false, '', '');
  }

  static user(email: string, callsign: string, roles: Role[] = []): AuthState {
    if (!email || !callsign) {
      throw new Error(`Expected user, got email: ${email}, callsign: ${callsign}`);
    }
    return new AuthState(true, email, callsign, roles);
  }

  private constructor(
    /** authenticated === undefined means auth state isn't yet known */
    readonly authenticated: boolean | undefined,
    readonly email: string,
    readonly callsign: string,
    readonly roles: Role[] = [],
  ) { }

  get loggedIn(): boolean { return this.authenticated === true; }

  get stateKnown(): boolean { return this.authenticated !== undefined; }

  hasRole(role: Role): boolean { return this.roles.some((r) => r.name === role.name); }

  toString(): string {
    switch (this.authenticated) {
      case undefined:
        return 'unknown authentication state';
      case false:
        return 'not signed in';
      case true:
        return `signed in as ${this.callsign} / ${this.email} with roles ${this.roles.join(', ')}`;
    }
  }
}
