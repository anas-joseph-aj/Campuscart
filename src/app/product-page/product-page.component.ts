import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { Product } from '../product.service';
import { SharedModule } from '../shared/shared.module';
import { WishlistService } from '../services/wishlist.service';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-product-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SharedModule],
  templateUrl: './product-page.component.html',
  styleUrls: ['./product-page.component.css']
})
export class ProductPageComponent implements OnInit {
  allProductsMaster: Product[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private apiService: ApiService,
    private wishlistService: WishlistService
  ) { }

  searchSubject = new Subject<string>();

  ngOnInit(): void {
    // Fetch all products from backend
    this.apiService.getAllProducts().subscribe(products => {
      // Filter out sold products
      this.allProductsMaster = products.filter(p => !p.sold);
      this.allProductsMaster.forEach(p => {
        p.liked = this.wishlistService.isProductInWishlist(p.id);
      });
      this.applyFilters();
    });
    // Preserve selected category from query params
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.selectedCategory = params['category'];
        this.applyFilters();
      }
    });

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.applyFilters();
    });
    this.apiService.productRefresh$.subscribe(() => this.reloadProducts());
  }

  categories: { name: string; icon: string }[] = [
    { name: 'Electronics', icon: 'assets/electronics.png' },
    { name: 'Books', icon: 'assets/books.png' },
    { name: 'Fashion', icon: 'assets/fashion.png' },
    { name: 'Sports', icon: 'assets/sports.png' },
    { name: 'Pets', icon: 'assets/pets.png' },
    { name: 'Vehicles', icon: 'assets/vehicles.png' },
    { name: 'Kitchen', icon: 'assets/kitchen.png' },
    { name: 'Furniture', icon: 'assets/furniture.png' },
    { name: 'Miscellaneous', icon: 'assets/miscellaneous.png' },
    { name: 'Donation', icon: 'assets/donation.png' }
  ];

  selectedCategory: string = 'All Products';
  searchQuery: string = '';

  onSearchChange(query: string) {
    this.searchSubject.next(query);
  }

  filteredProducts: Product[] = [];

  applyFilters() {
    const query = this.searchQuery.trim();
    if (query === '') {
      // 1. Completely strip out any items tied to Donation from normal category views
      let list = this.allProductsMaster.filter(p => p.category !== 'Donation' && !(p.categories && p.categories.includes('Donation')));

      // 2. Filter by sidebar selections
      if (this.selectedCategory !== 'All Products') {
        // Force an empty array when Donation is explicitly selected to trigger empty.png layout
        if (this.selectedCategory === 'Donation') {
          this.filteredProducts = [];
          return;
        }
        list = list.filter(p => p.category === this.selectedCategory || (p.categories && p.categories.includes(this.selectedCategory)));
      }
      this.filteredProducts = list;
    } else {
      // 3. Filter by typed search matching using backend API
      if (this.selectedCategory === 'All Products') {
        this.apiService.searchProducts(query).subscribe(products => {
          this.filteredProducts = products.filter(p => !p.sold);
          this.filteredProducts.forEach(p => p.liked = this.wishlistService.isProductInWishlist(p.id));
        });
      } else {
        this.apiService.getProductsByCategoryAndKeyword(this.selectedCategory, query).subscribe(products => {
          this.filteredProducts = products.filter(p => !p.sold);
          this.filteredProducts.forEach(p => p.liked = this.wishlistService.isProductInWishlist(p.id));
        });
      }
    }
  }

  getCategoryCount(category: string): number {
    // Force zero registration on the badge to match your visual requirement
    if (category === 'Donation') {
      return 0;
    }

    // Clean list calculation completely independent of donation variables
    let cleanList = this.allProductsMaster.filter(p => p.category !== 'Donation' && !(p.categories && p.categories.includes('Donation')));

    if (category === 'All Products') {
      return cleanList.length;
    }
    return cleanList.filter(p => p.category === category || (p.categories && p.categories.includes(category))).length;
  }

  selectCategory(catName: string) {
    this.selectedCategory = catName;
    this.applyFilters();
  }

  toggleLike(product: any, event: Event) {
    event.stopPropagation();
    this.wishlistService.toggleProduct(product);
    product.liked = this.wishlistService.isProductInWishlist(product.id);
  }

  navigateToProduct(productId: number) {
    this.router.navigate(['/product', productId], { queryParams: { category: this.selectedCategory } });
  }

  onSell() { alert('Opening listing builder form...'); }
  onMessages() { alert('Loading message inbox...'); }
  onWishlist() { alert('Loading favorite wishlist items...'); }
  onProfile() { alert('Opening account settings dashboard...'); }
  onLogout() { alert('Logging out securely...'); }

  // Refresh product list when changes occur elsewhere
  private reloadProducts(): void {
    this.apiService.getAllProducts().subscribe(products => {
      this.allProductsMaster = products.filter(p => !p.sold);
      this.allProductsMaster.forEach(p => {
        p.liked = this.wishlistService.isProductInWishlist(p.id);
      });
      this.applyFilters();
    });
  }
}