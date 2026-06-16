import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';

interface Review {
  name: string;
  rating: number;
  comment: string;
  date: string;
  status: 'Approved' | 'Pending' | 'Deleted';
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
export class AdminReviewsComponent {

  activeMenu = 'Reviews';

  reviews: Review[] = [
    {
      name: 'Verma',
      rating: 5,
      comment: 'Great condition, exactly as described!',
      date: 'May 28, 2026',
      status: 'Approved'
    },
    {
      name: 'Rahul Mathew',
      rating: 4,
      comment: 'Works perfectly, minor scratches noted.',
      date: 'May 30, 2026',
      status: 'Approved'
    },
    {
      name: 'Jacob Thomas',
      rating: 5,
      comment: 'Decent lamp but delivery was slow.',
      date: 'May 18, 2026',
      status: 'Approved'
    },
    {
      name: 'Rahul Verma',
      rating: 4,
      comment: 'Sounds amazing, great deal!',
      date: 'May 31, 2026',
      status: 'Pending'
    },
    {
      name: 'Arjun M',
      rating: 3,
      comment: 'Product was okay.',
      date: 'June 02, 2026',
      status: 'Deleted'
    }
  ];

  setActiveMenu(menu: string): void {
    this.activeMenu = menu;
  }

  /* APPROVE REVIEW */

  approveReview(index: number): void {
    this.reviews[index].status = 'Approved';
  }

  /* MARK AS PENDING */

  markPending(index: number): void {
    this.reviews[index].status = 'Pending';
  }

  /* DELETE REVIEW */

  deleteReview(index: number): void {
    this.reviews[index].status = 'Deleted';
  }

  /* COUNTERS */

  get approvedCount(): number {
    return this.reviews.filter(
      review => review.status === 'Approved'
    ).length;
  }

  get pendingCount(): number {
    return this.reviews.filter(
      review => review.status === 'Pending'
    ).length;
  }

  get deletedCount(): number {
    return this.reviews.filter(
      review => review.status === 'Deleted'
    ).length;
  }

  /* STARS */

  getStars(rating: number): string[] {
    return Array(rating).fill('★');
  }
}