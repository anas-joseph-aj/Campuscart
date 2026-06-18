import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService } from '../services/admin.service';

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
  dasharray: string;
  dashoffset: number;
}

interface DetailedReportRecord {
  internalId: string;
  reportId: string;
  category: string;
  reportedUser: { name: string; email: string };
  reportedBy: { name: string; email: string };
  date: string;
  status: 'Pending' | 'Resolved' | 'Rejected';
  details: string;
  screenshot: string;
  reportedUserImage?: string;
  reportedByImage?: string;
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
    { title: 'Total Reports', count: 0, iconType: 'total', colorClass: 'text-[#2BAE96]', bgClass: 'bg-[#EAF7F5]', borderClass: 'border-[#2BAE96]/30' },
    { title: 'Pending Reports', count: 0, iconType: 'pending', colorClass: 'text-[#E28743]', bgClass: 'bg-[#FFF8F2]', borderClass: 'border-[#E28743]/30' },
    { title: 'Resolved Reports', count: 0, iconType: 'resolved', colorClass: 'text-[#20963E]', bgClass: 'bg-[#EDF7EE]', borderClass: 'border-[#20963E]/30' },
    { title: 'Rejected Reports', count: 0, iconType: 'rejected', colorClass: 'text-[#FB2C36]', bgClass: 'bg-[#FFF2F3]', borderClass: 'border-[#FB2C36]/30' }
  ];
  pieCategories: PieCategory[] = [];

  reportSummary: ReportRow[] = [];

  masterDetailRecords: DetailedReportRecord[] = [];

  filteredDetailRecords: DetailedReportRecord[] = [];

  // User growth data
  growth: { month: string, count: number }[] = [];
  // SVG path data for user growth line chart
  growthPath: string = '';
  growthFillPath: string = '';
  growthPoints: { cx: number; cy: number }[] = [];

  constructor(private adminService: AdminService, private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loadDashboardData();
    this.loadReports('PENDING');
    this.resetDetailedFilters();
  }

  /**
   * Page 1 -> Page 2: Displays detailed category list items table
   */
  onViewDetails(row: ReportRow): void {
    this.selectedCategoryName = row.type;
    this.currentView = 'detail';
    // Load reports for this reason/category
    this.adminService.getReportsByReason(row.type).subscribe((reports: any[]) => {
      this.masterDetailRecords = reports.map(r => ({
        internalId: r.id,
        reportId: r.reportNumber || r.id,
        category: r.reason,
        reportedUser: { name: r.reportedUserName ?? r.reportedBy ?? '', email: r.reportedUserEmail ?? '' },
        reportedBy: { name: '', email: r.reportedBy || '' },
        date: r.createdAt,
        status: r.status,
        details: r.details || '',
        screenshot: r.screenshot || ''
      }));
      // After mapping, fetch profile images for each record
      this.enrichRecordsWithImages(this.masterDetailRecords);
      this.applyDetailedFilters();
    });
  }

  /**
   * Page 2 -> Page 3: Displays details for a single selected complaint item
   */
  onViewSingleReport(item: DetailedReportRecord): void {
    this.selectedReportItem = item;
    this.currentView = 'single-report';

    if (!item.reportedUserImage && item.reportedUser.email) {
      this.adminService.getUserProfile(item.reportedUser.email).subscribe(profile => {
        if (profile && profile.profileImage) {
          item.reportedUserImage = this.getScreenshotUrl(profile.profileImage);
        }
        this.cd.detectChanges();
      });
    }

    if (!item.reportedByImage && item.reportedBy.email) {
      this.adminService.getUserProfile(item.reportedBy.email).subscribe(profile => {
        if (profile && profile.profileImage) {
          item.reportedByImage = this.getScreenshotUrl(profile.profileImage);
        }
        this.cd.detectChanges();
      });
    }
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
        this.selectedReportItem.status = option as any;
        // Persist status change using the internal database ID
        this.adminService.updateReportStatus(this.selectedReportItem.internalId, option).subscribe({
          next: () => {
            // Update the master record
            const record = this.masterDetailRecords.find(r => r.internalId === this.selectedReportItem!.internalId);
            if (record) {
              record.status = option as any;
            }
            // Refresh all dashboard data so pie chart, summary table and stats reflect the new counts
            this.refreshAllData();
          },
          error: (err) => console.error('Failed to update report status', err)
        });
      }
    } else {
      // Filter the table list component layout scope filtration
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

  refreshAllData(): void {
    // Reload all dashboard pieces: counts, growth, and report summary
    this.loadDashboardData();
  }

  /** Load dashboard counts and chart data */
  loadDashboardData(): void {
    // Counts
    this.adminService.getAnalyticsCards().subscribe({
      next: (summary) => {
        if (summary) {
          this.stats[0].count = summary.totalReports || 0;
          this.stats[1].count = summary.pendingReports || 0;
          this.stats[2].count = summary.resolvedReports || 0;
          this.stats[3].count = summary.rejectedReports || 0;
        }
      },
      error: (err) => console.error('Failed to load analytics cards', err)
    });
    // User growth
    this.adminService.getUserGrowth().subscribe({
      next: (data) => {
        this.growth = data;
        this.computeGrowthPath();
      },
      error: (err) => console.error('Failed to load user growth', err)
    });
    // Report summary for pie chart and summary table
    this.refreshReportSummary();
  }

  refreshReportSummary(): void {
    this.adminService.getReportSummary().subscribe({
      next: (summary: any[]) => {
        if (!summary || !Array.isArray(summary)) return;
        const total = summary.reduce((s, r) => s + (r.total || 0), 0) || 1;
        let cumulativeOffset = 0;
        // Populate pieCategories with colors
        this.pieCategories = summary.map(r => {
          const percentage = Math.round((r.total / total) * 100);
          const dasharray = `${percentage} ${100 - percentage}`;
          const dashoffset = -cumulativeOffset;
          cumulativeOffset += percentage;
          
          return {
            name: r.reason,
            percentage,
            color: this.getPieColor(r.reason),
            dasharray,
            dashoffset
          };
        });
        this.reportSummary = summary.map(r => ({
          type: r.reason,
          total: r.total || 0,
          pending: r.pending || 0,
          resolved: r.resolved || 0,
          rejected: r.rejected || 0,
          iconPath: r.reason ? r.reason.toLowerCase().replace(/\s+/g, '') : 'others'
        }));
      },
      error: (err) => console.error('Failed to load report summary', err)
    });
  }

  /** Load reports for a given status (PENDING, RESOLVED, REJECTED) */
  loadReports(status: string): void {
    this.adminService.getReportsByStatus(status).subscribe((reports: any[]) => {
      // Map backend report to DetailedReportRecord format
      this.masterDetailRecords = reports.map(r => ({
        internalId: r.id,
        reportId: r.reportNumber || r.id,
        category: r.reason,
        reportedUser: { name: r.reportedUserName || r.reportedBy || '', email: r.reportedUserEmail || '' },
        reportedBy: { name: '', email: r.reportedBy || '' },
        date: r.createdAt,
        status: r.status,
        details: r.details || '',
        screenshot: r.screenshot || ''
      }));
      // Enrich with profile images
      this.enrichRecordsWithImages(this.masterDetailRecords);
      this.applyDetailedFilters();
    });
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

  // Helper to fetch and assign profile images for reported user and reporter
  private enrichRecordsWithImages(records: DetailedReportRecord[]): void {
    // Use forkJoin to parallelize profile fetches
    const observables = records.map(rec => {
      const userObs = rec.reportedUser.email ? this.adminService.getUserProfile(rec.reportedUser.email) : null;
      const byObs = rec.reportedBy.email ? this.adminService.getUserProfile(rec.reportedBy.email) : null;
      return {
        rec,
        userObs,
        byObs
      };
    });

    // Process each record individually to avoid nesting
    observables.forEach(item => {
      if (item.userObs) {
        item.userObs.subscribe(profile => {
          if (profile && profile.profileImage) {
            item.rec.reportedUserImage = this.getScreenshotUrl(profile.profileImage);
          }
          this.cd.detectChanges();
        });
      }
      if (item.byObs) {
        item.byObs.subscribe(profile => {
          if (profile && profile.profileImage) {
            item.rec.reportedByImage = this.getScreenshotUrl(profile.profileImage);
          }
          this.cd.detectChanges();
        });
      }
    });
  }

  private computeGrowthPath(): void {
    if (!this.growth || this.growth.length === 0) {
      this.growthPath = '';
      this.growthFillPath = '';
      this.growthPoints = [];
      return;
    }
    const width = 700;
    const height = 175; // The bottom baseline height for rendering graph
    const maxCount = Math.max(...this.growth.map(g => g.count)) || 1;
    const xStep = width / (Math.max(this.growth.length - 1, 1));
    
    this.growthPoints = this.growth.map((g, i) => {
      const x = Math.round(i * xStep);
      const y = Math.round(height - (g.count / maxCount) * height);
      return { cx: x, cy: y };
    });

    const pointsStr = this.growthPoints.map(p => `${p.cx},${p.cy}`).join(' L ');
    this.growthPath = `M ${pointsStr}`;
    this.growthFillPath = `M ${pointsStr} L ${width},${height} L 0,${height} Z`;
  }

  // Compute total reports from reportSummary
  public getTotalReports(): number {
    if (!this.reportSummary) return 0;
    return this.reportSummary.reduce((sum, r) => sum + (r.total || 0), 0);
  }
  public getPieColor(reason: string): string {
    const palette = [
      '#4A90E2', '#50E3C2', '#B8E986', '#F5A623', '#D0021B',
      '#9013FE', '#8B572A', '#7ED321', '#417505', '#BD10E0'
    ];
    const index = Math.abs(this.hashString(reason)) % palette.length;
    return palette[index];
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }

  getScreenshotUrl(path: string): string {
    if (!path) return '';
    // Use the backend URL or the exact URL the user requested as fallback
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path : '/' + path;
    // Fallback to baseUrl
    return `http://10.204.205.47:8080${cleanPath}`;
  }

  onDateFilterChange(): void {
    console.log(`Active date scope modified: ${this.startDate} up to ${this.endDate}`);
  }
}