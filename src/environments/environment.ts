// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `angular-cli.json`.

export const environment = {
  production: false,
  secretClubhouse: {
    /**
     * Base URI path for Secret Clubhouse "duty management system" requests;
     * ?DMSc=foo&DMSm=bar will be appended.  In development and test
     * environments, this is a non-root path to allow webpack to map it to a
     * local backend.  For instance, if you're running Clubhouse PHP on port
     * 8080, create a local-config/proxy.conf.json file with the contents
     * @example
     * [
     *   {
     *     "context": ["**\/*.php", "/standard/**", "/custom/**"],
     *     "target": "http://localhost:8080",
     *     "secure": false
     *   }
     * ]
     *
     * And run `ng serve --proxy-config local-config/proxy.conf.json`
     */
    dmsUri: '/index.php',
  },
};
