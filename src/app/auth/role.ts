/** Represents a Clubhouse role to control access and data display. */
export class Role {
  private static mapping: {[name: string]: Role} = {};

  /**
   * Administrator; access to most functionality.  When a more specific role exists, check that;
   * for instance, the API knows that ADMIN implies GRANT_POSITION.
   */
  static ADMIN = new Role('ROLE_ADMIN');
  /** Can set roles for users. */
  static GRANT_POSITION = new Role('ROLE_GRANT_POSITION');
  /** Can view other users and do a wide variety of tasks.  HQ Window users have this role. */
  static MANAGE = new Role('ROLE_MANAGE');
  /** Mentor Cadre; access to alpha and mentoring tools. */
  static MENTOR = new Role('ROLE_MENTOR');
  /** Trainer; access to reports and tools for trainings. */
  static TRAINER = new Role('ROLE_TRAINER');
  /** All users have this role; basically equivalent to "is signed in." */
  static USER = new Role('ROLE_USER');
  /** Volunteer coordinator; access to new volunteer intake tools and others. */
  static VC = new Role('ROLE_VC');
  /** Allowed to see other users' email addresses. */
  static VIEW_EMAIL = new Role('ROLE_VIEW_EMAIL');
  /** Allowed to see other users' personal information like home address. */
  static VIEW_PII = new Role('ROLE_VIEW_PII');

  static lookup(role: string | Role): Role | undefined {
    return role instanceof Role ? role : Role.mapping[role];
  }

  constructor(
    readonly name: string, // Matches the value returned by the Clubhouse auth API.
  ) {
    Role.mapping[name] = this;
  }

  toString(): string { return this.name; }
}
