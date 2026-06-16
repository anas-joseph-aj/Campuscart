import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router'; // <--- 1. ADD THIS IMPORT

interface Product {
  id: number;
  name: string;
  price: string;
  uploadedBy: string;
  image: string;
  liked: boolean;
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
export class AdminProductsComponent {
  activeMenu: string = 'Products';

  // Modal display toggles
  showEditModal: boolean = false;
  showDeleteModal: boolean = false;

  // Context trackers
  targetProduct!: Product;
  tempProduct: Product = { id: 0, name: '', price: '', uploadedBy: '', image: '', liked: false };

  adminProducts: Product[] = [
    { id: 1, name: 'Dell Laptop', price: '₹37,000', uploadedBy: 'Jacob Thomas', image: 'assets/delllaptop.png', liked: false },
    { id: 2, name: 'Fairy Lights', price: '₹100', uploadedBy: 'Anjali Sharma', image: 'assets/fairylights.png', liked: false },
    { id: 3, name: 'Fish', price: '₹50', uploadedBy: 'Rohit Verma', image: 'assets/fish.png', liked: false },
    { id: 4, name: 'Flower Pot', price: '₹70', uploadedBy: 'Sneha Reddy', image: 'assets/flowerpot.png', liked: false },
    { id: 5, name: 'Forensic Science in Criminal Investigation', price: '₹490', uploadedBy: 'Dr. Amit', image: 'assets/forensicscience.png', liked: false },
    { id: 6, name: 'Samsung Fridge', price: '₹2,500', uploadedBy: 'Vikram Singh', image: 'assets/fridge.png', liked: false },
    { id: 7, name: 'Hero Xtreme 160R 4V', price: '₹45,000', uploadedBy: 'Rajesh Kumar', image: 'assets/herobike.png', liked: false },
    { id: 8, name: 'Prestige Induction Cooktop', price: '₹2,200', uploadedBy: 'Pooja Hegde', image: 'assets/inductioncooktopprestige.png', liked: false },
    { id: 9, name: 'Apple iPhone 11', price: '₹27,100', uploadedBy: 'Rahul Mathew', image: 'assets/iphone11.png', liked: false },
    { id: 10, name: 'iPhone 16', price: '₹69,900', uploadedBy: 'Rohit Sharma', image: 'assets/iphone16.png', liked: false },
    { id: 11, name: 'Apple iPhone 17 Pro', price: '₹70,000', uploadedBy: 'Arjun Malhotra', image: 'assets/iphone17.png', liked: false },
    { id: 12, name: 'MacBook Air M2', price: '₹72,500', uploadedBy: 'Meera Nair', image: 'assets/macbook.png', liked: false },
    { id: 13, name: 'Electric Kettle', price: '₹1,500', uploadedBy: 'Suresh Raina', image: 'assets/kettle.png', liked: false },
    { id: 14, name: 'MRF Cricket Bat', price: '₹3,200', uploadedBy: 'Virat K', image: 'assets/mrfcricketbat.png', liked: false },
    { id: 15, name: 'Prestige Pressure Cooker', price: '₹2,200', uploadedBy: 'Karan Johar', image: 'assets/prestigecooker.png', liked: false },
    { id: 16, name: 'The Price of Freedom Book', price: '₹340', uploadedBy: 'Prof. Das', image: 'assets/priceoffreedom.png', liked: false },
    { id: 17, name: 'Running Shoes', price: '₹1,200', uploadedBy: 'Jacob Thomas', image: 'assets/shoes.png', liked: false },
    { id: 18, name: '32 inch Smart TV', price: '₹11,200', uploadedBy: 'Abhishek B', image: 'assets/smarttv.png', liked: false },
    { id: 19, name: 'Smart Watch', price: '₹5,500', uploadedBy: 'Rahul Verma', image: 'assets/smartwatch.png', liked: false },
    { id: 20, name: 'Study Table', price: '₹1,400', uploadedBy: 'Verma Ji', image: 'assets/studytable.png', liked: false },
    { id: 21, name: 'Wooden Cot', price: '₹2,800', uploadedBy: 'Arjun M', image: 'assets/woodencot.png', liked: false },
    { id: 22, name: 'Siberian Cat', price: '₹2,200', uploadedBy: 'Aisha Malik', image: 'assets/cat.png', liked: false }
  ];

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
    const idx = this.adminProducts.findIndex(p => p.id === this.targetProduct.id);
    if (idx !== -1) {
      this.adminProducts[idx] = { ...this.tempProduct };
    }
    this.closeModals();
  }

  confirmDeleteProduct(): void {
    this.adminProducts = this.adminProducts.filter(p => p.id !== this.targetProduct.id);
    this.closeModals();
  }
}