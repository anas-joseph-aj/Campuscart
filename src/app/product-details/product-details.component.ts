import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Product, ProductService } from '../product.service';
import { SharedModule } from '../shared/shared.module';
import { ApiService } from '../services/api.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterModule, SharedModule],
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent implements OnInit {
  product?: Product;
  liked = false;
  relatedProducts: Product[] = [];

  sellerName = 'Seller';
  sellerDept = 'Not specified';
  sellerJoined = '';
  sellerImage: SafeUrl = '' as any;
  sellerLoaded = false;



  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private apiService: ApiService,
    private sanitizer: DomSanitizer
  ) { }

  private resolveSellerEmail(product: Product): string | undefined {
    return product.sellerEmail ||
      (product as any).seller?.email ||
      (product as any).seller?.userEmail ||
      (product as any).seller?.emailAddress ||
      (product as any).seller?.contactEmail ||
      (product as any).seller?.emailId ||
      (product as any).user?.email ||
      (product as any).owner?.email ||
      (product as any).sellerEmailAddress;
  }

  private resolveSellerNameFromProduct(product: Product): string {
    const sellerInfo = product.seller || (product as any).owner || (product as any).user || (product as any).sellerInfo;
    
    // If sellerInfo is an object, extract name from it
    if (sellerInfo && typeof sellerInfo === 'object') {
      const candidates = [
        sellerInfo.name,
        sellerInfo.fullName,
        sellerInfo.displayName,
        sellerInfo.username,
        sellerInfo.userName,
        sellerInfo.firstName,
        sellerInfo.first_name,
        sellerInfo.accountName,
        sellerInfo.storeName
      ];
      
      for (const candidate of candidates) {
        if (candidate && typeof candidate === 'string' && candidate.trim()) {
          return candidate.trim();
        }
      }
      
      // Try combining first and last name
      const firstName = sellerInfo.firstName || sellerInfo.first_name || '';
      const lastName = sellerInfo.lastName || sellerInfo.last_name || '';
      if (firstName || lastName) {
        return [firstName, lastName].filter(Boolean).map((n: any) => n.toString().trim()).join(' ');
      }
    }

    const name = product.sellerName || (typeof sellerInfo === 'string' ? sellerInfo : '');
    
    // If we have a seller email, extract name from it as last resort
    if (!name && product.sellerEmail) {
      return product.sellerEmail.split('@')[0] || '';
    }
    
    return name;
  }

  private resolveSellerNameFromProfile(profile: any): string {
    if (!profile || typeof profile !== 'object') {
      return '';
    }

    // Try common field names for seller name
    const candidates = [
      profile.name,
      profile.fullName,
      profile.full_name,
      profile.displayName,
      profile.display_name,
      profile.username,
      profile.user_name,
      profile.sellerName,
      profile.seller_name,
      profile.userName,
      profile.userFullName,
      profile.user_full_name,
      profile.accountName,
      profile.account_name,
      profile.contactName,
      profile.contact_name,
      profile.profileName,
      profile.profile_name,
      profile.title,
      profile.storeName,
      profile.store_name,
      profile.businessName,
      profile.business_name,
      profile.companyName,
      profile.company_name,
      profile.firstName,
      profile.first_name,
      profile.lastName,
      profile.last_name
    ];

    // Find first non-empty candidate
    for (const candidate of candidates) {
      if (candidate && typeof candidate === 'string' && candidate.trim()) {
        return candidate.trim();
      }
    }

    // Try combining first and last names
    const firstName = profile.firstName || profile.first_name || '';
    const lastName = profile.lastName || profile.last_name || '';
    if (firstName || lastName) {
      const combined = [firstName, lastName]
        .filter(Boolean)
        .map((n: any) => n.toString().trim())
        .join(' ');
      if (combined.trim()) {
        return combined.trim();
      }
    }

    return '';
  }

  private resolveSellerDepartment(profile: any): string {
    if (!profile || typeof profile !== 'object') {
      return 'Not specified';
    }

    // Check various department/role/designation field names
    const deptFields = [
      profile.department,
      profile.dept,
      profile.branch,
      profile.faculty,
      profile.designation,
      profile.title,
      profile.position,
      profile.role,
      profile.company,
      profile.businessType,
      profile.business_type,
      profile.category,
      profile.department_name,
      profile.user_department,
      profile.user_dept,
      profile.seller_category,
      profile.seller_department,
      profile.storeName,
      profile.store_name,
      profile.job_title,
      profile.job_type,
      profile.occupation,
      profile.job_title_name,
      profile.jobTitle,
      profile.businessLine
    ];

    // Find first non-empty department field
    for (const field of deptFields) {
      if (field && typeof field === 'string' && field.trim() && field.toLowerCase() !== 'not specified') {
        return field.trim();
      }
    }

    // If not found in direct fields, try nested objects
    const nested = profile.user || profile.data || profile.profile || profile.result || profile.seller;
    if (nested && typeof nested === 'object' && nested !== profile) {
      const nestedDept = this.resolveSellerDepartment(nested);
      if (nestedDept !== 'Not specified') {
        return nestedDept;
      }
    }

    return 'Not specified';
  }

  private resolveSellerDepartmentFromProduct(product: Product): string {
    const sellerInfo = product.seller || (product as any).owner || (product as any).user || (product as any).sellerInfo;
    
    if (sellerInfo && typeof sellerInfo === 'object') {
      return this.resolveSellerDepartment(sellerInfo);
    }
    
    return 'Not specified';
  }

  private isValidName(name: string): boolean {
    if (!name) return false;
    if (name.includes('@')) return false;
    if (/^[0-9]+[a-zA-Z]+[0-9]+$/.test(name)) return false;
    return true;
  }

  ngOnInit() {
    // Initialize default seller image safely
    this.sellerImage = this.sanitizer.bypassSecurityTrustUrl('assets/profileicon-details.png');
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        // Fetch product details
        this.apiService.getProductById(idParam).subscribe(product => {
          if (product && product.sold) {
            // If product is sold, hide it completely by leaving this.product as undefined
            return;
          }
          this.product = product;
          this.liked = product.liked;
          
          // Get seller email - this is crucial for fetching profile
          const sellerEmail = this.resolveSellerEmail(product);

          // First, try to get seller name from product itself (if available)
          const sellerNameFromProduct = this.resolveSellerNameFromProduct(product);
          if (this.isValidName(sellerNameFromProduct)) {
            this.sellerName = sellerNameFromProduct;
          }
          
          // Try to get department from product itself (if available)
          const deptFromProduct = this.resolveSellerDepartmentFromProduct(product);
          if (deptFromProduct !== 'Not specified') {
            this.sellerDept = deptFromProduct;
          }

          // Now fetch full seller profile from API
          if (sellerEmail) {
            this.apiService.getSellerProfile(sellerEmail).subscribe(
              profile => {
                let profileData = profile;
                
                // Get name from profile
                const nameFromProfile = this.resolveSellerNameFromProfile(profileData);
                
                if (nameFromProfile && this.isValidName(nameFromProfile)) {
                  this.sellerName = nameFromProfile;
                } else if (!this.isValidName(this.sellerName)) {
                  // If still no valid name, use email or fallback
                  this.sellerName = sellerEmail.split('@')[0] || 'Seller';
                }
                
                // Get department info - IMPORTANT: Always try to get this
                const dept = this.resolveSellerDepartment(profileData);
                if (dept !== 'Not specified') {
                  this.sellerDept = dept;
                }
                
                // Get join date
                if (profileData.createdAt) {
                  this.sellerJoined = new Date(profileData.createdAt).toLocaleDateString();
                } else if (profileData.created_at) {
                  this.sellerJoined = new Date(profileData.created_at).toLocaleDateString();
                } else if (profileData.joinedDate) {
                  this.sellerJoined = new Date(profileData.joinedDate).toLocaleDateString();
                } else if (profileData.joined_date) {
                  this.sellerJoined = new Date(profileData.joined_date).toLocaleDateString();
                } else {
                  this.sellerJoined = 'Recently';
                }
                
                // Get profile image
                const profileImagePath = profileData.profileImage || profileData.profile_image;
                const normalizedSellerImage = this.apiService.normalizeImageUrl(profileImagePath);
                if (normalizedSellerImage) {
                  this.sellerImage = this.sanitizer.bypassSecurityTrustUrl(normalizedSellerImage);
                }
                

                // Final validation for name
                if (!this.isValidName(this.sellerName)) {
                  this.sellerName = sellerEmail.split('@')[0] || 'Seller';
                }
                
                this.sellerLoaded = true;
              },
              err => {
                // Profile fetch failed - ensure we have at least a fallback
                if (!this.isValidName(this.sellerName)) {
                  this.sellerName = sellerEmail.split('@')[0] || 'Seller';
                }
                this.sellerLoaded = true;
              }
            );
          } else {
            // No email found, ensure we have at least a seller name
            if (!this.isValidName(this.sellerName)) {
              this.sellerName = 'Seller';
            }
            this.sellerLoaded = true;
          }
          
          // Fetch related products from backend
          this.apiService.getAvailableProducts().subscribe(products => {
            // Filter out the current product and any sold products
            this.relatedProducts = products
              .filter(p => String(p.id) !== idParam && !p.sold)
              .slice(0, 3);
            this.relatedProducts.forEach(p => p.liked = false);
          });
        }, error => {
          console.error('Failed to load product details from API', error);
          // Fallback: ensure seller info is initialized with defaults
          if (!this.isValidName(this.sellerName)) {
            this.sellerName = 'Seller';
          }
          this.sellerLoaded = true;
        });
      } else {
        this.product = undefined;
        this.relatedProducts = [];
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  navigateToRelated(productId: number) {
    this.router.navigate(['/product', productId]);
  }

  toggleMainLike() {
    if (!this.product) {
      return;
    }
    this.product.liked = !this.product.liked;
    this.liked = this.product.liked;
  }

  toggleRelatedLike(product: Product) {
    product.liked = !product.liked;
  }

  navigateToAllProducts(): void {
    this.router.navigate(['/products']);
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }

  navigateToShare(): void {
    if (this.product) {
      this.router.navigate(['/product', this.product.id, 'share']);
    }
  }

  navigateToChat(): void {
    if (this.product) {
      const sellerEmail = this.resolveSellerEmail(this.product) || '';
      this.router.navigate(['/chat'], {
        queryParams: {
          receiverEmail: sellerEmail,
          receiverName: this.sellerName || 'Seller',
          productId: this.product.id
        }
      });
    } else {
      this.router.navigate(['/chat']);
    }
  }

  navigateToReport(): void {
    if (this.product) {
      this.router.navigate(['/report'], {
        queryParams: {
          sellerName: this.sellerName || 'Unknown Seller',
          sellerEmail: this.product.sellerEmail || ''
        }
      });
    } else {
      this.router.navigate(['/report']);
    }
  }
}