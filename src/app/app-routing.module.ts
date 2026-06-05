import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
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
    path: 'products',
    component: ProductPageComponent
  },
  {
    path: 'categories',
    component: ProductPageComponent
  },
  {
    path: 'search',
    component: SearchComponent
  },
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
