import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // REQUIRED for [(ngModel)]
import { SharedModule } from '../../shared/shared.module';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-feedback',
  standalone: true, // IMPORTANT: Must be true
  imports: [CommonModule, FormsModule, SharedModule], // REQUIRED: Imports go here for standalone
  templateUrl: './feedback.component.html'
})
export class FeedbackComponent {
  rating: number = 0;
  feedbackText: string = '';
  isSubmitting: boolean = false;
  errorMessage: string = '';

  constructor(private router: Router, private apiService: ApiService) {}

  setRating(val: number) {
    this.rating = val;
  }

  submitFeedback() {
    if (this.rating === 0) {
      alert('Please select a rating!');
      return;
    }

    const userEmail = localStorage.getItem('email') || '';
    if (!userEmail) {
      this.errorMessage = 'Unable to identify user. Please log in again.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const payload = {
      userEmail: userEmail,
      rating: this.rating,
      feedback: this.feedbackText
    };

    this.apiService.submitFeedback(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/feedback-success']);
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Feedback submission failed:', err);
        this.errorMessage = 'Failed to submit feedback. Please try again.';
      }
    });
  }
}