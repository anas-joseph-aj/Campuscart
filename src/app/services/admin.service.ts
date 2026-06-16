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
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private baseUrl = 'http://10.204.205.47:8080';

  constructor(private http: HttpClient) {}

  // ---------- Authentication ----------
  login(email: string, passcode: string): Observable<string> {
    const body = { email, passcode };
    // Assuming backend returns plain text message on success/failure
    return this.http.post(`${this.baseUrl}/admin/login`, body, { responseType: 'text' });
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

  getCategorySummary(): Observable<CategorySummary[]> {
    return this.http.get<CategorySummary[]>(`${this.baseUrl}/admin/categories/summary`);
  }

  getLatestReports(): Observable<Report[]> {
    return this.http.get<Report[]>(`${this.baseUrl}/admin/reports/latest`);
  }

  // ---------- Management ----------
  getAllProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/admin/products`);
  }

  getAllReports(): Observable<Report[]> {
    return this.http.get<Report[]>(`${this.baseUrl}/admin/reports/status/PENDING`);
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
}
