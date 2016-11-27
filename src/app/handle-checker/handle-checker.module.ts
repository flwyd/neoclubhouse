import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';

import { HandleCheckerComponent } from './handle-checker.component';
import { ALL_HANDLE_RULES } from './handle-rule';
import { MinLengthRule, FccRule, SubstringRule } from './handle-rules';
import { HandleService } from './handle.service';

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    FormsModule,
    HttpModule,
  ],
  declarations: [
    HandleCheckerComponent,
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
})
export class HandleCheckerModule { }
