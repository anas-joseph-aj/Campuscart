import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface Product {
  name: string;
  category: string;
  seller: string;
  amount: number;
  status: 'Available' | 'Sold' | 'Pending';
  showMenu?: boolean;
}

interface SpamReport {
  initial: string;
  username: string;
  reason: string;
  status: string;
  dotColor: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {

  activeMenu: string = 'Dashboard';

  // Tracks what view to show: 'dashboard', 'products', or 'reports'
  currentView: 'dashboard' | 'products' | 'reports' = 'dashboard';

  // Metrics Counters
  totalUsers: number = 145;
  totalCategories: number = 10;
  totalProducts: number = 27;
  totalReports: number = 4;

  // Latest Products Data Array
  latestProducts: Product[] = [
    { name: 'Apple MacBook Pro', category: 'Electronics', seller: 'Rohit Verma', amount: 85000, status: 'Available', showMenu: false },
    { name: 'Cricket Bat', category: 'Sports', seller: 'Jacob Mathew', amount: 850, status: 'Available', showMenu: false },
    { name: 'Apple iPhone 11', category: 'Electronics', seller: 'Verma', amount: 39000, status: 'Sold', showMenu: false }
  ];

  // Spam Reports Data Array
  spamReports: SpamReport[] = [
    { initial: 'V', username: 'Verma', reason: 'Selling Prohibited Items', status: 'Pending', dotColor: 'bg-rose-500' },
    { initial: 'R', username: 'Rahul Madhav', reason: 'Fake Account', status: 'Pending', dotColor: 'bg-amber-400' },
    { initial: 'J', username: 'Jacob Mathew', reason: 'Spam', status: 'Pending', dotColor: 'bg-blue-400' }
  ];

  constructor() { }

  ngOnInit(): void { }

  setActiveMenu(menuName: string): void {
    this.activeMenu = menuName;
    // Reset view if they switch sidebar tabs
    if (menuName === 'Dashboard') {
      this.currentView = 'dashboard';
    }
  }

  setView(view: 'dashboard' | 'products' | 'reports'): void {
    this.currentView = view;
  }

  toggleProductMenu(product: Product, event: Event): void {
    event.stopPropagation();
    product.showMenu = !product.showMenu;
  }

  updateProductStatus(product: Product, newStatus: 'Available' | 'Sold'): void {
    product.status = newStatus;
    product.showMenu = false;
    console.log(`Changes Saved: ${product.name} updated to ${newStatus}.`);
  }

  removeReport(report: SpamReport): void {
    this.spamReports = this.spamReports.filter(r => r !== report);
    this.totalReports--;
  }
}