import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Important for *ngFor, *ngIf
import { FormControl, ReactiveFormsModule } from '@angular/forms'; // Fixed
import { Router } from '@angular/router';
import { Product, ProductService } from '../../product.service';
import { SharedModule } from '../../shared/shared.module';
import { ApiService } from '../../services/api.service';


@Component({
  selector: 'app-search',
  standalone: true, // Mark as standalone
  imports: [CommonModule, ReactiveFormsModule, SharedModule], // REQUIRED for [formControl] and app-header
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  
  searchControl = new FormControl('');
  searchActive: boolean = false;
  currentQuery: string = '';

  popularSearches: string[] = ['table', 'chair', 'laptop', 'phone', 'cat'];
  recentSearches: string[] = [];
  allProducts: Product[] = [];
  filteredProducts: Product[] = [];

  constructor(private router: Router, private productService: ProductService, private apiService: ApiService) {}

    ngOnInit(): void {
      this.allProducts = this.productService.getProducts();
      // Load persisted searches from localStorage
      const saved = localStorage.getItem('recentSearches');
      this.recentSearches = saved ? JSON.parse(saved) : [];
      // Subscribe to route query params for search queries
      this.router.events.subscribe(() => {
        // No-op to trigger change detection on navigation
      });
      const urlParams = new URLSearchParams(window.location.search);
      const query = urlParams.get('query');
      if (query) {
        this.searchActive = true;
        this.currentQuery = query;
        this.searchControl.setValue(query);
        this.apiService.searchProducts(query).subscribe(products => {
          this.filteredProducts = products.filter(p => !p.sold);
        });
      } else {
        this.resetToSplash();
      }
    }

  triggerSearch(): void {
    const value = this.searchControl.value;
    if (value && value.trim()) {
      this.addToRecent(value.trim());
      this.searchActive = true;
      this.currentQuery = value.trim();
      this.apiService.searchProducts(value.trim()).subscribe(products => {
        this.filteredProducts = products.filter(p => !p.sold);
      });
      this.router.navigate(['/search'], { queryParams: { query: value.trim() } });
    } else {
      this.resetToSplash();
    }
  }

  selectKeyword(keyword: string): void {
    this.searchControl.setValue(keyword);
    this.addToRecent(keyword);
    this.searchActive = true;
    this.currentQuery = keyword;
    this.apiService.searchProducts(keyword).subscribe(products => {
      this.filteredProducts = products.filter(p => !p.sold);
    });
    this.router.navigate(['/search'], { queryParams: { query: keyword } });
  }

  addToRecent(query: string): void {
    const clean = query.trim().toLowerCase();
    // Update array: remove duplicates, move to top
    this.recentSearches = this.recentSearches.filter(s => s.toLowerCase() !== clean);
    this.recentSearches.unshift(clean);
    if (this.recentSearches.length > 5) this.recentSearches.pop();
    
    // Save to localStorage so it persists across pages
    localStorage.setItem('recentSearches', JSON.stringify(this.recentSearches));
  }

  removeRecentItem(index: number, event: Event): void {
    event.stopPropagation();
    this.recentSearches.splice(index, 1);
    localStorage.setItem('recentSearches', JSON.stringify(this.recentSearches));
  }

  clearAllRecent(): void {
    this.recentSearches = [];
    localStorage.removeItem('recentSearches');
  }

  navigateToProduct(productId: number): void {
    // Standardized to match your routing
    this.router.navigate(['/product', productId]); 
  }

  navigateToAllProducts(): void {
    this.router.navigate(['/products']);
  }

  resetToSplash(): void {
    this.searchActive = false;
    this.currentQuery = '';
    this.searchControl.setValue('');
    this.filteredProducts = [];
  }

  onSell(): void { console.log('Sell action invoked'); }
  onMessages(): void { console.log('Messages action invoked'); }
  onWishlist(): void { console.log('Wishlist action invoked'); }
  onProfile(): void { console.log('Profile action invoked'); }
  onLogout(): void { console.log('Logout action invoked'); }
}