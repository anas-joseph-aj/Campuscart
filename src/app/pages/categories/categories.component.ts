import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { ProductService } from '../../product.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SharedModule],
  templateUrl: './categories.component.html'
})
export class CategoriesComponent implements OnInit {
  searchText = '';
  categories = [
    { icon: '📚', name: 'Books', key: 'Books', count: 0 },
    { icon: '💻', name: 'Electronics', key: 'Electronics', count: 0 },
    { icon: '🪑', name: 'Furniture', key: 'Furniture', count: 0 },
    { icon: '👗', name: 'Fashion', key: 'Fashion', count: 0 },
    { icon: '🐾', name: 'Pets', key: 'Pets', count: 0 },
    { icon: '🍳', name: 'Kitchen', key: 'Kitchen', count: 0 },
    { icon: '🚗', name: 'Vehicle', key: 'Vehicles', count: 0 },
    { icon: '⚽', name: 'Sports', key: 'Sports', count: 0 },
    { icon: '📦', name: 'Miscellaneous', key: 'Miscellaneous', count: 0 },
    { icon: '🎁', name: 'Donation', key: 'Donation', count: 0 }
  ];

  constructor(public router: Router, private productService: ProductService) {}

  ngOnInit(): void {
    const counts: Record<string, number> = {};
    this.productService.getProducts().forEach(product => {
      const category = product.category || 'Miscellaneous';
      counts[category] = (counts[category] || 0) + 1;
    });

    this.categories = this.categories
      .map(category => ({
        ...category,
        count: counts[category.key] || 0
      }))
      .filter(category => category.count > 0);
  }

  get filteredCategories() {
    return this.categories.filter(category =>
      category.name.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  openCategory(category: { name: string; key: string }) {
    this.router.navigate(['/products'], { queryParams: { category: category.key } });
  }
}
