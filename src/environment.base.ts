/**
 * Container for values which can be overridden in different build or test environments.
 * This class is also a good place for "global variables" that you don't expect to override.
 * To override a value, include the property in environments/environment.ts (dev/test) and/or
 * environments/environment.prod.ts (production).  To create a new environment, see angular-cli.json
 *
 * Overrides support partial objects:
 * @example
 * export const environment = new Environment({
 *   secretClubhouse: {
 *     someProp: 42
 *   }
 * });
 * // environment.secretClubhouse.dmsUri is still defined.
 */
export class Environment {
  production = false;

  /**
   * Configuration for integrating with the Secret Clubhouse.
   * If you're running Clubhouse PHP on port 8080, create a local-config/proxy.conf.json file with
   * the contents
   * @example
   * [
   *   {
   *     "context": ["/api/**"],
   *     "target": "http://localhost:8080",
   *     "secure": false
   *   },
   *   {
   *     "context": ["**\/*.php", "/standard/**", "/custom/**"],
   *     "target": "http://localhost:8080",
   *     "secure": false
   *   }
   * ]
   *
   * And run `ng serve --proxy-config local-config/proxy.conf.json`
   * (Remove the \ from \/, it's needed to prevent the comment from closing.)
   */
  secretClubhouse = {
    /**
     * Base URI path for Secret Clubhouse "duty management system" requests;
     * ?DMSc=foo&DMSm=bar will be appended.
     * @type {string}
     */
    dmsUri: '/index.php',

    /**
     * Base URI path for Secret Clubhouse API methods.  The API version (e.g. /v0) will be appended.
     * @type {string}
     */
    apiUri: '/api',

    /**
    * Number of milliseconds betwen checks of authentication state.
    * If this is less than or equal to zero, login state won't be polled.
    * @type {string}
    */
    authCheckFrequencyMs: 5 * 60 * 1000,
  };

  constructor(overrides = {}) {
    this.applyOverrides(this, overrides);
  }

  protected applyOverrides(subject, overrides) {
    for (let key of Object.keys(overrides)) {
      let val = overrides[key];
      if (typeof val === 'object' && typeof subject[key] === 'object') {
        this.applyOverrides(subject[key], val);
      } else {
        subject[key] = val;
      }
    }
  }
};
