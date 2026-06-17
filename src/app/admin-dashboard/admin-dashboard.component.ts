import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AdminService } from '../services/admin.service';
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
  metrics: any[] = [];

  // 2. POPULATE LATEST PRODUCTS TABLE ROW ITEMS (With Inactive sorting applied)
  latestProducts: any[] = [];

  pieGradient: string = '';
  categoriesOverview: any[] = [];

  // 4. POPULATE SPAM REPORTS DATA ITEMS
  spamReports: any[] = [];

  constructor(public adminService: AdminService) { }

  ngOnInit(): void {
  // Load dashboard data from backend
  this.adminService.getDashboardCounts().subscribe(counts => {
    this.metrics = [
      { title: 'Total Users', value: counts.totalUsers.toString(), iconType: 'users', colorClass: 'border-teal-100' },
      { title: 'Total Categories', value: counts.totalCategories.toString(), iconType: 'categories', colorClass: 'border-indigo-100' },
      { title: 'Active Products', value: counts.totalProducts.toString(), iconType: 'products', colorClass: 'border-sky-100' },
      { title: 'Spam Reports', value: counts.totalReports.toString(), iconType: 'reports', colorClass: 'border-red-100' }
    ];
  });
    this.adminService.getLatestProducts().subscribe(products => {
        this.latestProducts = products.map(p => {
          // Map backend price to amount
          const amount = p.price ?? p.amount ?? '';

          // Resolve seller name directly from API
          const sellerName = p.sellerName ?? 'Unknown';
          // Resolve image URL from images array
          let imgUrl = this.adminService.buildImageUrl((p.images && p.images.length > 0) ? p.images[0] : p.image);

          return {
            ...p,
            amount,
            statusDisplay: p.status,
            sellerName,
            imageUrl: imgUrl
          } as any;
        });
      });
      this.sortProductsByInactiveFirst();
    this.adminService.getCategorySummary().subscribe(categories => {
        // Ensure 'Donation' category exists, add with count 0 if missing
        const donationExists = categories.some(c => c.category.toLowerCase() === 'donation');
        if (!donationExists) {
          categories.push({ category: 'Donation', count: 0 });
        }
        // Total number of products across all categories (for percentages)
        const totalProducts = categories.reduce((sum, c) => sum + (c.count || 0), 0) || 1;
        // Number of distinct categories (for Total Categories metric)
        const categoryCount = categories.length;
        // Professional colour palette (10 distinct colours)
        const palette = [
          '#4A90E2', // blue
          '#50E3C2', // teal
          '#B8E986', // lime
          '#F5A623', // orange
          '#D0021B', // red
          '#9013FE', // purple
          '#8B572A', // brown
          '#7ED321', // green
          '#417505', // dark green
          '#BD10E0'  // magenta
        ];
        this.categoriesOverview = categories.map((c, i) => {
          const hex = palette[i % palette.length];
          const perc = Math.round(((c.count || 0) / totalProducts) * 100);
          return {
            name: c.category,
            percentage: perc,
            colorHex: hex,
            barColorClass: ''
          } as any;
        });
        // Build CSS conic-gradient string for pie chart using same colours
        const gradientParts = this.categoriesOverview.map(cat => `${cat.colorHex} ${cat.percentage}%`).join(', ');
        this.pieGradient = `conic-gradient(${gradientParts})`;
        // Debug logs
        console.log('Categories Overview:', this.categoriesOverview);
        console.log('Total products count:', totalProducts);
        // Update total categories metric to reflect number of distinct categories
        const totalCategoriesMetric = this.metrics.find(m => m.title === 'Total Categories');
        if (totalCategoriesMetric) {
          totalCategoriesMetric.value = categoryCount.toString();
        }

      });
  this.adminService.getLatestReports().subscribe(reports => {
    this.spamReports = reports;
  });
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