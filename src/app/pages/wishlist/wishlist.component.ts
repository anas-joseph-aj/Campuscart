import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { WishlistService } from '../../services/wishlist.service';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { Product } from '../../product.service';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, SharedModule, RouterModule],
  templateUrl: './wishlist.component.html'
})
export class WishlistComponent {
  constructor(private wishlistService: WishlistService, private router: Router) {}

  navigateToProducts(): void {
    this.router.navigate(['/products']);
  }

  get wishlistItems(): Product[] {
    return this.wishlistService.getWishlist();
  }

  deleteItem(itemId: string | number): void {
    const product = this.wishlistItems.find(p => p.id == itemId);
    if (product) {
      product.liked = false;
      this.wishlistService.toggleProduct(product);
    }
  }

  chatWithSeller(item: Product): void {
    console.log('Chatting with seller for:', item.name);
  }
  navigateToProduct(productId: string | number): void {
    this.router.navigate(['/product', productId]);
  }
}