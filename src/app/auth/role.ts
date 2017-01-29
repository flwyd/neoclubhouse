/** Represents a Clubhouse role to control access and data display. */
export class Role {
  private static mapping: {[name: string]: Role} = {};

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


export const RoleNames = {
  ADMIN: 'ROLE_ADMIN',
  GRANT_POSITION: 'ROLE_GRANT_POSITION',
  MANAGE: 'ROLE_MANAGE',
  MENTOR: 'ROLE_MENTOR',
  TRAINER: 'ROLE_TRAINER',
  USER: 'ROLE_USER',
  VC: 'ROLE_VC',
  VIEW_EMAIL: 'ROLE_VIEW_EMAIL',
  VIEW_PII: 'ROLE_VIEW_PII',
};

export const Roles = {
/**
 * Administrator, access to most functionality.  When a more specific role exists, check that;
 * for instance, the API knows that ADMIN implies GRANT_POSITION.
 */
  ADMIN: new Role(RoleNames.ADMIN),
/** Can set roles for users. */
  GRANT_POSITION: new Role(RoleNames.GRANT_POSITION),
/** Can view other users and do a wide variety of tasks.  HQ Window users have this role. */
  MANAGE: new Role(RoleNames.MANAGE),
/** Mentor Cadre, access to alpha and mentoring tools. */
  MENTOR: new Role(RoleNames.MENTOR),
/** Trainer, access to reports and tools for trainings. */
  TRAINER: new Role(RoleNames.TRAINER),
/** All users have this role, basically equivalent to "is signed in." */
  USER: new Role(RoleNames.USER),
/** Volunteer coordinator, access to new volunteer intake tools and others. */
  VC: new Role(RoleNames.VC),
/** Allowed to see other users' email addresses. */
  VIEW_EMAIL: new Role(RoleNames.VIEW_EMAIL),
/** Allowed to see other users' personal information like home address. */
  VIEW_PII: new Role(RoleNames.VIEW_PII),
};
