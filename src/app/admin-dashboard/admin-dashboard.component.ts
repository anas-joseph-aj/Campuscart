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

  // 3. POPULATE CATEGORIES SIDEBAR PERCENTAGES 
  categoriesOverview: any[] = [];

  // 4. POPULATE SPAM REPORTS DATA ITEMS
  spamReports: any[] = [];

  constructor(private adminService: AdminService) { }

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
        
        // Resolve seller name
        const sellerInfo = p.seller || p.owner || p.user || p.sellerInfo;
        let sellerName = '';
        if (sellerInfo && typeof sellerInfo === 'object') {
          sellerName = sellerInfo.name || sellerInfo.fullName || sellerInfo.displayName || sellerInfo.username || sellerInfo.userName || sellerInfo.email || '';
        } else if (typeof sellerInfo === 'string') {
          sellerName = sellerInfo;
        }
        if (!sellerName && p.sellerName) {
          sellerName = p.sellerName;
        }
        if (!sellerName && p.sellerEmail) {
          sellerName = p.sellerEmail.split('@')[0];
        }
        if (!sellerName) {
          sellerName = 'Unknown';
        }

        // Normalize image URL
        let imgUrl = p.image || p.imageUrl || '';
        if (imgUrl && !imgUrl.startsWith('http') && !imgUrl.startsWith('assets/')) {
          imgUrl = imgUrl.startsWith('/') ? `http://10.204.205.47:8080${imgUrl}` : `http://10.204.205.47:8080/${imgUrl}`;
        }
        if (!imgUrl) {
          imgUrl = 'assets/placeholder.png';
        }

        return {
          ...p,
          amount,
          seller: sellerName,
          imageUrl: imgUrl
        };
      });
      this.sortProductsByInactiveFirst();
    });
  this.adminService.getCategorySummary().subscribe(categories => {
    this.categoriesOverview = categories.map(c => ({
      name: c.category,
      percentage: c.count,
      colorHex: '#'+((Math.random()*0xFFFFFF<<0).toString(16)),
      barColorClass: 'bg-[#'+((Math.random()*0xFFFFFF<<0).toString(16))+']'
    }));
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