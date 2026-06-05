import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  searchControl = new FormControl('');
  searchActive: boolean = false;
  currentQuery: string = '';

  recentSearches: string[] = ['shoes', 't-shirt', 'jacket'];
  popularSearches: string[] = ['Summer Collection', 'Denim', 'Sneakers', 'Accessories'];

  // Mock product database for the template to filter through
  allProducts = [
    { id: 1, name: 'Running Sneakers', price: 89.99, category: 'Sneakers' },
    { id: 2, name: 'Classic Denim Jacket', price: 59.99, category: 'Denim' },
    { id: 3, name: 'Casual White T-Shirt', price: 19.99, category: 't-shirt' }
  ];
  filteredProducts: any[] = [];

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.filteredProducts = [...this.allProducts];
  }

  triggerSearch(): void {
    const query = this.searchControl.value?.trim();
    if (query) {
      this.currentQuery = query;
      this.searchActive = true;
      this.filteredProducts = this.allProducts.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase())
      );
      if (!this.recentSearches.includes(query)) {
        this.recentSearches.unshift(query);
      }
    }
  }

  selectKeyword(keyword: string): void {
    this.searchControl.setValue(keyword);
    this.triggerSearch();
  }

  removeRecentItem(index: number, event: Event): void {
    event.stopPropagation();
    this.recentSearches.splice(index, 1);
  }

  clearAllRecent(): void {
    this.recentSearches = [];
  }

  resetToSplash(): void {
    this.searchControl.setValue('');
    this.searchActive = false;
    this.currentQuery = '';
    this.filteredProducts = [...this.allProducts];
  }

  navigateToProduct(id: number): void {
    this.router.navigate(['/product-details', id]);
  }
}
