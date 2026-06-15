import { Component, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Product, ProductService } from '../product.service';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-sell',
  templateUrl: './sell.component.html',
  styleUrls: ['./sell.component.css']
})
export class SellComponent {
  productForm!: FormGroup;
  selectedCategory: any = null;
  productImages: (string | null)[] = [null, null, null, null, null];
  productFiles: File[] = [];
  isUploading = false;
  formSubmitted = false;
  formErrors = { submit: '' };

  categories = [
    { name: 'Books', icon: '📚', fields: ['Product Name', 'Company Name'] },
    { name: 'Electronics', icon: '💻', fields: ['Product Name', 'Company Name'] },
    { name: 'Furniture', icon: '🪑', fields: ['Product Name'] },
    { name: 'Fashion', icon: '👗', fields: ['Product Name'] },
    { name: 'Pets', icon: '🐾', fields: ['Pet Name'] },
    { name: 'Kitchen', icon: '🍳', fields: ['Name'] },
    { name: 'Vehicle', icon: '🚗', fields: ['Name', 'Model'] },
    { name: 'Sports', icon: '⚽', fields: ['Name'] },
    { name: 'Miscellaneous', icon: '📦', fields: ['Product Name'] }
  ];

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private productService: ProductService,
    private apiService: ApiService
  ) {
    this.initializeForm();
    const email = localStorage.getItem('email');
    if (email) {
      this.apiService.getSellerProfile(email).subscribe(profile => {
        if (!profile || !profile.name) {
          this.router.navigate(['/profile']);
        }
      }, err => {
        this.router.navigate(['/profile']);
      });
    }
  }

  private initializeForm(): void {
    this.productForm = this.fb.group({
      negotiable: ['Price Not Negotiable']
    });
  }

  selectCategory(category: any): void {
    this.selectedCategory = category;
    this.formErrors.submit = '';
    this.formSubmitted = false;
    this.buildProductForm(category.fields);
  }

  public getControlName(field: string): string {
    return field.toLowerCase().replace(/\s+/g, '');
  }

  private buildProductForm(fields: string[]): void {
    const group: any = {
      negotiable: ['Price Not Negotiable'],
      description: ['', Validators.required],
      price: ['', Validators.required]
    };
    fields.forEach(field => {
      group[this.getControlName(field)] = ['', Validators.required];
    });
    this.productForm = this.fb.group(group);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const index = this.productImages.findIndex(img => img === null);
        if (index !== -1) {
          this.productImages[index] = e.target.result;
          this.cdr.detectChanges();
        } else {
          alert('Maximum 5 images allowed.');
        }
      };
      reader.readAsDataURL(file);
      this.productFiles.push(file);
      input.value = '';
    }
  }

  removeImage(index: number): void {
    this.productImages[index] = null;
    this.productFiles.splice(index, 1);
    const remaining = this.productImages.filter(img => img !== null);
    this.productImages = [null, null, null, null, null];
    remaining.forEach((img, i) => this.productImages[i] = img);
  }

  uploadProduct(): void {
    this.formSubmitted = true;
    this.formErrors.submit = '';

    if (!this.selectedCategory) {
      this.formErrors.submit = 'Please select a category first!';
      return;
    }
    if (this.productForm.invalid) {
      this.formErrors.submit = 'Please fill in all required fields.';
      this.markFormGroupTouched(this.productForm);
      return;
    }
    if (!this.productImages[0]) {
      this.formErrors.submit = 'Please upload at least one image.';
      return;
    }
    const loggedInEmail = localStorage.getItem('email') || '';
    if (!loggedInEmail) {
      this.formErrors.submit = 'User email not found. Please login again.';
      return;
    }
    if (this.productFiles.length === 0) {
      this.formErrors.submit = 'No image files selected.';
      return;
    }
    console.log('Attempting image upload. Files count:', this.productFiles.length, 'Email:', loggedInEmail);
    this.isUploading = true;
    const payload = { ...this.productForm.value, category: this.selectedCategory.name } as any;
    this.apiService.uploadImages(this.productFiles, loggedInEmail).subscribe((imagePaths: any) => {
      console.log('Upload returned image paths:', imagePaths);
      const product: any = {
        name: payload[this.getControlName(this.selectedCategory.fields[0])] || payload.name || 'New Product',
        description: payload.description || '',
        category: this.selectedCategory.name,
        price: payload.price ? Number(payload.price) : 0,
        image: imagePaths[0] || '',
        images: imagePaths,
        sellerEmail: loggedInEmail,
        specs: payload.company || payload.model || payload.name || payload.description || 'Details not available',
        company: payload.company || payload.companyName || ''
      };
      console.log('Prepared product payload:', product);
      this.apiService.addProduct(product).subscribe((savedProduct: any) =>{
          // Update local product list for seller profile and featured products
          this.productService.addProduct(savedProduct);


          this.isUploading = false;
          this.formErrors.submit = '';
          this.productForm.reset({ negotiable: 'Price Not Negotiable' });
          this.productImages = [null, null, null, null, null];
          this.productFiles = [];
          this.selectedCategory = null;
          this.formSubmitted = false;
          this.router.navigate(['/product-uploaded']);
        }, err => {
          this.isUploading = false;
          const errMsg = err?.error?.message || 'Failed to add product.';
          this.formErrors.submit = errMsg;
          console.error('Add product error:', err);
        });
    }, err => {
      this.isUploading = false;
      console.error('Image upload error details:', err);
      this.formErrors.submit = 'Image upload failed.';
    });
  }
}
