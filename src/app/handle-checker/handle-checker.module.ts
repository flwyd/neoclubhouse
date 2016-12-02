import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';

import { HandleCheckerComponent } from './handle-checker.component';
import { ALL_HANDLE_RULES } from './handle-rule';
import { RULE_CLASSES, allRulesFactory } from './handle-rules';
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
    ...RULE_CLASSES,
    {
      provide: ALL_HANDLE_RULES,
      deps: RULE_CLASSES,
      useFactory: allRulesFactory,
    },
  ],
})
export class HandleCheckerModule { }
