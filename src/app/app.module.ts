import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms'; 

import { AppRoutingModule } from './app-routing.module'; // Fixed routing reference
import { AppComponent } from './app.component';
import { ProfileComponent } from './profile/profile.component';
import { ChatComponent } from './chat/chat.component';
import { ShareComponent } from './share/share.component';

@NgModule({
  declarations: [
    AppComponent,
    ProfileComponent,
    ChatComponent,
    ShareComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule // This makes [(ngModel)] function inside chat.component.html
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }