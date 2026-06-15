import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-uploaded',
  standalone: true,                      // <--- Keeps Angular from throwing the NG04014 runtime error!
  imports: [CommonModule, RouterModule], 
  templateUrl: './product-uploaded.component.html' // <--- CRITICAL: Tells Angular to load your Tailwind HTML file!
})
export class ProductUploadedComponent {
  constructor(private router: Router) {}

  navigateTo(destination: string) {
    if (destination === 'list-another') {
      this.router.navigate(['/sell']);
    } else if (destination === 'my-listings') {
      this.router.navigate(['/profile']);
    } else if (destination === 'view-product') {
      this.router.navigate(['/products']); // <--- Handles the 'view-product' click action from your custom HTML
    } else {
      this.router.navigate(['/home']);
    }
  }
}