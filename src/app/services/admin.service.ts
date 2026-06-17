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
  private baseUrl = 'http://10.204.205.47:8080';

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
    return this.http.get<DashboardCounts>(`${this.baseUrl}/admin/dashboard`);
  }

  globalSearch(keyword: string): Observable<any> {
    const encoded = encodeURIComponent(keyword);
    return this.http.get<any>(`${this.baseUrl}/admin/search/${encoded}`);
  }

  getLatestProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/admin/products/latest`);
  }

  /** Search products by keyword (admin) */
  searchProducts(keyword: string): Observable<any[]> {
    const encoded = encodeURIComponent(keyword);
    return this.http.get<any[]>(`${this.baseUrl}/admin/search/${encoded}`);
  }

  getCategorySummary(): Observable<CategorySummary[]> {
    return this.http.get<CategorySummary[]>(`${this.baseUrl}/admin/categories/summary`);
  }

  getLatestReports(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/admin/reports/latest`).pipe(
      map(reports => reports.map(r => ({
        userName: r.reportedUserName ?? r.reportedBy ?? '',
        reason: r.reason,
        userImage: r.screenshot ?? ''
      })))
    );
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
