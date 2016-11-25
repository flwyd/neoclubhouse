import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HandleCheckerComponent } from './handle-checker/handle-checker.component';

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
