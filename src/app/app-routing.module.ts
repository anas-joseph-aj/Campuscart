import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Existing working components
import { ProfileComponent } from './profile/profile.component';
import { ChatComponent } from './chat/chat.component';
import { ShareComponent } from './share/share.component';

// Restored components
import { ProductPageComponent } from './product-page/product-page.component';
import { SearchComponent } from './search/search.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'product-details/:id',
    loadComponent: () => import('./product-details/product-details.component').then(m => m.ProductDetailsComponent)
  },
  {
    path: 'report',
    loadComponent: () => import('./report/report.component').then(m => m.ReportComponent)
  },
  { path: 'profile', component: ProfileComponent },
  { path: 'chat', component: ChatComponent },
  { path: 'share', component: ShareComponent },
  { path: 'products', component: ProductPageComponent },
  { path: 'categories', component: ProductPageComponent },
  { path: 'search', component: SearchComponent },
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }