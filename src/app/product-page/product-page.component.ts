import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Product, ProductService } from '../product.service';

@Component({
  selector: 'app-product-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './product-page.component.html',
  styleUrls: ['./product-page.component.css']
})
export class ProductPageComponent {
  allProductsMaster: Product[] = [];

  constructor(private router: Router, private productService: ProductService) {
    this.allProductsMaster = this.productService.getProducts();
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

  get filteredProducts() {
    // 1. Completely strip out any items tied to Donation from normal category views
    let list = this.allProductsMaster.filter(p => p.category !== 'Donation' && !(p.categories && p.categories.includes('Donation')));

    // 2. Filter by sidebar selections
    if (this.selectedCategory !== 'All Products') {
      // Force an empty array when Donation is explicitly selected to trigger empty.png layout
      if (this.selectedCategory === 'Donation') {
        return [];
      }
      list = list.filter(p => p.category === this.selectedCategory || (p.categories && p.categories.includes(this.selectedCategory)));
    }

    // 3. Filter by typed search matching
    if (this.searchQuery.trim() !== '') {
      list = list.filter(p => p.name.toLowerCase().includes(this.searchQuery.toLowerCase()));
    }
    return list;
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
  }

  toggleLike(product: any, event: Event) {
    event.stopPropagation();
    product.liked = !product.liked;
  }

  navigateToProduct(productId: number) {
    this.router.navigate(['/product-details', productId], { queryParams: { category: this.selectedCategory } });
  }

  onSell() { alert('Opening listing builder form...'); }
  onMessages() { alert('Loading message inbox...'); }
  onWishlist() { alert('Loading favorite wishlist items...'); }
  onProfile() { alert('Opening account settings dashboard...'); }
  onLogout() { alert('Logging out securely...'); }
}