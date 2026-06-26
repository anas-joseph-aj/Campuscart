import { Component, Pipe, PipeTransform, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';


import { AdminService } from '../services/admin.service';

interface Product {
  id: number | string;
  name: string;
  price: string;
  uploadedBy: string;
  images: string[];
  status: 'Available' | 'Sold';
  image?: string;
}

@Pipe({
  name: 'searchProducts',
  standalone: true
})
export class SearchProductsPipe implements PipeTransform {
  transform(products: Product[], query: string): Product[] {
    if (!products || !query) return products;
    const cleanQuery = query.toLowerCase().trim();
    return products.filter(p =>
      p.name.toLowerCase().includes(cleanQuery) ||
      p.uploadedBy.toLowerCase().includes(cleanQuery) ||
      p.price.toLowerCase().includes(cleanQuery)
    );
  }
}

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SearchProductsPipe],
  templateUrl: './admin-products.component.html',
  styleUrls: ['./admin-products.component.css']
})
export class AdminProductsComponent implements OnInit {
  activeMenu: string = 'Products';
  searchQuery: string = '';

  showEditModal: boolean = false;
  showDeleteModal: boolean = false;

  targetProduct!: Product;
  tempProduct: Product = { id: '', name: '', price: '', uploadedBy: '', images: [], status: 'Available' };

  adminProducts: Product[] = [];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.adminService.getAdminProducts().subscribe({
      next: (products) => {
        this.adminProducts = (products as any[]).map(p => {
          let imgUrl: string | undefined = undefined;
          if (p.images) {
            if (Array.isArray(p.images) && p.images.length > 0) {
              imgUrl = this.adminService.buildImageUrl(p.images[0]);
            } else if (typeof p.images === 'string') {
              try {
                const parsed = JSON.parse(p.images);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  imgUrl = this.adminService.buildImageUrl(parsed[0]);
                } else {
                  imgUrl = this.adminService.buildImageUrl(p.images);
                }
              } catch {
                imgUrl = this.adminService.buildImageUrl(p.images);
              }
            }
          }
          return {
            id: p.id,
            name: p.name,
            price: p.price,
            uploadedBy: p.uploadedBy || p.sellerName || p.sellerEmail,
            images: Array.isArray(p.images) ? p.images : (p.images ? [p.images] : []),
            status: p.status === 'SOLD' || p.status === 'Sold' ? 'Sold' : 'Available',
            image: imgUrl
          };
        });
      },
      error: (err) => console.error('Failed to load products from backend:', err)
    });
  }

  setActiveMenu(menuName: string): void {
    this.activeMenu = menuName;
  }

  onEditProduct(product: Product, event: Event): void {
    event.stopPropagation();
    this.targetProduct = product;
    this.tempProduct = { ...product };
    this.showEditModal = true;
  }

  onDeleteProduct(product: Product, event: Event): void {
    event.stopPropagation();
    this.targetProduct = product;
    this.showDeleteModal = true;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.tempProduct.image = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  closeModals(): void {
    this.showEditModal = false;
    this.showDeleteModal = false;
  }

  saveProductDetails(): void {
    const id = this.targetProduct.id.toString();
    const updatedStatusBackend = this.tempProduct.status === 'Sold' ? 'SOLD' : 'AVAILABLE';
    const payload = {
      name: this.tempProduct.name,
      price: this.tempProduct.price,
      status: updatedStatusBackend
    };

    this.adminService.updateProduct(id, payload).subscribe({
      next: () => {
        const idx = this.adminProducts.findIndex(p => p.id === this.targetProduct.id);
        if (idx !== -1) {
          const updated = { ...this.tempProduct };
          if (updated.images && updated.images.length) {
            updated.image = this.adminService.buildImageUrl(updated.images[0]);
          }
          this.adminProducts[idx] = updated as Product;
        }
        this.closeModals();
      },
      error: (err) => {
        console.error('Failed to save product details to backend:', err);
        // Optimistically apply anyway
        const idx = this.adminProducts.findIndex(p => p.id === this.targetProduct.id);
        if (idx !== -1) {
          const updated = { ...this.tempProduct };
          if (updated.images && updated.images.length) {
            updated.image = this.adminService.buildImageUrl(updated.images[0]);
          }
          this.adminProducts[idx] = updated as Product;
        }
        this.closeModals();
      }
    });
  }

  confirmDeleteProduct(): void {
    const id = this.targetProduct.id.toString();
    this.adminService.deleteProduct(id).subscribe({
      next: () => {
        this.adminProducts = this.adminProducts.filter(p => p.id !== this.targetProduct.id);
        this.closeModals();
      },
      error: (err) => {
        console.error('Failed to delete product from backend:', err);
        // Optimistically delete anyway
        this.adminProducts = this.adminProducts.filter(p => p.id !== this.targetProduct.id);
        this.closeModals();
      }
    });
  }
}