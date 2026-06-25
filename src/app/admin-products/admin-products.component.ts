import { Component, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Product {
  id: number;
  name: string;
  price: string;
  uploadedBy: string;
  image: string;
  status: 'Available' | 'Sold';
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

import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SearchProductsPipe],
  templateUrl: './admin-products.component.html',
  styleUrls: ['./admin-products.component.css']
})
export class AdminProductsComponent {
  activeMenu: string = 'Products';
  searchQuery: string = '';

  showEditModal: boolean = false;
  showDeleteModal: boolean = false;

  targetProduct!: Product;
  tempProduct: Product = { id: 0, name: '', price: '', uploadedBy: '', image: '', status: 'Available' };

  // Expanded list containing all 22 products mapped cleanly to Available / Sold
  adminProducts: Product[] = [
    { id: 1, name: 'iPhone 16', price: '₹69,900', uploadedBy: 'Rohit Sharma', image: 'assets/iphone16.png', status: 'Available' },
    { id: 2, name: 'Smart Watch', price: '₹5,500', uploadedBy: 'Rahul Verma', image: 'assets/smartwatch.png', status: 'Available' },
    { id: 3, name: 'Running Shoes', price: '₹1,200', uploadedBy: 'Jacob Thomas', image: 'assets/shoes.png', status: 'Available' },
    { id: 4, name: 'Dell Laptop', price: '₹37,100', uploadedBy: 'Jacob Thomas', image: 'assets/delllaptop.png', status: 'Available' },
    { id: 5, name: 'Apple MacBook Air M2', price: '₹32,500', uploadedBy: 'Arjun M', image: 'assets/macbook.png', status: 'Available' },
    { id: 6, name: 'Apple iPhone 17 Pro', price: '₹70,000', uploadedBy: 'Rahul Mathew', image: 'assets/iphone17.png', status: 'Sold' },
    { id: 7, name: 'Apple iPhone 11', price: '₹37,000', uploadedBy: 'Rahul Mathew', image: 'assets/iphone11.png', status: 'Available' },
    { id: 8, name: 'Wooden Cot', price: '₹2,800', uploadedBy: 'Arjun M', image: 'assets/woodencot.png', status: 'Available' },
    { id: 9, name: 'Study Table', price: '₹1,400', uploadedBy: 'Verma', image: 'assets/studytable.png', status: 'Sold' },
    { id: 10, name: 'Fairy Lights', price: '₹100', uploadedBy: 'Anjali Sharma', image: 'assets/fairylights.png', status: 'Available' },
    { id: 11, name: 'Fish Bowl', price: '₹50', uploadedBy: 'Rohit Verma', image: 'assets/fish.png', status: 'Available' },
    { id: 12, name: 'Flower Pot', price: '₹70', uploadedBy: 'Sneha Reddy', image: 'assets/flowerpot.png', status: 'Available' },
    { id: 13, name: 'Forensic Science Textbook', price: '₹490', uploadedBy: 'Dr. Amit', image: 'assets/forensicscience.png', status: 'Available' },
    { id: 14, name: 'Samsung Fridge', price: '₹2,500', uploadedBy: 'Vikram Singh', image: 'assets/fridge.png', status: 'Available' },
    { id: 15, name: 'Hero Xtreme 160R 4V', price: '₹45,000', uploadedBy: 'Rajesh Kumar', image: 'assets/herobike.png', status: 'Available' },
    { id: 16, name: 'Prestige Induction Cooktop', price: '₹2,200', uploadedBy: 'Pooja Hegde', image: 'assets/inductioncooktopprestige.png', status: 'Available' },
    { id: 17, name: 'Electric Kettle', price: '₹1,500', uploadedBy: 'Suresh Raina', image: 'assets/kettle.png', status: 'Available' },
    { id: 18, name: 'MRF Cricket Bat', price: '₹3,200', uploadedBy: 'Virat K', image: 'assets/mrfcricketbat.png', status: 'Available' },
    { id: 19, name: 'Prestige Pressure Cooker', price: '₹2,200', uploadedBy: 'Karan Johar', image: 'assets/prestigecooker.png', status: 'Available' },
    { id: 20, name: 'The Price of Freedom Book', price: '₹340', uploadedBy: 'Prof. Das', image: 'assets/priceoffreedom.png', status: 'Available' },
    { id: 21, name: '32 inch Smart TV', price: '₹11,200', uploadedBy: 'Abhishek B', image: 'assets/smarttv.png', status: 'Available' },
    { id: 22, name: 'Siberian Cat', price: '₹2,200', uploadedBy: 'Aisha Malik', image: 'assets/cat.png', status: 'Available' }
  ];

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