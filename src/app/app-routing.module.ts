import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HandleCheckerComponent } from './handle-checker/handle-checker.component';

/**
 * Routing definitions for the app.  When building a new view, add the component here.
 * Paths are relative to the base href defined at build time: a 'dance-party' path will be
 * automatically available at /app/dance-party after `ng build --prod --base-href=/app/`
 * @see https://angular.io/docs/ts/latest/guide/router.html
 */
const routes: Routes = [
  { path: '', children: [] },
  { path: 'handle-checker', component: HandleCheckerComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule { }
