import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface AdminProfile {
  id: string;
  name: string;
  email: string;
  passcode: string;
}

export interface DashboardCounts {
  totalUsers: number;
  totalProducts: number;
  totalCategories: number;
  totalReports: number;
}

export interface CategorySummary {
  category: string;
  count: number;
}

export interface Report {
  id: string;
  reportNumber: string;
  reason: string;
  status: string;
  // Backend fields (optional)
  reportedBy?: string; // reporter email
  reportedUserName?: string; // name of reported user
  screenshot?: string; // profile image path of reporter
  // UI-friendly fields
  userName?: string;
  userImage?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private baseUrl = 'http://10.46.75.118:8080';

  constructor(private http: HttpClient) { }

  // ---------- Authentication ----------
  login(email: string, passcode: string): Observable<string> {
    const payload: any = { email, passcode };
    // Assuming backend returns plain text message on success/failure
    return this.http.post(`${this.baseUrl}/admin/login`, payload, { responseType: 'text' });
  }

  getProfile(): Observable<AdminProfile> {
    return this.http.get<AdminProfile>(`${this.baseUrl}/admin/profile`);
  }

  updateProfile(profile: Partial<AdminProfile>): Observable<AdminProfile> {
    return this.http.put<AdminProfile>(`${this.baseUrl}/admin/profile`, profile);
  }

  changePassword(oldPasscode: string, newPasscode: string): Observable<string> {
    return this.http.put(`${this.baseUrl}/admin/change-password`, {
      oldPasscode,
      newPasscode
    }, { responseType: 'text' });
  }

  // ---------- Dashboard ----------
  getDashboardCounts(): Observable<DashboardCounts> {
    return this.http.get<DashboardCounts>(`${this.baseUrl}/admin/dashboard`, { withCredentials: true });
  }

