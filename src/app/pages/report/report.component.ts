import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { ApiService } from '../../services/api.service';
import { ProductService, Product } from '../../product.service';



interface ReportedUser {
  id: number;
  name: string;
  email?: string;
}

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css'],
  standalone: true,
  imports: [CommonModule, SharedModule]
})
export class ReportComponent implements OnInit {
  constructor(private router: Router, private route: ActivatedRoute, private apiService: ApiService, private productService: ProductService) {}

  // Existing methods ...

  navigateToHome(): void {
    // Navigate to the home page directly
    this.router.navigate(['/home']);
    // Optionally reset form state after navigation
    this.clearFormStates();
  }

  public navigateToRelated(id: number): void {
    // Navigate to the related product and scroll to top for immediate view
    this.router.navigate(['/product', id]);
  }

ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const sellerName = params['sellerName'] || 'Unknown Seller';
      const sellerEmail = params['sellerEmail'] || '';
      this.reportedUser = { id: 0, name: sellerName, email: sellerEmail };
    });
  }

  isSubmitted: boolean = false;
  showValidationError: boolean = false;
  
  // Report ID returned from backend
  reportNumber: string = '';

  selectedReason: string = '';
  additionalDetails: string = '';
  
  selectedFileName: string | null = null;
  selectedFileRaw: File | null = null;

  reportedUser: ReportedUser = {
    id: 1088,
    name: 'Rohit Sharma',
    email: 'rohit@example.com'
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

    // Retrieve logged-in user email from localStorage (or implement a proper UserService later)
    const reportedBy = localStorage.getItem('email') || '';

    const reportPayload: any = {
      reportedBy: reportedBy,
      reportedUserEmail: this.reportedUser.email || '',
      reportedUserName: this.reportedUser.name,
      reason: this.selectedReason,
      details: this.additionalDetails,
      screenshot: ''
    };

    const uploadIfNeeded = () => {
      // If a file is selected, upload it first
      if (this.selectedFileRaw) {
        this.apiService.uploadReportScreenshot(this.selectedFileRaw).subscribe({
          next: (path: string) => {
            reportPayload.screenshot = path || '';
            this.sendReport(reportPayload);
          },
          error: (err) => {
            console.error('Screenshot upload failed', err);
            // Still attempt to send report without screenshot
            this.sendReport(reportPayload);
          }
        });
      } else {
        this.sendReport(reportPayload);
      }
    };

    uploadIfNeeded();
  }

  private sendReport(payload: any): void {
    this.apiService.submitReport(payload).subscribe({
      next: (res) => {
        console.log('Report submitted successfully', res);
        this.reportNumber = res.reportNumber || res.id || 'UNKNOWN';
        this.isSubmitted = true;
        // Removed navigation to home to keep user on success view displaying the report ID
      },
      error: (err) => {
        console.error('Report submission failed', err);
        this.showValidationError = true;
      }
    });
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
    if (this.reportedUser.email) {
      this.router.navigate(['/profile'], {
        queryParams: { email: this.reportedUser.email }
      });
    } else {
      this.router.navigate(['/profile']);
    }
  }



  // Global Navigation Layout Links Handlers
  onSell(): void { console.log('Sell button handler triggered'); }
  onMessages(): void { console.log('Messages view link toggled'); }
  onWishlist(): void { console.log('Wishlist bucket context opened'); }
  onProfile(): void { console.log('User account dashboard targeted'); }
  onLogout(): void { console.log('Authentication profile session cleared'); }
}