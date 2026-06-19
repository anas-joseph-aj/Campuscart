import { Component, HostListener, Injectable, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

export interface Product {
  id: number;
  title: string;
  price: number;
  priceDisplay: string;
  status: string;
  image: string;
  deactivateDate?: string;
}

// Kept for product-sold compatibility (no longer the source of truth for listing)
@Injectable({
  providedIn: 'root'
})
export class ProductDataStore {
  products: Product[] = [];
}

@Component({
  selector: 'app-product-listing',
  standalone: true,
  imports: [CommonModule, SharedModule, FormsModule],
  templateUrl: './product-listing.component.html',
  styleUrls: ['./product-listing.component.css']
})
export class ProductListingComponent implements OnInit {
  currentTab: 'all' | 'active' | 'inactive' = 'all';
  sortBy: string = 'newest';
  
  // Custom UI Controls
  isEditModalOpen: boolean = false;
  isDeletePopupOpen: boolean = false;
  isDropdownOpen: boolean = false; 

  editingProduct: Product = { id: 0, title: '', price: 0, priceDisplay: '', status: '', image: '' };
  productPendingDelete: Product | null = null;

  myProducts: Product[] = [];
  loggedInEmail: string = '';

  constructor(private router: Router, private dataStore: ProductDataStore, private apiService: ApiService) {}

  ngOnInit() {
    this.loggedInEmail = localStorage.getItem('email') || '';
    this.loadMyProducts();
  }

  loadMyProducts() {
    if (!this.loggedInEmail) {
      return;
    }

    this.apiService.getSellerProducts(this.loggedInEmail).subscribe(products => {
      this.myProducts = products.map(p => this.normalizeBackendProduct(p));
      this.myProducts.sort((a, b) => b.id - a.id);
      this.updateDataStore();
    }, err => {
      console.error('Failed to load backend seller products', err);
    });
  }

  private normalizeBackendProduct(product: any): Product {
    const priceText = product.price ? String(product.price) : '0';
    const priceNumber = parseFloat(priceText.replace(/[\D]+/g, '')) || 0;
    const normalizedStatus = typeof product.status === 'string' ? product.status.toLowerCase() : '';
    const isSold = product.sold === true || 
                   ['sold', 'inactive'].includes(normalizedStatus) ||
                   product.sold === 'true';
    return {
      id: product.id,
      title: product.name || product.title || 'Product',
      price: priceNumber,
      priceDisplay: product.price ? String(product.price) : `₹${priceNumber}`,
      status: isSold ? 'Inactive' : 'Active',
      image: product.image || 'assets/placeholder.png'
    };
  }

  updateDataStore() {
    // Keep ProductDataStore in sync for product-sold page
    this.dataStore.products = this.myProducts;
  }

  // Reading products array directly from our local state
  get products(): Product[] {
    return this.myProducts;
  }

  // Computed label display helper for the dropdown
  get selectedSortLabel(): string {
    if (this.sortBy === 'low-high') return 'Price: Low to High';
    if (this.sortBy === 'high-low') return 'Price: High to Low';
    return 'Newest First';
  }

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  selectSort(mode: string) {
    this.sortBy = mode;
    this.isDropdownOpen = false;
  }

  // Closes dropdown instantly if clicking outside the element workspace
  @HostListener('document:click')
  closeDropdownOutside() {
    this.isDropdownOpen = false;
  }

  getStatusCount(status: string): number {
    return this.products.filter(p => p.status.toLowerCase() === status.toLowerCase()).length;
  }

  get filteredProducts() {
    let result = this.products;
    
    if (this.currentTab !== 'all') {
      result = this.products.filter(p => p.status.toLowerCase() === this.currentTab);
    }

    if (this.sortBy === 'low-high') {
      return [...result].sort((a, b) => a.price - b.price);
    } else if (this.sortBy === 'high-low') {
      return [...result].sort((a, b) => b.price - a.price);
    } else {
      return [...result].sort((a, b) => b.id - a.id);
    }
  }

  setTab(tab: 'all' | 'active' | 'inactive') {
    this.currentTab = tab;
  }

  shareProduct(product: Product, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/share']);
  }

  onFileSelected(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      const reader = new FileReader();
      
      reader.onload = () => {
        this.editingProduct.image = reader.result as string;
      };
      
      reader.readAsDataURL(file);
    }
  }

  openEditModal(product: Product, event?: Event) {
    if (event) event.stopPropagation();
    this.editingProduct = { ...product };
    this.isEditModalOpen = true;
  }

  triggerDeleteConfirmation(product: Product, event: Event) {
    event.stopPropagation();
    this.productPendingDelete = product;
    this.isDeletePopupOpen = true;
  }

  confirmDeleteProduct() {
    if (this.productPendingDelete) {
      const productId = this.productPendingDelete.id;
      // Call backend API to delete the product
      this.apiService.deleteProduct(productId).subscribe({
        next: () => {
          this.myProducts = this.myProducts.filter(p => p.id !== productId);
          this.updateDataStore();
          this.isDeletePopupOpen = false;
          this.productPendingDelete = null;
        },
        error: (err) => {
          console.error('Failed to delete product from backend', err);
          // Still remove locally even if backend fails
          this.myProducts = this.myProducts.filter(p => p.id !== productId);
          this.updateDataStore();
          this.isDeletePopupOpen = false;
          this.productPendingDelete = null;
        }
      });
    } else {
      this.isDeletePopupOpen = false;
      this.productPendingDelete = null;
    }
  }

  markAsSold() {
    const index = this.myProducts.findIndex(p => p.id === this.editingProduct.id);
    if (index !== -1) {
      const today = new Date();
      const formattedDate = today.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
      
      this.myProducts[index].status = 'Inactive';
      this.myProducts[index].deactivateDate = formattedDate;
      this.updateDataStore();

      const productId = this.myProducts[index].id;
      this.apiService.markProductSold(productId).subscribe({
        next: () => {
          // backend updated successfully
        },
        error: err => {
          console.error('Failed to mark product sold on backend', err);
        }
      });
    }
    this.isEditModalOpen = false;

    // Changes screen route instantly over to the product-sold component
    this.router.navigate(['/product-sold']);
  }

  saveProductEdits() {
    const index = this.myProducts.findIndex(p => p.id === this.editingProduct.id);
    if (index !== -1) {
      this.editingProduct.priceDisplay = '₹' + this.editingProduct.price.toLocaleString('en-IN');
      // Optimistically update local UI
      this.myProducts[index] = { ...this.editingProduct };
      this.updateDataStore();
      // Prepare backend-compatible payload (backend expects `name`, not `title`)
      const payload: any = {
        name: this.editingProduct.title,
        price: this.editingProduct.price,
        image: this.editingProduct.image,
        // pass status as-is (backend mapping handles Active/Inactive)
        status: this.editingProduct.status,
        // ensure we preserve product ownership when updating
        sellerEmail: (this.editingProduct as any).sellerEmail || this.loggedInEmail
      };

      // Debug log to help trace update issues
      console.log('Saving product edits to backend', this.editingProduct.id, payload);

      // Send update to backend and notify other components on success
      this.apiService.updateProduct(this.editingProduct.id, payload).subscribe({
        next: (updated) => {
          // Ensure normalized product from backend replaces local copy
          const normalized = this.normalizeBackendProduct(updated as any);
          this.myProducts[index] = normalized;
          this.updateDataStore();
          this.apiService.triggerProductRefresh();
        },
        error: (err) => {
          console.error('Failed to persist product edits to backend', err);
          // Keep optimistic local changes but still notify other components to attempt consistency
          this.apiService.triggerProductRefresh();
        }
      });
    }
    this.isEditModalOpen = false;
  }

  reactivateProduct(product: Product, event: Event) {
    event.stopPropagation();
    const target = this.myProducts.find(p => p.id === product.id);
    if (target) {
      target.status = 'Active';
      delete target.deactivateDate;
      this.updateDataStore();
    }
  }

  goBack() {
    this.router.navigate(['/profile']);
  }
}