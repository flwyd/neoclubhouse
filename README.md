# Black Rock Ranger Neoclubhouse

This is (currently a proof of concept of) a modern web app to replace the aging Ranger Secret Clubhouse.  In addition to serving the year-round operational needs of the Black Rock Rangers, it aims to adhere to quality design and modern coding practices so that it's easy for volunteers to add or change functionality without a slow deterioration of the code base.

If you'd like to contribute to Neoclubhouse, fork this repository, push changes, and open a pull request.  But first talk with ranger-tech-cadre@burningman.org about your plans.  _Please add unit tests for your code and use JSDoc comments on classes and important functions._  Run `ng lint` before `git commit`.

# Notes on Angular

If you're unfamiliar with Angular, check out [angular.io](https://angular.io/), read the Quickstart guide, and take the [Tour of Heroes](https://angular.io/docs/ts/latest/tutorial/).  We use Angular 2 which is significantly different than Angular 1.

This project also uses [TypeScript](https://www.typescriptlang.org/), which to a first approximation is JavaScript (ES6) with optional type annotations.  Please use type declarations widely: an error from `ng build` is much easier to deal with than a runtime error like `undefined is not a function`.  Plus, IDEs can use type information to make your development experience much nicer.  [Visual Studio Code](https://code.visualstudio.com/) is a popular choice for editing TypeScript; editors like Vim also have [plugins available](https://github.com/Quramy/tsuquyomi).

This project was generated with [angular-cli](https://github.com/angular/angular-cli) version 1.0.0-beta.20-4.

To get started hacking, [install NodeJS](https://nodejs.org/en/download/) and
run `npm install -g angular-cli`.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

### One-time setup
`mkdir local-config` This directory is in .gitignore, so you can put anything you want there that’s specific to your local development environment.

To integrate with the Secret Clubhouse for XHRs (suppose it’s running in Apache on port 8080), create a file `local-config/proxy.conf.json` with content
```json
[
  {
    "context": ["**/*.php", "/standard/**", "/custom/**"],
    "target": "http://localhost:8080",
    "secure": false
  }
]
```
then run `ng serve --proxy-config local-config/local.conf.json` and requests destined for Secret Clubhouse URLs will be forwarded from webpack to Apache.

## Code scaffolding

Run `ng generate component component-name` to generate a new component with a module for dependency injection. You can also use `ng generate directive/pipe/service/class/module`.  When adding a new view, be sure to edit `app-routing.module.ts`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod --base-href=/app/` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).  This starts a browser and will rerun all tests whenever you save a file (slick!).  To close the browser after the first run, specify `--single-run`.

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).
Before running the tests make sure you are serving the app via `ng serve`.

## Further help

To get more help on the `angular-cli` use `ng help` or go check out the [Angular-CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
