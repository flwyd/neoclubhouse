import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { SimpleNotificationsModule } from 'angular2-notifications';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { AuthModule } from './auth/auth.module';
import { SecretClubhouseService } from './secret-clubhouse.service';
import { HandleCheckerModule } from './handle-checker/handle-checker.module';
import { ClubhouseEmbedModule } from './clubhouse-embed/clubhouse-embed.module';

/**
 * Module configuring the Neoclubhouse app.  This class configures dependency injection globally.
 * It's an appropriate place to provide widely-used values; values which are only relevant to a
 * particular view or component should be placed in their own module which is added to AppModule's
 * imports.
 * @see https://angular.io/docs/ts/latest/guide/dependency-injection.html
 * @see https://angular.io/docs/ts/latest/guide/appmodule.html
 */
@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    AuthModule,
    BrowserModule,
    ClubhouseEmbedModule,
    HttpModule,
    HandleCheckerModule,
    SimpleNotificationsModule,
    AppRoutingModule
  ],
  providers: [
    SecretClubhouseService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
