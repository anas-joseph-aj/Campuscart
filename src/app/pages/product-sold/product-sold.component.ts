import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
// Import the shared data store from your listing component
import { ProductDataStore, Product } from '../product-listing/product-listing.component';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-product-sold',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './product-sold.component.html',
  styleUrls: ['./product-sold.component.css']
})
export class ProductSoldComponent implements OnInit {

  // Custom Dropdown Interface Display Parameter Trackers
  isDropdownOpen = false;
  selectedSortOption = 'newest';
  selectedSortLabel = 'Newest First';
  fallbackProducts: Product[] = [];

  // Inject the shared data store directly into the constructor
  constructor(private dataStore: ProductDataStore, private apiService: ApiService) {}

  ngOnInit(): void {
    this.fallbackProducts = this.dataStore.products;
    if (this.fallbackProducts.length === 0) {
      const email = localStorage.getItem('email') || '';
      if (email) {
        this.apiService.getSellerProducts(email).subscribe(products => {
          this.fallbackProducts = products.map((p: any) => {
            const isSold = p.sold === true || 
                           (typeof p.status === 'string' && ['SOLD', 'sold', 'Inactive'].includes(p.status)) ||
                           p.sold === 'true';
            const priceNumber = parseFloat(String(p.price).replace(/[\D]+/g, '')) || 0;
            return {
              id: p.id,
              title: p.name || p.title || 'Product',
              price: priceNumber,
              priceDisplay: p.price ? String(p.price) : `₹${priceNumber}`,
              status: isSold ? 'Inactive' : 'Active',
              image: p.image || 'assets/placeholder.png'
            };
          });
        }, err => {
          console.error('Failed to load backend seller products for product-sold', err);
        });
      }
    }
  }

  // Automatically read and filter only 'Inactive' products from the shared store
  get soldProducts(): Product[] {
    const result = (this.fallbackProducts.length > 0 ? this.fallbackProducts : this.dataStore.products).filter(p => p.status === 'Inactive');

    // Apply sorting logic dynamically on the filtered array
    if (this.selectedSortOption === 'low-high') {
      return [...result].sort((a, b) => a.price - b.price);
    } else if (this.selectedSortOption === 'high-low') {
      return [...result].sort((a, b) => b.price - a.price);
    } else {
      // Default: Sort by newest id first
      return [...result].sort((a, b) => b.id - a.id);
    }
  }

  // History routing back step window execution handling logic routine
  goBack(): void {
    window.history.back();
  }

  // Toggle control state for custom overlay popover panels
  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  // Dropdown option tracking state mutated handler choice adjustments
  selectSortOption(option: string, label: string): void {
    this.selectedSortOption = option;
    this.selectedSortLabel = label;
    this.isDropdownOpen = false;
  }

  // Close opened select layout windows whenever an outside click happens safely
  @HostListener('document:click')
  closeDropdown(): void {
    this.isDropdownOpen = false;
  }
}