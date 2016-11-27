import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { HandleCheckerComponent } from './handle-checker/handle-checker.component';
import { ALL_HANDLE_RULES } from './handle-rule';
import { MinLengthRule, FccRule, SubstringRule } from './handle-rules';
import { HandleService } from './handle.service';

@NgModule({
  declarations: [
    AppComponent,
    HandleCheckerComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AppRoutingModule
  ],
  providers: [
    HandleService,
    // TODO extract a HandleCheckerModule
    MinLengthRule, FccRule, SubstringRule,
    {
      provide: ALL_HANDLE_RULES,
      deps: [MinLengthRule, FccRule, SubstringRule],
      useFactory: (letters, fcc, substring) => [letters, fcc, substring]
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
