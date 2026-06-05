import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Explicitly imported

interface ReportedUser {
  id: number;
  name: string;
}

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [CommonModule], // Added here to fix template compilation errors
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent {
  isSubmitted: boolean = false;
  showValidationError: boolean = false;

  selectedReason: string = '';
  additionalDetails: string = '';

  selectedFileName: string | null = null;
  selectedFileRaw: File | null = null;

  reportedUser: ReportedUser = {
    id: 1088,
    name: 'Rohit Sharma'
  };

  reportReasons: string[] = [
    'Fake Account',
    'Scam / Fraud',
    'Harassment / Bullying',
    'Inappropriate Behavior',
    'Spam',
    'Selling Prohibited Items',
    'Other'
  ];

  selectReason(option: string): void {
    this.selectedReason = option;
    this.showValidationError = false;
  }

  onDetailsChange(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    if (target.value.length <= 500) {
      this.additionalDetails = target.value;
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedFileName = file.name;
      this.selectedFileRaw = file;
    }
  }

  clearSelectedFile(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.selectedFileName = null;
    this.selectedFileRaw = null;
  }

  submitFormDirectly(): void {
    if (!this.selectedReason) {
      this.showValidationError = true;
      return;
    }

    const reportPayload = {
      reportedUserId: this.reportedUser.id,
      reportedUserName: this.reportedUser.name,
      reason: this.selectedReason,
      details: this.additionalDetails,
      fileName: this.selectedFileName
    };

    console.log('Report package compiled and delivered safely:', reportPayload);
    this.isSubmitted = true;
  }

  cancelReport(): void {
    this.clearFormStates();
    this.navigateToHome();
  }

  clearFormStates(): void {
    this.selectedReason = '';
    this.additionalDetails = '';
    this.selectedFileName = null;
    this.selectedFileRaw = null;
    this.showValidationError = false;
    this.isSubmitted = false;
  }

  viewProfile(userId: number): void {
    console.log(`Routing view tracking link reference targeting User Profile ID: ${userId}`);
  }

  navigateToHome(): void {
    console.log('Redirecting workspace window reference to main app home layout.');
    this.clearFormStates();
  }

  // Global Navigation Layout Links Handlers
  onSell(): void { console.log('Sell button handler triggered'); }
  onMessages(): void { console.log('Messages view link toggled'); }
  onWishlist(): void { console.log('Wishlist bucket context opened'); }
  onProfile(): void { console.log('User account dashboard targeted'); }
  onLogout(): void { console.log('Authentication profile session cleared'); }
}