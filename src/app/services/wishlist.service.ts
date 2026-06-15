import { Injectable } from '@angular/core';
import { Product } from '../product.service';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  constructor(private apiService: ApiService) {}

  private getEmail(): string {
    return localStorage.getItem('email') || 'default_user';
  }

  private getWishlistKey(): string {
    return `wishlist_${this.getEmail()}`;
  }

  /** Toggle product in wishlist (local + backend) */
  toggleProduct(product: Product): void {
    const list = this.getWishlist();
    const index = list.findIndex(item => item.id === product.id);
    const email = this.getEmail();

    if (index > -1) {
      // Remove from wishlist
      list.splice(index, 1);
      this.apiService.removeFromWishlist(email, product.id).subscribe({
        next: () => console.log('Removed from wishlist on backend'),
        error: (err) => console.error('Failed to remove from wishlist on backend', err)
      });
    } else {
      // Add to wishlist
      list.push(product);
      this.apiService.addToWishlist(email, product.id).subscribe({
        next: () => console.log('Added to wishlist on backend'),
        error: (err) => console.error('Failed to add to wishlist on backend', err)
      });
    }
    localStorage.setItem(this.getWishlistKey(), JSON.stringify(list));
  }

  /** Check if product is in wishlist */
  isProductInWishlist(id: string | number): boolean {
    const list = this.getWishlist();
    return list.some(item => item.id == id);
  }

  /** Get all wishlist items */
  getWishlist(): Product[] {
    const raw = localStorage.getItem(this.getWishlistKey());
    return raw ? JSON.parse(raw) : [];
  }
}