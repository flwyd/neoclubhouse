import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { HandleCheckerComponent } from './handle-checker/handle-checker.component';
import { HandleService } from './handle.service';

@NgModule({
  declarations: [
    AppComponent,
    HandleCheckerComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AppRoutingModule
  ],
  providers: [
    HandleService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
