import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AdminUsersComponent } from '../admin-users/admin-users.component'; 

@Component({
  selector: 'app-app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    AdminUsersComponent
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  currentView: string = 'dashboard'; 
  searchQuery: string = '';
  activeMenu: string = 'Dashboard';
  showEditModal: boolean = false;
  selectedProduct: any = null;

  // 1. METRIC CARD DATA RESTORED COMPLETELY
  metrics = [
    { title: 'Total Users', value: '1,248', iconType: 'users', colorClass: 'border-teal-100' },
    { title: 'Total Categories', value: '10', iconType: 'categories', colorClass: 'border-indigo-100' },
    { title: 'Active Products', value: '482', iconType: 'products', colorClass: 'border-sky-100' },
    { title: 'Spam Reports', value: '14', iconType: 'reports', colorClass: 'border-red-100' }
  ];

  // 2. POPULATE LATEST PRODUCTS TABLE ROW ITEMS (With Inactive sorting applied)
  latestProducts = [
    {
      id: 1,
      name: 'Engineering Physics Textbook',
      category: 'Books',
      seller: 'Rahul Sharma',
      amount: '₹450',
      status: 'Active',
      imageUrl: 'assets/book-placeholder.png' 
    },
    {
      id: 2,
      name: 'Scientific Calculator fx-991EX',
      category: 'Electronics',
      seller: 'Anjali Priya',
      amount: '₹999',
      status: 'Active',
      imageUrl: 'assets/calc-placeholder.png'
    },
    {
      id: 3,
      name: 'Badminton Racket Yonex',
      category: 'Sports',
      seller: 'Sneha K.',
      amount: '₹1,200',
      status: 'Inactive',
      imageUrl: 'assets/sports-placeholder.png'
    },
    {
      id: 4,
      name: 'Lab Apron - Medium size',
      category: 'Uniforms',
      seller: 'Vikram Singh',
      amount: '₹250',
      status: 'Active',
      imageUrl: 'assets/apron-placeholder.png'
    }
  ];

  // 3. POPULATE CATEGORIES SIDEBAR PERCENTAGES 
  categoriesOverview = [
    { name: 'Books & Notes', percentage: 35, colorHex: '#26C0AB', barColorClass: 'bg-[#26C0AB]' },
    { name: 'Electronics', percentage: 25, colorHex: '#4F46E5', barColorClass: 'bg-[#4F46E5]' },
    { name: 'Sports Equipment', percentage: 18, colorHex: '#F59E0B', barColorClass: 'bg-[#F59E0B]' },
    { name: 'Lab Uniforms', percentage: 14, colorHex: '#EF4444', barColorClass: 'bg-[#EF4444]' },
    { name: 'Cycle & Transport', percentage: 8, colorHex: '#A855F7', barColorClass: 'bg-[#A855F7]' }
  ];

  // 4. POPULATE SPAM REPORTS DATA ITEMS
  spamReports = [
    { id: 101, userName: 'John Doe', avatarInitial: 'J', reason: 'Listing fake promotional item link.' },
    { id: 102, userName: 'Amit Kumar', avatarInitial: 'A', reason: 'Selling defective item masquerading as new.' },
    { id: 103, userName: 'Priya Nair', avatarInitial: 'P', reason: 'Harassment reported in direct seller messages.' }
  ];

  constructor() { }

  ngOnInit(): void { 
    // Automatically sorts the items so 'Inactive' comes first when the dashboard loads
    this.sortProductsByInactiveFirst();
  }

  // Sorting utility logic
  sortProductsByInactiveFirst(): void {
    this.latestProducts.sort((a, b) => {
      if (a.status === 'Inactive' && b.status !== 'Inactive') return -1;
      if (a.status !== 'Inactive' && b.status === 'Inactive') return 1;
      return 0;
    });
  }

  viewAllSection(sectionType: string): void {
    if (sectionType === 'Products') {
      this.currentView = 'allProducts';
    } else if (sectionType === 'Reports') {
      this.currentView = 'allReports';
    }
  }

  setActiveMenu(menuName: string): void {
    this.activeMenu = menuName;
  }

  onGlobalSearch(): void {
    console.log('Searching for:', this.searchQuery);
  }

  removeReport(id: any): void {
    this.spamReports = this.spamReports.filter(r => r.id !== id);
  }

  saveProductStatus(): void {
    this.showEditModal = false;
    if (this.selectedProduct) {
      console.log('Updated state for:', this.selectedProduct.name, 'Status:', this.selectedProduct.status);
      this.sortProductsByInactiveFirst();
    }
  }
}