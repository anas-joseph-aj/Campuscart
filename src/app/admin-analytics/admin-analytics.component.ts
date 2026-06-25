import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

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
  iconPath: string;     // Kept for backward compatibility
  icon: string;         // Used for new Material Icons
  iconBg: string;       // Background color for table icon wrapper
  iconColor: string;    // Text color for table icon wrapper
}

interface UserGrowthMetric {
  label: string;
  value: number;
  percentage: number;
}

interface ReportTypeDistribution {
  label: string;
  value: number;
  percentage: number;
  color: string;
}

interface DetailedReportRecord {
  reportId: string;
  category: string;
  reportedUser: { name: string; email: string };
  reportedBy: { name: string; email: string };
  date: string;
  status: 'Pending' | 'Resolved' | 'Rejected';
}

@Component({
  selector: 'app-admin-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-analytics.component.html',
  styleUrls: ['./admin-analytics.component.css']
})
export class AdminAnalyticsComponent implements OnInit {
  // Navigation Tracking matching your HTML Template rules
  activeMenu: string = 'Analytics';

  // State Navigation View Control supporting the 3-Page Workflow
  currentView: 'summary' | 'detail' | 'single-report' = 'summary';
  selectedCategoryName: string = '';
  selectedReportItem: DetailedReportRecord | null = null; // Holds the payload for the active single report view

  // Local Filter States for Detail Panel
  searchQuery: string = '';
  statusFilter: string = 'All';

  // Custom Dropdown Control State
  isDropdownOpen: boolean = false;

  startDate: string = '2026-05-01';
  endDate: string = '2026-05-13';

  // Total summary values computed from Figma specifications
  totalUsersSum: number = 120;
  totalReportsSum: number = 152;

  // 1. Updated Stat Deck Cards to match the new Figma Design
  stats: StatCard[] = [
    { title: 'Total Reports', count: 152, iconType: 'total', colorClass: 'text-[#2BAE96]', bgClass: 'bg-[#EAF7F5]', borderClass: 'border-[#2BAE96]/30' },
    { title: 'Pending Reports', count: 24, iconType: 'pending', colorClass: 'text-amber-500', bgClass: 'bg-amber-50', borderClass: 'border-amber-500/30' },
    { title: 'Resolved Reports', count: 112, iconType: 'resolved', colorClass: 'text-emerald-500', bgClass: 'bg-emerald-50', borderClass: 'border-emerald-500/30' },
    { title: 'Rejected Reports', count: 16, iconType: 'rejected', colorClass: 'text-rose-500', bgClass: 'bg-rose-50', borderClass: 'border-rose-500/30' }
  ];

  // 2. New Data Array for User Growth distribution chart
  userGrowth: UserGrowthMetric[] = [
    { label: 'Jan', value: 32, percentage: 26 },
    { label: 'Feb', value: 45, percentage: 38 },
    { label: 'Mar', value: 58, percentage: 48 },
    { label: 'Apr', value: 78, percentage: 65 },
    { label: 'May', value: 95, percentage: 79 },
    { label: 'Jun', value: 120, percentage: 100 }
  ];

  // 3. New Data Array for Reports distribution breakdown chart
  reportsByType: ReportTypeDistribution[] = [
    { label: 'User Disputes', value: 52, percentage: 34, color: '#2BAE96' },
    { label: 'Product Issues', value: 38, percentage: 25, color: '#F59E0B' },
    { label: 'Payment Problems', value: 28, percentage: 18, color: '#8B5CF6' },
    { label: 'Technical Issues', value: 18, percentage: 12, color: '#EF4444' },
    { label: 'Other', value: 16, percentage: 11, color: '#6B7280' }
  ];

  // 4. Updated tabular breakdown structure matching Figma styling properties
  reportSummary: ReportRow[] = [
    { type: 'User Disputes', total: 52, pending: 8, resolved: 40, rejected: 4, iconPath: 'spam', icon: 'gavel', iconBg: '#EAF7F5', iconColor: '#2BAE96' },
    { type: 'Product Issues', total: 38, pending: 5, resolved: 31, rejected: 2, iconPath: 'fake', icon: 'inventory_2', iconBg: '#FEF3C7', iconColor: '#D97706' },
    { type: 'Payment Problems', total: 28, pending: 6, resolved: 20, rejected: 2, iconPath: 'prohibited', icon: 'payments', iconBg: '#F3E8FF', iconColor: '#7C3AED' },
    { type: 'Technical Issues', total: 18, pending: 3, resolved: 14, rejected: 1, iconPath: 'irrelevant', icon: 'report_problem', iconBg: '#FEE2E2', iconColor: '#DC2626' },
    { type: 'Other', total: 16, pending: 2, resolved: 13, rejected: 1, iconPath: 'others', icon: 'more_horiz', iconBg: '#F3F4F6', iconColor: '#4B5563' }
  ];

  // 5. Updated Mock Records matching the newly adapted Figma Category Types 
  masterDetailRecords: DetailedReportRecord[] = [
    { reportId: '#REP-0021A', category: 'User Disputes', reportedUser: { name: 'John Doe', email: 'johndoe@kristujayanti.com' }, reportedBy: { name: 'Alice Smith', email: 'alice.s@kristujayanti.com' }, date: '2026-05-12T14:32:00', status: 'Pending' },
    { reportId: '#REP-0022B', category: 'User Disputes', reportedUser: { name: 'Jane Reed', email: 'janereed@kristujayanti.com' }, reportedBy: { name: 'Bob Johnson', email: 'bjohnson@kristujayanti.com' }, date: '2026-05-11T09:15:00', status: 'Resolved' },
    { reportId: '#REP-0023C', category: 'User Disputes', reportedUser: { name: 'Mark Miller', email: 'miller.m@kristujayanti.com' }, reportedBy: { name: 'Charlie Brown', email: 'cbrown@kristujayanti.com' }, date: '2026-05-10T18:45:00', status: 'Rejected' },
    { reportId: '#REP-0031A', category: 'Product Issues', reportedUser: { name: 'FakeBot One', email: 'bot1@kristujayanti.com' }, reportedBy: { name: 'Grace Hopper', email: 'grace@kristujayanti.com' }, date: '2026-05-12T10:00:00', status: 'Pending' },
    { reportId: '#REP-0041B', category: 'Payment Problems', reportedUser: { name: 'Bad Seller', email: 'badseller@kristujayanti.com' }, reportedBy: { name: 'Frank Castle', email: 'punisher@kristujayanti.com' }, date: '2026-05-11T15:30:00', status: 'Resolved' }
  ];

  filteredDetailRecords: DetailedReportRecord[] = [];

  constructor() { }

  ngOnInit(): void {
    this.resetDetailedFilters();
  }

  /**
   * Sets the tracking string state for sidebar element interaction rules
   */
  setActiveMenu(menuName: string): void {
    this.activeMenu = menuName;
  }

  /**
   * Page 1 -> Page 2: Displays detailed category list items table
   */
  onViewDetails(row: ReportRow): void {
    this.selectedCategoryName = row.type;
    this.currentView = 'detail';
    this.applyDetailedFilters();
  }

  /**
   * Page 2 -> Page 3: Displays details for a single selected complaint item
   */
  onViewSingleReport(item: DetailedReportRecord): void {
    this.selectedReportItem = item;
    this.currentView = 'single-report';
  }

  /**
   * Page 3 -> Page 2: Navigates back from single inspection to category listing table
   */
  goBackToList(): void {
    this.currentView = 'detail';
    this.selectedReportItem = null;
  }

  /**
   * Page 2 -> Page 1: Resets active views and moves back to Dashboard Overview Summary
   */
  navigateToSummary(): void {
    this.currentView = 'summary';
    this.selectedCategoryName = '';
    this.selectedReportItem = null;
    this.searchQuery = '';
    this.statusFilter = 'All';
    this.isDropdownOpen = false;
  }

  /**
   * Computes layout filtering sets matching text parameters and chosen status contexts
   */
  applyDetailedFilters(): void {
    this.filteredDetailRecords = this.masterDetailRecords.filter(record => {
      const matchesCategory = record.category === this.selectedCategoryName;
      const matchesStatus = this.statusFilter === 'All' || record.status === this.statusFilter;

      const search = this.searchQuery.trim().toLowerCase();
      const matchesSearch = !search ||
        record.reportedUser.name.toLowerCase().includes(search) ||
        record.reportedUser.email.toLowerCase().includes(search) ||
        record.reportedBy.name.toLowerCase().includes(search) ||
        record.reportedBy.email.toLowerCase().includes(search) ||
        record.reportId.toLowerCase().includes(search);

      return matchesCategory && matchesStatus && matchesSearch;
    });
  }

  /**
   * Selects an option programmatically via the custom layout drop-down menu
   */
  selectStatusOption(option: string): void {
    if (this.currentView === 'single-report' && this.selectedReportItem) {
      if (option === 'Pending' || option === 'Resolved' || option === 'Rejected') {
        this.selectedReportItem.status = option;
      }
    } else {
      this.statusFilter = option;
      this.applyDetailedFilters();
    }
    this.isDropdownOpen = false;
  }

  /**
   * Resets parameters back to default values
   */
  resetDetailedFilters(): void {
    this.searchQuery = '';
    this.statusFilter = 'All';
    this.isDropdownOpen = false;
    this.applyDetailedFilters();
  }

  openReportModal(item: DetailedReportRecord): void {
    console.log(`Loading inspection payload structure for target reference ID: ${item.reportId}`);
    alert(`Inspecting details file context for item: ${item.reportId}\nReported User: ${item.reportedUser.name}\nStatus: ${item.status}`);
  }

  exportToCSV(): void {
    console.log(`Generating down-stream analytical report file structure for category: ${this.selectedCategoryName}`);
    alert(`Downloading parsed CSV data extraction payload layout block matching current filters.`);
  }

  openRangePicker(event: MouseEvent, startInput: HTMLInputElement): void {
    if (typeof startInput.showPicker === 'function') {
      startInput.showPicker();
    }
  }

  onStartDateSelected(endInput: HTMLInputElement): void {
    this.onDateFilterChange();
    setTimeout(() => {
      if (typeof endInput.showPicker === 'function') {
        endInput.showPicker();
      }
    }, 100);
  }

  onDateFilterChange(): void {
    console.log(`Active date scope modified: ${this.startDate} up to ${this.endDate}`);
  }
}