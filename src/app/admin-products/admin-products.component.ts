import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService } from '../services/admin.service';

interface Product {
  id: any;
  name: string;
  price: any;
  uploadedBy: string;
  image: string;
  liked: boolean;
  rawProduct?: any;
}

interface StatCard {
  title: string;
  count: number;
  iconType: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
}

interface ReportRow {
  type: string;
  total: number;
  pending: number;
  resolved: number;
  rejected: number;
}

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-products.component.html',
  styleUrls: ['./admin-products.component.css']
})
export class AdminProductsComponent implements OnInit {
  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  /** Load products from backend */
  loadProducts(): void {
    this.adminService.getAllProducts().subscribe(
      (data: any[]) => {
        // Map backend fields to component fields
        this.adminProducts = (data || []).map((p: any) => ({
          id: p.id || p._id,
          name: p.name,
          price: p.price,
          uploadedBy: p.sellerName || p.uploadedBy || '',
          image: this.adminService.buildImageUrl((p.images && p.images.length > 0) ? p.images[0] : p.image),
          liked: false,
          rawProduct: p
        }));
      },
      (error: any) => {
        console.error('Failed to load admin products', error);
        alert('Unable to load products. Check console for details.');
      }
    );
  }
  activeMenu: string = 'Products';

  // Modal display toggles
  showEditModal: boolean = false;
  showDeleteModal: boolean = false;

  // Context trackers
  targetProduct!: Product;
  tempProduct: Product = { id: '', name: '', price: '', uploadedBy: '', image: '', liked: false };
  selectedFile: File | null = null;

  adminProducts: Product[] = [];

  stats: StatCard[] = [
    { title: 'Total Reports', count: 152, iconType: 'total', colorClass: 'text-[#2BAE96]', bgClass: 'bg-[#EAF7F5]', borderClass: 'border-[#2BAE96]/30' },
    { title: 'Pending Reports', count: 24, iconType: 'pending', colorClass: 'text-[#E28743]', bgClass: 'bg-[#FFF8F2]', borderClass: 'border-[#E28743]/30' },
    { title: 'Total Reports', count: 112, iconType: 'resolved', colorClass: 'text-[#20963E]', bgClass: 'bg-[#EDF7EE]', borderClass: 'border-[#20963E]/30' },
    { title: 'Rejected Reports', count: 16, iconType: 'rejected', colorClass: 'text-[#FB2C36]', bgClass: 'bg-[#FFF2F3]', borderClass: 'border-[#FB2C36]/30' }
  ];

  reportSummary: ReportRow[] = [
    { type: 'Spam Reports', total: 64, pending: 10, resolved: 48, rejected: 6 },
    { type: 'Fake Accounts', total: 36, pending: 6, resolved: 26, rejected: 4 },
    { type: 'Prohibited Items', total: 27, pending: 5, resolved: 19, rejected: 3 },
    { type: 'Irrelevant Content', total: 15, pending: 2, resolved: 11, rejected: 2 },
    { type: 'Others', total: 10, pending: 1, resolved: 8, rejected: 1 }
  ];

  setActiveMenu(menuName: string): void {
    this.activeMenu = menuName;
  }

  toggleLike(product: Product, event: Event): void {
    event.stopPropagation();
    product.liked = !product.liked;
  }

  onEditProduct(product: Product, event: Event): void {
    event.stopPropagation();
    this.selectedFile = null;
    this.targetProduct = product;
    this.tempProduct = { ...product };
    this.showEditModal = true;
  }

  onDeleteProduct(product: Product, event: Event): void {
    event.stopPropagation();
    this.targetProduct = product;
    this.showDeleteModal = true;
  }

  // Handles reading the local image file selection stream and parsing it to a valid preview
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
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
    if (!this.targetProduct) return;

    const updateRequest = (imagePaths: string[]) => {
      const raw = this.tempProduct.rawProduct || {};
      const productImages = imagePaths.length > 0 ? imagePaths : (raw.images || []);

      const payload = {
        name: this.tempProduct.name,
        companyName: raw.companyName || 'CampusCart',
        description: raw.description || 'No description provided.',
        price: parseFloat(this.tempProduct.price.toString().replace(/[^0-9.]/g, '')) || 0,
        negotiable: raw.negotiable !== undefined ? raw.negotiable : true,
        images: productImages,
        category: raw.category || 'Electronics',
        status: raw.status || 'AVAILABLE',
        sellerEmail: raw.sellerEmail || raw.seller || 'admin@campuscart.com',
        sellerName: this.tempProduct.uploadedBy || raw.sellerName || 'Admin'
      };

      this.adminService.updateProduct(this.targetProduct.id.toString(), payload).subscribe(
        () => {
          this.loadProducts();
          this.closeModals();
        },
        (error: any) => {
          console.error('Update product failed', error);
          alert('Failed to update product');
        }
      );
    };

    if (this.selectedFile) {
      this.adminService.uploadImages([this.selectedFile]).subscribe(
        (res: any) => {
          const imagePaths = Array.isArray(res) ? res : (res.imageUrls || []);
          updateRequest(imagePaths);
        },
        (error: any) => {
          console.error('Image upload failed', error);
          alert('Failed to upload image during update');
        }
      );
    } else {
      updateRequest([]);
    }
  }

  confirmDeleteProduct(): void {
    if (this.targetProduct && this.targetProduct.id) {
      this.adminService.deleteProduct(this.targetProduct.id.toString()).subscribe(
        () => {
          this.adminProducts = this.adminProducts.filter(p => p.id !== this.targetProduct.id);
          this.closeModals();
        },
        (error: any) => {
          console.error('Delete product failed', error);
          alert('Failed to delete product');
        }
      );
    }
  }
}