import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-reviews',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-reviews.component.html',
  styleUrls: ['./admin-reviews.component.css']
})
export class AdminReviewsComponent {

  activeMenu = 'Reviews';

  deletedCount = 0;

  reviews = [

    {
      name: 'Rohit Verma',
      rating: 5,
      text: 'Reliable seller, items always match description. Highly recommended!',
      date: 'May 14, 2026',
      avatar: 'R'
    },

    {
      name: 'Jacob Mathew',
      rating: 4,
      text: 'Quick responses and fair pricing. Had one minor delay but overall good experience.',
      date: 'May 30, 2026',
      avatar: 'J'
    },

    {
      name: 'Rahul Madhav',
      rating: 3,
      text: 'Product was okay but communication could be better. Average experience.',
      date: 'May 18, 2026',
      avatar: 'R'
    },

    {
      name: 'Priya Singh',
      rating: 5,
      text: 'Excellent buyer! Payment was instant and very friendly to deal with.',
      date: 'May 31, 2026',
      avatar: 'P'
    },

    {
      name: 'Ankit Gupta',
      rating: 4,
      text: 'Good seller, honest about product condition. Would buy again.',
      date: 'June 1, 2026',
      avatar: 'A'
    },

    {
      name: 'Rahul Verma',
      rating: 2,
      text: 'Item not as described. Seller was unresponsive to concerns.',
      date: 'June 2, 2026',
      avatar: 'R'
    }

  ];

  setActiveMenu(menu: string): void {

    this.activeMenu = menu;

  }

  deleteReview(index: number): void {

    const confirmDelete = confirm(
      'Are you sure you want to delete this review?'
    );

    if (confirmDelete) {

      this.reviews.splice(index, 1);

      this.deletedCount++;

    }

  }

  getStars(rating: number): number[] {

    return Array(rating).fill(0);

  }

  getEmptyStars(rating: number): number[] {

    return Array(5 - rating).fill(0);

  }

}