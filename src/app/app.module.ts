import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SearchComponent } from './search/search.component';
import { ReportComponent } from './report/report.component'; // 1. IMPORT YOUR REPORT COMPONENT (Adjust path if it's inside a folder, e.g., './report/report.component')

@NgModule({
  declarations: [
    AppComponent,
    SearchComponent,
    ReportComponent // 2. ADD IT HERE IN THE DECLARATIONS ARRAY!
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }