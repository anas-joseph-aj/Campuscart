import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../services/api.service';

import { AdminService } from '../services/admin.service';
import { forkJoin } from 'rxjs';

interface Product {
  id?: string | number;
  name: string;
  category: string;
  seller: string;
  amount: number;
  status: 'Available' | 'Sold' | 'Pending';
  showMenu?: boolean;
  image?: string;
}

interface SpamReport {
  id?: string;
  initial: string;
  username: string;
  reason: string;
  status: string;
  dotColor: string;
  image?: string;
}

interface CategoryOverview {
  category: string;
  count: number;
  percentage?: number;
  color?: string;
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

  // Metrics Counters (Initialized with fallback defaults)
  totalUsers: number = 0;
  totalCategories: number = 0;
  totalProducts: number = 0;
  totalReports: number = 0;

  // Latest Products Data Array
  latestProducts: Product[] = [
    { name: 'Apple MacBook Pro', category: 'Electronics', seller: 'Rohit Verma', amount: 85000, status: 'Available', showMenu: false },
    { name: 'Cricket Bat', category: 'Sports', seller: 'Jacob Mathew', amount: 850, status: 'Available', showMenu: false },
    { name: 'Apple iPhone 11', category: 'Electronics', seller: 'Verma', amount: 39000, status: 'Sold', showMenu: false }
  ];

  // Categories Overview (progress bars / chart)
  categoriesOverview: CategoryOverview[] = [
    { category: 'Electronics', count: 9, percentage: 85, color: 'bg-[#2BAE96]' },
    { category: 'Donation', count: 3, percentage: 35, color: 'bg-indigo-500' },
    { category: 'Books', count: 2, percentage: 22, color: 'bg-blue-500' },
    { category: 'Furniture', count: 2, percentage: 22, color: 'bg-amber-500' }
  ];

  // Spam Reports Data Array
  spamReports: SpamReport[] = [
    { initial: 'V', username: 'Verma', reason: 'Selling Prohibited Items', status: 'Pending', dotColor: 'bg-rose-500' },
    { initial: 'R', username: 'Rahul Madhav', reason: 'Fake Account', status: 'Pending', dotColor: 'bg-amber-400' },
    { initial: 'J', username: 'Jacob Mathew', reason: 'Spam', status: 'Pending', dotColor: 'bg-blue-400' }
  ];

  constructor(private adminService: AdminService, private apiService: ApiService) { }

  ngOnInit(): void {
    this.loadDashboardCounts();
    this.loadLatestProducts();
    this.loadCategoriesSummary();
    this.loadLatestReports();
  }

  loadDashboardCounts(): void {
    this.adminService.getDashboardCounts().subscribe({
      next: (data) => {
        console.log('Dashboard API response:', data);
        if (data) {
          this.totalUsers = data.totalUsers ?? this.totalUsers;
          this.totalCategories = data.totalCategories ?? this.totalCategories;
          this.totalProducts = data.totalProducts ?? this.totalProducts;
          this.totalReports = data.totalReports ?? this.totalReports;
        }
      },
      error: (err) => console.warn('Failed to load dashboard summary cards from API. Using defaults.', err)
    });
  }

  loadLatestProducts(): void {
    this.adminService.getLatestProducts().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.latestProducts = data.map(p => {
            const imgUrl = (Array.isArray(p.images) && p.images.length > 0) ? p.images[0] : undefined;
            return {
              id: p.id,
              name: p.name || 'Unknown Product',
              category: p.category || 'Uncategorized',
              seller: p.sellerName || p.sellerEmail?.split('@')[0] || 'Unknown Seller',
              amount: typeof p.price === 'number' ? p.price : Number(p.amount) || 0,
              status: p.status?.toUpperCase() === 'SOLD' ? 'Sold' : (p.status?.toUpperCase() === 'PENDING' ? 'Pending' : 'Available'),
              image: imgUrl,
              showMenu: false
            };
          });
        }
      },
      error: (err) => console.warn('Failed to load latest products from API. Using defaults.', err)
    });
  }

  loadCategoriesSummary(): void {
    this.adminService.getCategorySummary().subscribe({
      next: (summary) => {
        if (summary && summary.length > 0) {
          const colors = ['bg-[#2BAE96]', 'bg-indigo-500', 'bg-blue-500', 'bg-amber-500', 'bg-[#8247FF]', 'bg-[#FF1E47]'];
          const maxCount = Math.max(...summary.map(c => c.count)) || 1;
          
          this.categoriesOverview = summary.map((c, index) => ({
            category: c.category,
            count: c.count,
            percentage: Math.round((c.count / maxCount) * 100),
            color: colors[index % colors.length]
          }));
        } else {
          this.loadMockCategoriesSummary();
        }
      },
      error: (err) => {
        console.warn('Failed to load categories summary from API. Using defaults.', err);
        this.loadMockCategoriesSummary();
      }
    });
  }

  private loadMockCategoriesSummary(): void {
    const mockSummary = [
      { category: 'Electronics', count: 9 },
      { category: 'Donation', count: 3 },
      { category: 'Books', count: 2 },
      { category: 'Furniture', count: 2 },
      { category: 'Fashion', count: 0 },
      { category: 'Pets', count: 0 },
      { category: 'Kitchen', count: 0 },
      { category: 'Vehicle', count: 0 },
      { category: 'Sports', count: 0 },
      { category: 'Miscellaneous', count: 0 }
    ];
    const colors = ['bg-[#2BAE96]', 'bg-indigo-500', 'bg-blue-500', 'bg-amber-500', 'bg-[#8247FF]', 'bg-[#FF1E47]'];
    const maxCount = Math.max(...mockSummary.map(c => c.count)) || 1;
    this.categoriesOverview = mockSummary.map((c, index) => ({
      category: c.category,
      count: c.count,
      percentage: Math.round((c.count / maxCount) * 100),
      color: colors[index % colors.length]
    }));
  }

  loadLatestReports(): void {
    this.adminService.getSpamReports().subscribe({
      next: (data) => {
        console.log('Spam reports API response:', data);
        if (data && data.length > 0) {
          const colors = ['bg-rose-500', 'bg-amber-400', 'bg-blue-400', 'bg-indigo-400', 'bg-purple-400'];
          this.spamReports = data.map((r, index) => {
            // Extract username from email if provided
            const email = r.reportedUserEmail || r.reportedUser || r.reportedUserName || r.reportedBy || '';
            const username = email.includes('@') ? email.split('@')[0] : email || 'Unknown User';
            const imgUrl = r.screenshot ? this.adminService.buildImageUrl(r.screenshot) : 'assets/empty.png';
            return {
              id: r.id || r._id,
              initial: username.charAt(0).toUpperCase(),
              username: username,
              reason: r.reason || 'Spam / Abuse',
              status: r.status || 'Pending',
              dotColor: colors[index % colors.length],
              image: imgUrl
            } as any;
          });
          this.totalReports = this.spamReports.length;
        }
      },
      error: (err) => console.warn('Failed to load spam reports from API. Using defaults.', err)
    });
  }

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
    if (product.id) {
      const updatedStatusBackend = newStatus === 'Sold' ? 'SOLD' : 'AVAILABLE';
      this.adminService.updateProduct(product.id.toString(), { status: updatedStatusBackend }).subscribe({
        next: () => {
          console.log(`Changes Saved: ${product.name} updated to ${newStatus} on backend.`);
        },
        error: (err) => {
          console.error('Failed to update product status on backend:', err);
        }
      });
    } else {
      console.log(`Changes Saved (local only): ${product.name} updated to ${newStatus}.`);
    }
  }

  removeReport(report: SpamReport): void {
    const reportId = report.id;
    // Optimistically remove from list
    this.spamReports = this.spamReports.filter(r => r !== report);
    this.totalReports = Math.max(0, this.totalReports - 1);

    if (reportId) {
      this.adminService.updateReportStatus(reportId.toString(), 'RESOLVED').subscribe({
        next: () => {
          // Status updated successfully on backend
        },
        error: (err) => console.warn('Failed to update report status to RESOLVED on backend.', err)
      });
    }
  }
}