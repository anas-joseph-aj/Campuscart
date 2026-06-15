import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { SharedModule } from './shared/shared.module';
import { LoginComponent } from './pages/login/login.component';
import { VerificationComponent } from './pages/verification/verification.component';
// Removed ProductComponent import (handled via lazy-loaded component)
import { ProfileComponent } from './pages/profile/profile.component';
import { SellComponent } from './sell/sell.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    VerificationComponent,
    // ProductComponent removed; uses lazy-loaded ProductPageComponent
    SellComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    SharedModule,
    ProfileComponent // Import standalone component here
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }