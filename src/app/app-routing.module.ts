import { Routes } from '@angular/router';
import { ProfileComponent } from './profile/profile.component';
import { ChatComponent } from './chat/chat.component';
import { ShareComponent } from './share/share.component'; 

// Change this to a simple 'export const' array
export const routes: Routes = [
  { path: 'share', component: ShareComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'chat', component: ChatComponent },
  { path: '', redirectTo: '/profile', pathMatch: 'full' },
  { path: '**', redirectTo: '/profile' }
];

