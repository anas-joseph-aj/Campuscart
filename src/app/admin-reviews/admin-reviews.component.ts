import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { AdminService } from '../services/admin.service';

interface Review {
  id?: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
  status: 'Approved' | 'Pending' | 'Deleted';
  rawReview?: any;
}

@Component({
  selector: 'app-admin-reviews',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    SharedModule
  ],
  templateUrl: './admin-reviews.component.html',
  styleUrls: ['./admin-reviews.component.css']
})
export class AdminReviewsComponent implements OnInit {

  activeMenu = 'Reviews';
  reviews: Review[] = [];
  allReviews: Review[] = [];
  filterStatus: 'Approved' | 'Pending' | 'Deleted' | 'ALL' = 'ALL';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(): void {
    this.adminService.getReviews().subscribe(
      (data) => {
        this.allReviews = data.map((r: any) => this.mapBackendReview(r));
        this.filterReviews(this.filterStatus);
      },
      (error) => {
        console.error('Failed to load reviews', error);
      }
    );
  }

  mapBackendReview(r: any): Review {
    return {
      id: r.id || r._id,
      name: r.userEmail || 'Anonymous',
      rating: r.rating || 5,
      comment: r.comment || '',
      date: r.date || r.createdAt ? new Date(r.createdAt || r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'June 17, 2026',
      status: this.mapBackendStatus(r.status),
      rawReview: r
    };
  }

  mapBackendStatus(status: string | null): 'Approved' | 'Pending' | 'Deleted' {
    if (!status) return 'Pending';
    const s = status.toUpperCase();
    if (s === 'APPROVED') return 'Approved';
    if (s === 'DELETED') return 'Deleted';
    return 'Pending';
  }

  filterReviews(status: 'Approved' | 'Pending' | 'Deleted' | 'ALL'): void {
    this.filterStatus = status;
    if (status === 'ALL') {
      this.reviews = [...this.allReviews];
    } else if (status === 'Pending') {
      this.adminService.getPendingReviews().subscribe(
        (data) => {
          this.reviews = data.map((r: any) => this.mapBackendReview(r));
        },
        (error) => {
          console.error('Failed to load pending reviews', error);
        }
      );
    } else {
      const backendStatus = status === 'Approved' ? 'APPROVED' : 'DELETED';
      this.adminService.getReviewsByStatus(backendStatus).subscribe(
        (data) => {
          this.reviews = data.map((r: any) => this.mapBackendReview(r));
        },
        (error) => {
          console.error(`Failed to load ${status} reviews`, error);
        }
      );
    }
  }

  setActiveMenu(menu: string): void {
    this.activeMenu = menu;
  }

  /* APPROVE REVIEW */
  approveReview(index: number): void {
    const review = this.reviews[index];
    if (review && review.id) {
      this.adminService.approveReview(review.id).subscribe(
        () => {
          review.status = 'Approved';
          this.loadReviews();
        },
        (error) => {
          console.error('Approve failed', error);
          alert('Failed to approve review');
        }
      );
    }
  }

  /* MARK AS PENDING */
  markPending(index: number): void {
    const review = this.reviews[index];
    review.status = 'Pending';
  }

  /* DELETE REVIEW */
  deleteReview(index: number): void {
    const review = this.reviews[index];
    if (review && review.id) {
      this.adminService.deleteReview(review.id).subscribe(
        () => {
          review.status = 'Deleted';
          this.loadReviews();
        },
        (error) => {
          console.error('Delete failed', error);
          alert('Failed to delete review');
        }
      );
    }
  }

  /* COUNTERS */
  get approvedCount(): number {
    return this.allReviews.filter(
      review => review.status === 'Approved'
    ).length;
  }

  get pendingCount(): number {
    return this.allReviews.filter(
      review => review.status === 'Pending'
    ).length;
  }

  get deletedCount(): number {
    return this.allReviews.filter(
      review => review.status === 'Deleted'
    ).length;
  }

  /* STARS */
  getStars(rating: number): string[] {
    return Array(rating).fill('★');
  }
}