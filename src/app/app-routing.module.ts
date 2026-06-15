import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Existing Imports
import { LoginComponent } from './pages/login/login.component';
import { OtpComponent } from './pages/otp/otp.component';
import { HomeComponent } from './pages/home/home.component';
import { SearchComponent } from './pages/search/search.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { WishlistComponent } from './pages/wishlist/wishlist.component';
import { FeedbackComponent } from './pages/feedback/feedback.component';
import { FeedbackSuccessComponent } from './pages/feedback-success/feedback-success.component';
import { SellComponent } from './sell/sell.component';
import { ProductSoldComponent } from './pages/product-sold/product-sold.component';
import { ProductListingComponent } from './pages/product-listing/product-listing.component';
// Import the guard
import { authGuard } from './auth.guard';

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'otp', component: OtpComponent },
  { path: 'home', component: HomeComponent}, 
  { path: 'search', component: SearchComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'wishlist', component: WishlistComponent, canActivate: [authGuard] },
  { path: 'feedback', component: FeedbackComponent, canActivate: [authGuard] },
  { path: 'feedback-success', component: FeedbackSuccessComponent, canActivate: [authGuard] },
  { path: 'sell', component: SellComponent, canActivate: [authGuard] },
  {
    path: 'product-uploaded',
    loadComponent: () => import('./sell/product-uploaded/product-uploaded.component')
      .then(m => m.ProductUploadedComponent),
    canActivate: [authGuard]
  },
  { path: 'product-sold', component: ProductSoldComponent, canActivate: [authGuard] },
  { path: 'product-listing', component: ProductListingComponent, canActivate: [authGuard] },
  {
    path: 'chat',
    loadComponent: () => import('./pages/chat/chat.component')
      .then(m => m.ChatComponent),
    canActivate: [authGuard]
  },

  
  { 
  path: 'products', 
  // If the folder is directly inside 'app', use './product-page/...'
  loadComponent: () => import('./product-page/product-page.component')
    .then(m => m.ProductPageComponent),
  canActivate: [authGuard] 
},
{
  path: 'categories',
  loadComponent: () => import('./pages/categories/categories.component')
    .then(m => m.CategoriesComponent)
},
{ 
  path: 'product/:id', 
  // If the folder is directly inside 'app', use './product-details/...'
  loadComponent: () => import('./product-details/product-details.component')
    .then(m => m.ProductDetailsComponent),
  canActivate: [authGuard] 
},
{
  path: 'report',
  loadComponent: () => import('./pages/report/report.component')
    .then(m => m.ReportComponent),
  canActivate: [authGuard]
},
{
  path: 'product/:id/share',
  loadComponent: () => import('./pages/share/share.component')
    .then(m => m.ShareComponent),
  canActivate: [authGuard]
},
{
  path: 'share',
  loadComponent: () => import('./pages/share/share.component')
    .then(m => m.ShareComponent),
  canActivate: [authGuard]
},
  
  { path: '**', redirectTo: '' } 
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }