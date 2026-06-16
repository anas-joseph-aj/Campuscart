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
  iconPath: string;
}

interface PieCategory {
  name: string;
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

  stats: StatCard[] = [
    { title: 'Total Reports', count: 152, iconType: 'total', colorClass: 'text-[#2BAE96]', bgClass: 'bg-[#EAF7F5]', borderClass: 'border-[#2BAE96]/30' },
    { title: 'Pending Reports', count: 24, iconType: 'pending', colorClass: 'text-[#E28743]', bgClass: 'bg-[#FFF8F2]', borderClass: 'border-[#E28743]/30' },
    { title: 'Resolved Reports', count: 112, iconType: 'resolved', colorClass: 'text-[#20963E]', bgClass: 'bg-[#EDF7EE]', borderClass: 'border-[#20963E]/30' },
    { title: 'Rejected Reports', count: 16, iconType: 'rejected', colorClass: 'text-[#FB2C36]', bgClass: 'bg-[#FFF2F3]', borderClass: 'border-[#FB2C36]/30' }
  ];

  pieCategories: PieCategory[] = [
    { name: 'Spam Reports', percentage: 42, color: '#26C0AB' },
    { name: 'Fake Accounts', percentage: 24, color: '#3B82F6' },
    { name: 'Prohibited Items', percentage: 18, color: '#F59E0B' },
    { name: 'Irrelevant Content', percentage: 10, color: '#A78BFA' },
    { name: 'Others', percentage: 6, color: '#6B7280' }
  ];

  reportSummary: ReportRow[] = [
    { type: 'Spam Reports', total: 64, pending: 10, resolved: 48, rejected: 6, iconPath: 'spam' },
    { type: 'Fake Accounts', total: 36, pending: 6, resolved: 26, rejected: 4, iconPath: 'fake' },
    { type: 'Prohibited Items', total: 27, pending: 5, resolved: 19, rejected: 3, iconPath: 'prohibited' },
    { type: 'Irrelevant Content', total: 15, pending: 2, resolved: 11, rejected: 2, iconPath: 'irrelevant' },
    { type: 'Others', total: 10, pending: 1, resolved: 8, rejected: 1, iconPath: 'others' }
  ];

  masterDetailRecords: DetailedReportRecord[] = [
    { reportId: '#REP-0021A', category: 'Spam Reports', reportedUser: { name: 'John Doe', email: 'johndoe@kristujayanti.com' }, reportedBy: { name: 'Alice Smith', email: 'alice.s@kristujayanti.com' }, date: '2026-05-12T14:32:00', status: 'Pending' },
    { reportId: '#REP-0022B', category: 'Spam Reports', reportedUser: { name: 'Jane Reed', email: 'janereed@kristujayanti.com' }, reportedBy: { name: 'Bob Johnson', email: 'bjohnson@kristujayanti.com' }, date: '2026-05-11T09:15:00', status: 'Resolved' },
    { reportId: '#REP-0023C', category: 'Spam Reports', reportedUser: { name: 'Mark Miller', email: 'miller.m@kristujayanti.com' }, reportedBy: { name: 'Charlie Brown', email: 'cbrown@kristujayanti.com' }, date: '2026-05-10T18:45:00', status: 'Rejected' },
    { reportId: '#REP-0024D', category: 'Spam Reports', reportedUser: { name: 'Sarah Connor', email: 'sconnor@kristujayanti.com' }, reportedBy: { name: 'David El', email: 'david.el@kristujayanti.com' }, date: '2026-05-09T11:20:00', status: 'Resolved' },
    { reportId: '#REP-0025E', category: 'Spam Reports', reportedUser: { name: 'Alex Mercer', email: 'amercer@kristujayanti.com' }, reportedBy: { name: 'Emma Watson', email: 'emma.w@kristujayanti.com' }, date: '2026-05-08T16:10:00', status: 'Pending' },
    { reportId: '#REP-0031A', category: 'Fake Accounts', reportedUser: { name: 'FakeBot One', email: 'bot1@kristujayanti.com' }, reportedBy: { name: 'Grace Hopper', email: 'grace@kristujayanti.com' }, date: '2026-05-12T10:00:00', status: 'Pending' },
    { reportId: '#REP-0041B', category: 'Prohibited Items', reportedUser: { name: 'Bad Seller', email: 'badseller@kristujayanti.com' }, reportedBy: { name: 'Frank Castle', email: 'punisher@kristujayanti.com' }, date: '2026-05-11T15:30:00', status: 'Resolved' }
  ];

  filteredDetailRecords: DetailedReportRecord[] = [];

  constructor() { }

  ngOnInit(): void {
    this.resetDetailedFilters();
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
      // Direct assignment mutations to update active view object text state changes smoothly
      if (option === 'Pending' || option === 'Resolved' || option === 'Rejected') {
        this.selectedReportItem.status = option;
      }
    } else {
      // Maintain standard table list component layout scope filtration
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