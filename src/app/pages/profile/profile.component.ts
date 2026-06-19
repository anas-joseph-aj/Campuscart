import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { ApiService } from '../../services/api.service';
import { WishlistService } from '../../services/wishlist.service';
import { Subscription } from 'rxjs';
interface SellerProduct { id: number; title: string; price: number; priceDisplay: string; status: string; image: string; deactivateDate?: string; }
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {
  isEditMode: boolean = true;

  userName: string = '';
  userDept: string = '';
  userRole: string = '';

  private productRefreshSubscription: Subscription | null = null;
  private routerSubscription: Subscription | null = null;

  userEmail: string = '';
  userJoinedDate: string = '';

  profileImageUrl: string = '';

  selectedImageFile: File | null = null; // Store the actual file for upload

  message: string = '';
  isError: boolean = false;
  isSaving: boolean = false; // Track saving state

  // Track the custom layout dropdown popover state
  isImageMenuOpen: boolean = false;

  productsListed: number = 0;
  productsSold: number = 0;
  wishlistItems: number = 0;
  recentProducts: SellerProduct[] = [];

  private initialLoadDone = false;
  isOwnProfile: boolean = true;

  constructor(private router: Router, private route: ActivatedRoute, private apiService: ApiService, private wishlistService: WishlistService) {
    // Refresh product stats whenever we navigate back to the profile page
    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd && event.urlAfterRedirects.includes('/profile')) {
        // Avoid duplicate call on initial load (ngOnInit will also call loadSellerData)
        if (!this.initialLoadDone) {
          this.initialLoadDone = true;
          return;
        }
        this.loadSellerData();
      }
    });
  }

  ngOnInit(): void {
    // Load cached profile if present to avoid unnecessary create-profile UI
    const cachedProfile = localStorage.getItem('profile');
    if (cachedProfile) {
      const profile = JSON.parse(cachedProfile);
      this.userName = profile.name || profile.userName || '';
      this.userDept = profile.department || profile.userDept || '';
      this.userRole = profile.role || profile.userRole || '';
      this.profileImageUrl = this.apiService.normalizeImageUrl(profile.profileImage || profile.profile_image) || '';
      this.isEditMode = false; // Existing user
    }

    this.route.queryParams.subscribe(params => {
      const loggedInEmail = localStorage.getItem('email') || '';
      const targetEmail = params['email'] || loggedInEmail || 'student@kristujayanti.com';
      this.userEmail = targetEmail;
      this.isOwnProfile = (targetEmail === loggedInEmail);

      if (this.isOwnProfile) {
        this.userJoinedDate = 'Loading...';
        
        this.apiService.getSellerProfile(this.userEmail).subscribe(profile => {
          if (profile) {
            localStorage.setItem('profile', JSON.stringify(profile));
          }
          this.userName = profile.name || '';
          this.userDept = profile.department || '';
          this.userRole = profile.role || '';
          this.userJoinedDate = profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('default', { month: 'short', year: 'numeric' }) : (profile.created_at ? new Date(profile.created_at).toLocaleDateString('default', { month: 'short', year: 'numeric' }) : (profile.joinedDate ? new Date(profile.joinedDate).toLocaleDateString('default', { month: 'short', year: 'numeric' }) : 'Loading...'));

          const normalizedProfileImage = this.apiService.normalizeImageUrl(profile.profileImage || profile.profile_image);
          if (normalizedProfileImage) {
            this.profileImageUrl = normalizedProfileImage;
          } else {
            this.profileImageUrl = '';
          }
          
          this.isEditMode = false; // Existing user profile loaded
          this.loadSellerData();
          // Mark initial load as done to allow navigation refreshes
          this.initialLoadDone = true;
        }, err => {
          console.error('Failed to load own profile from API', err);
          this.isEditMode = true;
          this.loadSellerData();
        });
      } else {
        this.isEditMode = false;
        this.apiService.getSellerProfile(this.userEmail).subscribe(profile => {
          this.userName = profile.name || 'User Profile';
          this.userDept = profile.department || 'Not specified';
          this.userRole = profile.role || 'Student';
          this.userJoinedDate = profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('default', { month: 'short', year: 'numeric' }) : (profile.created_at ? new Date(profile.created_at).toLocaleDateString('default', { month: 'short', year: 'numeric' }) : (profile.joinedDate ? new Date(profile.joinedDate).toLocaleDateString('default', { month: 'short', year: 'numeric' }) : 'Joined recently'));

          const normalizedProfileImage = this.apiService.normalizeImageUrl(profile.profileImage || profile.profile_image);
          if (normalizedProfileImage) {
            this.profileImageUrl = normalizedProfileImage;
          } else {
            this.profileImageUrl = '';
          }
          this.loadSellerData();
          // Mark initial load as done for other profiles as well
          this.initialLoadDone = true;
        }, err => {
          console.error('Failed to load user profile', err);
          this.userName = 'Unknown Seller';
          this.userDept = '';
          this.userRole = '';
          this.userJoinedDate = '';
          this.profileImageUrl = '';
          this.loadSellerData();
        });
      }
    });

    this.productRefreshSubscription = this.apiService.productRefresh$.subscribe(() => {
      if (this.isOwnProfile) {
        this.loadSellerData();
      }
    });
  }

  ngOnDestroy(): void {
    this.productRefreshSubscription?.unsubscribe();
    this.routerSubscription?.unsubscribe();
  }

  // Refresh profile data from backend
  refreshProfile() {
    this.apiService.getSellerProfile(this.userEmail).subscribe(profile => {
      if (profile) {
        localStorage.setItem('profile', JSON.stringify(profile));
        this.userName = profile.name || '';
        this.userDept = profile.department || '';
        this.userRole = profile.role || '';
        this.profileImageUrl = this.apiService.normalizeImageUrl(profile.profileImage || profile.profile_image) || '';
      }
    });
  }

  // Load seller's products and counts via API
  loadSellerData() {

    // Fetch products listed by seller
    this.apiService.getSellerProducts(this.userEmail).subscribe(products => {
      try {
        console.debug('loadSellerData: raw seller products', (products as any[]).map(p => ({ id: (p as any).id, image: (p as any).image, images: (p as any).images, sellerEmail: (p as any).sellerEmail, status: (p as any).status, sold: (p as any).sold })));
      } catch (e) {}
      // Transform Product to SellerProduct
      const sellerProducts: SellerProduct[] = (products as any[]).map(p => {
        const normalizedStatus = typeof p.status === 'string' ? p.status.toLowerCase() : '';
        const isSold = p.sold === true ||
          ['sold', 'inactive'].includes(normalizedStatus) ||
          p.sold === 'true';
        return {
          id: p.id,
          title: p.name || 'Product',
          price: p.price ? parseFloat(String(p.price).replace(/[^\d.]/g, '')) || 0 : 0,
          priceDisplay: p.price ? String(p.price) : `₹${p.price}`,
          status: isSold ? 'Inactive' : 'Active',
          image: p.image || 'assets/placeholder.png'
        };
      });
      this.productsListed = sellerProducts.length;
      this.productsSold = sellerProducts.filter(p => p.status.toLowerCase() === 'inactive').length;
      // Sort newest first (assuming higher id = newer)
      const sorted = [...sellerProducts].sort((a, b) => b.id - a.id);
      this.recentProducts = sorted.slice(0, 3);
      console.log(`Profile stats: Listed=${this.productsListed}, Sold=${this.productsSold}, Recent=${this.recentProducts.length}`);
    }, err => {
      console.error('Failed to load seller products', err);
      this.productsListed = 0;
      this.productsSold = 0;
      this.recentProducts = [];
    });

    // Get wishlist count from local WishlistService (source of truth)
    this.wishlistItems = this.wishlistService.getWishlist().length;
  }

  private mergeSellerProducts(localProducts: SellerProduct[], backendProducts: SellerProduct[]): SellerProduct[] {
    const mergedMap = new Map<number, SellerProduct>();

    backendProducts.forEach(prod => mergedMap.set(prod.id, prod));
    localProducts.forEach(prod => {
      const existing = mergedMap.get(prod.id);
      mergedMap.set(prod.id, existing ? { ...existing, ...prod } : prod);
    });

    return Array.from(mergedMap.values()).sort((a, b) => b.id - a.id);
  }

  // Menu Controllers
  toggleImageMenu(event: Event) {
    event.stopPropagation(); // Prevents layout click handler from auto-closing instantly
    this.isImageMenuOpen = !this.isImageMenuOpen;
  }

  closeImageMenu() {
    this.isImageMenuOpen = false;
  }

  triggerUpload(fileInput: HTMLInputElement) {
    this.closeImageMenu();
    fileInput.click();
  }

  removePicture() {
    this.closeImageMenu();
    this.profileImageUrl = '';
    this.selectedImageFile = null;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validate file is an image
      if (!file.type.startsWith('image/')) {
        this.message = 'Please select a valid image file!';
        this.isError = true;
        setTimeout(() => this.message = '', 3000);
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.message = 'Image size must be less than 5MB!';
        this.isError = true;
        setTimeout(() => this.message = '', 3000);
        return;
      }

      this.selectedImageFile = file;

      // Also create a preview URL
      const reader = new FileReader();
      reader.onload = () => {
        this.profileImageUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
    // Clear input selection value so matching filenames can be re-selected normally later
    event.target.value = '';
  }

  saveProfile(name: string, department: string, role: string) {
    if (!name.trim() || !department.trim() || !role.trim()) {
      this.message = 'Please enter all fields!';
      this.isError = true;
      return;
    }

    if (this.isSaving) {
      return; // Prevent duplicate submissions
    }

    this.isError = false;
    this.userName = name.trim();
    this.userDept = department.trim();
    this.userRole = role.trim();



    this.message = 'Saving...';
    this.isSaving = true;

    if (this.selectedImageFile) {
      this.apiService.uploadProfileImage(this.selectedImageFile).subscribe({
        next: uploadResponse => {
          const returnedPath = uploadResponse?.profileImage || uploadResponse?.data?.profileImage || '';
          if (returnedPath) {
            this.profileImageUrl = returnedPath;
          }

          const normalizedSavedImageUrl = this.apiService.normalizeImageUrl(returnedPath) || returnedPath || this.profileImageUrl;
          if (normalizedSavedImageUrl) {
            this.profileImageUrl = normalizedSavedImageUrl;
          }

          const profileData = {
            email: this.userEmail,
            name: this.userName,
            department: this.userDept,
            role: this.userRole,
            profileImage: returnedPath || this.profileImageUrl || '',
            status: 'ACTIVE'
          };

          this.apiService.saveUserProfile(profileData).subscribe({
            next: response => {
              console.log('Profile saved successfully to backend:', response);
              localStorage.setItem('profile', JSON.stringify(profileData));

             // After successful save (no image), refresh profile data
          this.refreshProfile();
              this.selectedImageFile = null;
              // Refresh product stats after saving profile
              this.loadSellerData();
              setTimeout(() => {
                this.message = '';
                this.isEditMode = false;
                this.isSaving = false;
              }, 800);
            },
            error: err => {
              console.error('Failed to save profile to backend', err);
              this.message = 'Profile Saved Locally !';
              this.isSaving = false;
              setTimeout(() => {
                this.message = '';
                this.isEditMode = false;
              }, 800);
            }
          });
        },
        error: err => {
          console.error('Failed to upload profile image', err);
          this.message = 'Image upload failed. Please try again.';
          this.isSaving = false;
          setTimeout(() => this.message = '', 3000);
        }
      });
    } else {
      const profileData = {
        email: this.userEmail,
        name: this.userName,
        department: this.userDept,
        role: this.userRole,
        profileImage: this.profileImageUrl || '',
        status: 'ACTIVE'
      };

      this.apiService.saveUserProfile(profileData).subscribe({
        next: response => {
          console.log('Profile saved successfully to backend:', response);
          localStorage.setItem('profile', JSON.stringify(profileData));

          // After successful save, refresh profile data from backend
          this.refreshProfile();
          this.message = 'Profile Saved Successfully !';
          // Refresh product stats after saving profile locally
          this.loadSellerData();
          setTimeout(() => {
            this.message = '';
            this.isEditMode = false;
            this.isSaving = false;
          }, 800);
        },
        error: err => {
          console.error('Failed to save profile to backend', err);
          this.message = 'Profile Saved Locally !';
          this.isSaving = false;
          setTimeout(() => {
            this.message = '';
            this.isEditMode = false;
          }, 800);
        }
      });
    }
  }

  goToProductListings() {
    this.router.navigate(['/product-listing']);
  }

  // Navigates to the product sold summary overview layout dashboard
  goToProductSold() {
    this.router.navigate(['/product-sold']);
  }

  // Navigates to the wishlist page layout view
  goToWishlist() {
    this.router.navigate(['/wishlist']);
  }

  // Navigates to the custom item sharing layout view page
  goToSharePage() {
    this.router.navigate(['/share']);
  }

  // Delete a product and refresh the data
  deleteProduct(product: SellerProduct, event: Event) {
    event.stopPropagation();
    if (!confirm(`Are you sure you want to delete "${product.title}"?`)) {
      return;
    }
    this.apiService.deleteProduct(product.id).subscribe(() => {
      // Remove from local list immediately
      this.recentProducts = this.recentProducts.filter(p => p.id !== product.id);
      this.productsListed = Math.max(0, this.productsListed - 1);
      if (product.status?.toLowerCase() === 'inactive') {
        this.productsSold = Math.max(0, this.productsSold - 1);
      }
      // Reload data from API to ensure accuracy
      this.loadSellerData();
      // Notify other components about product changes
      this.apiService.triggerProductRefresh();
    }, err => {
      console.error('Failed to delete product', err);
      alert('Failed to delete product. Please try again.');
    });
  }
}