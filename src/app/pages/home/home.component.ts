import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { Product, ProductService } from '../../product.service';
import { WishlistService } from '../../services/wishlist.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, SharedModule],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit, OnDestroy {
  featuredProducts: Product[] = [];
  private productSubscription!: Subscription;

  constructor(
    private router: Router,
    private productService: ProductService,
    private wishlistService: WishlistService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    // Load products from backend
    this.apiService.getAllProducts().subscribe(products => {
      this.featuredProducts = [...products]
        .sort((a, b) => Number(b.id) - Number(a.id))
        .slice(0, 4);
      this.featuredProducts.forEach(p => p.liked = this.wishlistService.isProductInWishlist(p.id));
    });
    // Subscribe to new product additions
    this.productSubscription = this.productService.productAdded$.subscribe(() => {
      this.refreshFeaturedProducts();
    });
  }

  private refreshFeaturedProducts(): void {
    this.apiService.getAllProducts().subscribe(products => {
      const enriched = products.map(p => ({
        ...p,
        image: (p as any).image || ((p as any).images && (p as any).images[0]) || ''
      }));
      this.featuredProducts = [...enriched]
        .sort((a, b) => Number(b.id) - Number(a.id))
        .slice(0, 4);
      this.featuredProducts.forEach(p => p.liked = this.wishlistService.isProductInWishlist(p.id));
    });
  }

  navigateToSearch(): void { this.router.navigate(['/search']); }
  openCategory(name: string): void { this.router.navigate(['/products'], { queryParams: { category: name } }); }
  navigateToAllProducts(): void { this.router.navigate(['/products']); }
  navigateToProduct(productId: string | number): void { this.router.navigate(['/product', productId]); }
  toggleLike(product: Product, event: Event): void { event.stopPropagation(); this.wishlistService.toggleProduct(product); product.liked = this.wishlistService.isProductInWishlist(product.id); }
  ngOnDestroy(): void { if (this.productSubscription) { this.productSubscription.unsubscribe(); } }
}