  // New: Fetch analytics summary cards for admin-analytics page
  getAnalyticsCards(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/admin/analytics/report-cards`);
  }

  // New: User growth analytics
  getUserGrowth(): Observable<{ month: string, count: number }[]> {
    return this.http.get<{ month: string, count: number }[]>(`${this.baseUrl}/admin/analytics/user-growth`);
  }

  // New: Report summary for pie chart
  getReportSummary(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/admin/analytics/report-summary`);
  }

  // New: Get reports by status (PENDING, RESOLVED, REJECTED)
  getReportsByStatus(status: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/admin/reports/status/${status}`);
  }

  // New: Search reports by keyword
  searchReports(keyword: string): Observable<any[]> {
    const encoded = encodeURIComponent(keyword);
    return this.http.get<any[]>(`${this.baseUrl}/admin/reports/search/${encoded}`);
  }

  // New: Filter reports by reason
  getReportsByReason(reason: string): Observable<any[]> {
    const encoded = encodeURIComponent(reason);
    return this.http.get<any[]>(`${this.baseUrl}/admin/reports/reason/${encoded}`);
  }

  // New: Get report details
  getReportDetails(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/admin/report/${id}`);
  }

  // Normalize backend status values to UI-friendly strings
  private normalizeStatus(status: string): string {
    if (!status) return status;
    const map: { [key: string]: string } = {
      'inactive': 'sold',
      'active': 'available'
    };
    return map[status.toLowerCase()] || status;
  }

  // New: Update report status
  updateReportStatus(id: string, status: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/admin/report/status/${id}`, { status });
  }

  // Fetch latest reports (e.g., spam reports) and normalize status for UI
  getLatestReports(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/admin/reports/all`, { withCredentials: true }).pipe(
      map(reports => reports.map(r => ({
        ...r,
        // Map backend status to UI-friendly status
        displayStatus: this.normalizeStatus(r.status)
      })))
    );
  }

  // Fetch pending spam reports
  getSpamReports(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/admin/reports/reason/SPAM`, { withCredentials: true });
  }

  // New: Add admin notes to report
  updateReportNotes(id: string, notes: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/admin/report/notes/${id}`, { adminNotes: notes });
  }

  globalSearch(keyword: string): Observable<any> {
    const encoded = encodeURIComponent(keyword);
    return this.http.get<any>(`${this.baseUrl}/admin/search/${encoded}`);
  }

  getLatestProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/admin/products/latest`, { withCredentials: true });
  }

  /** Search products by keyword (admin) */
  searchProducts(keyword: string): Observable<any[]> {
    const encoded = encodeURIComponent(keyword);
    return this.http.get<any[]>(`${this.baseUrl}/admin/search/${encoded}`);
  }

  /** Get category summary for dashboard */
  getCategorySummary(): Observable<CategorySummary[]> {
    return this.http.get<CategorySummary[]>(`${this.baseUrl}/admin/categories/summary`, { withCredentials: true });
  }

  // ---------- Management ----------
  getAllProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/admin/products`);
  }



  getAllReports(): Observable<Report[]> {
    return this.http.get<Report[]>(`${this.baseUrl}/admin/reports/status/PENDING`);
  }

  // ---------- Review Management ----------
  // Get all reviews (admin)
  getReviews(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/admin/reviews`);
  }

  // Get pending reviews
  getPendingReviews(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/admin/reviews/pending`);
  }

  // Get reviews by status (APPROVED, DELETED, PENDING)
  getReviewsByStatus(status: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/admin/reviews/status/${status}`);
  }

  // Approve a review
  approveReview(id: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/admin/review/approve/${id}`, null);
  }

  // Delete (reject) a review
  deleteReview(id: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/admin/review/delete/${id}`, null);
  }

  // User management
  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/admin/users`);
  }

  searchUsers(keyword: string): Observable<any[]> {
    const encoded = encodeURIComponent(keyword);
    return this.http.get<any[]>(`${this.baseUrl}/admin/users/search/${encoded}`);
  }

  filterUsersByStatus(status: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/admin/users/status/${status}`);
  }

  sortUsersAsc(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/admin/users/sort/name-asc`);
  }

  sortUsersDesc(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/admin/users/sort/name-desc`);
  }

  updateUser(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/admin/user/${id}`, data);
  }

  updateUserStatus(id: string, status: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/admin/user/status/${id}`, { status });
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/admin/user/${id}`);
  }

  // Get user profile
  getUserProfile(email: string): Observable<any> {
    const encoded = encodeURIComponent(email);
    return this.http.get<any>(`${this.baseUrl}/user/profile/${encoded}`);
  }

  // ---------- Category Management ----------
  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/categories`);
  }

  addCategory(category: { name: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/categories/add`, category);
  }

  updateCategory(id: string, category: { name: string; icon?: string }): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/categories/${id}`, category);
  }

  deleteCategory(id: string): Observable<string> {
    return this.http.delete(`${this.baseUrl}/categories/${id}`, { responseType: 'text' });
  }

  // Utility method to build full image URL
  public buildImageUrl(path: string): string {
    if (!path) {
      return 'assets/empty.png';
    }
    if (path.startsWith('http') || path.startsWith('assets/')) {
      return path;
    }
    let cleanedPath = path.replace(/^[\\/]+/, '');
    if (!cleanedPath.includes('uploads/')) {
      cleanedPath = 'uploads/' + cleanedPath;
    }
    return `${this.baseUrl}/${cleanedPath}`;
  }

  // ---------- Search Category ----------
  searchCategories(keyword: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/categories/search/${keyword}`);
  }

  // ---------- Admin Product Management ----------
  getAdminProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/admin/products`, { withCredentials: true });
  }
  // Delete a product (admin)
  deleteProduct(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/admin/product/${id}`, { withCredentials: true });
  }

  // Update a product (admin)
  updateProduct(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/admin/product/${id}`, data, { withCredentials: true });
  }

  // Upload product images (admin)
  uploadImages(files: File[], email: string = 'admin@campuscart.com'): Observable<string[]> {
    const formData = new FormData();
    formData.append('userEmail', email);
    files.forEach(file => {
      formData.append('images', file, file.name);
    });
    return this.http.post<string[]>(`${this.baseUrl}/api/products/upload-images`, formData);
  }
}
