import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { AdminService } from '../services/admin.service';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SharedModule],
  templateUrl: './admin-categories.component.html',
  styleUrls: ['./admin-categories.component.css']
})
export class AdminCategoriesComponent implements OnInit {

  // Search & navigation
  searchText = '';
  activeMenu = 'Categories';

  setActiveMenu(menu: string): void {
    this.activeMenu = menu;
  }

  // ==== MODAL STATE ==== 
  showModal = false;
  showDeleteModal = false;
  isEditMode = false;

  selectedCategoryIndex = -1;
  selectedDeleteIndex = -1;
  selectedCategoryId: string | null = null;

  // Form model
  categoryForm = {
    name: '',
    icon: ''
  };

  // Emoji palette (icons are stored as emojis in admin-categories.ts)
  suggestedEmojis = [
    '📚', '🪑', '💻', '👗', '🐾', '🍳', '🚗', '⚽', '📦', '🎁',
    '🧸', '🍔', '🛠️', '🌿', '🏠', '✈️', '🛒', '📱', '🚲', '🍕'
  ];

  // Categories loaded from the backend. Each object includes an `id` field.
  categories: any[] = [];

  constructor(private adminService: AdminService) { }

  ngOnInit(): void {
    this.loadCategories();
  }

  /** Load the list of categories from the server */
  loadCategories(): void {
    if (this.searchText && this.searchText.trim().length > 0) {
      this.adminService.searchCategories(this.searchText.trim()).subscribe(
        (data) => {
          this.categories = (data || []).map((cat: any) => ({
            ...cat,
            icon: this.getDisplayIcon(cat)
          }));
        },
        (error) => {
          console.error('Search categories failed', error);
          alert('Unable to search categories. Check console for details.');
        }
      );
    } else {
      this.adminService.getCategories().subscribe(
        (data) => {
          this.categories = (data || []).map((cat: any) => ({
            ...cat,
            icon: this.getDisplayIcon(cat)
          }));
        },
        (error) => {
          console.error('Failed to load categories', error);
          alert('Unable to load categories. Check console for details.');
        }
      );
    }
  }

  /** Gets display icon from category object, with mapping fallback */
  getDisplayIcon(cat: any): string {
    if (cat && cat.icon) {
      const iconStr = cat.icon.trim();
      if (iconStr.length <= 4 || !/[a-zA-Z0-9]/.test(iconStr)) {
        return iconStr;
      }
      const match = iconStr.match(/^([^.]+)\.[^.]+$/);
      if (match) {
        const base = match[1];
        const emoji = this.getIcon(base);
        if (emoji !== '❓') {
          return emoji;
        }
      }
      if (iconStr.includes('/')) {
        return iconStr;
      }
    }
    return this.getIcon(cat ? cat.name : '');
  }

  /** Triggered when the search term changes */
  onSearchChange(): void {
    this.loadCategories();
  }

  /** Returns an emoji/icon based on the category name */
  private getIcon(name: string): string {
    const map: { [key: string]: string } = {
      electronics: '💻',
      books: '📚',
      pets: '🐾',
      kitchen: '🍳',
      fashion: '👗',
      furniture: '🪑',
      vehicles: '🚗',
      sports: '⚽',
      miscellaneous: '📦',
      donation: '🎁'
    };
    const key = name.toLowerCase();
    return map[key] || '❓';
  }

  /** Open the modal to edit an existing category */
  openEditModal(index: number): void {
    this.isEditMode = true;
    this.selectedCategoryIndex = index;
    const cat = this.filteredCategories[index];
    this.selectedCategoryId = cat.id || null;
    this.categoryForm = { name: cat.name, icon: cat.icon };
    this.showModal = true;
  }

  /** Open the modal to add a new category */
  openAddModal(): void {
    this.isEditMode = false;
    this.selectedCategoryId = null;
    this.categoryForm = { name: '', icon: '' };
    this.showModal = true;
  }

  /** Close the add/edit modal */
  closeModal(): void {
    this.showModal = false;
    this.isEditMode = false;
    this.categoryForm = { name: '', icon: '' };
  }

  /** Alias for deletion modal trigger used in template */
  deleteCategory(index: number): void {
    this.openDeleteModal(index);
  }

  // Save – either create a new category or update an existing one
  saveCategory(): void {
    const name = this.categoryForm.name?.trim();
    if (!name) {
      alert('Category name cannot be empty');
      return;
    }
    // Build payload based on operation mode
    const payload: any = { name };
    if (this.isEditMode) {
      const iconTrimmed = this.categoryForm.icon?.trim();
      if (iconTrimmed) {
        payload.icon = iconTrimmed;
      }
    }
    console.log('Attempting to add/update category with payload:', payload);
    if (this.isEditMode && this.selectedCategoryId) {
      // Update existing category
      this.adminService.updateCategory(this.selectedCategoryId, payload).subscribe(
        () => {
          this.loadCategories();
          alert('Category updated successfully');
        },
        (error) => {
          console.error('Update failed', error);
          alert('Failed to update category: ' + (error?.error?.message || error.message || 'Unknown error'));
        }
      );
    } else {
      // Create new category (expects only name)
      this.adminService.addCategory(payload).subscribe(
        () => {
          this.loadCategories();
          alert('Category added successfully');
        },
        (error) => {
          console.error('Add failed', error);
          alert('Failed to add category: ' + (error?.error?.message || error.message || 'Unknown error'));
        }
      );
    }
    this.showModal = false;
  }



  /** Prompt deletion of a category */
  openDeleteModal(index: number): void {
    this.selectedDeleteIndex = index;
    this.showDeleteModal = true;
  }



  /** Confirm deletion */
  confirmDelete(): void {
    const cat = this.filteredCategories[this.selectedDeleteIndex];
    if (cat && cat.id) {
      this.adminService.deleteCategory(cat.id).subscribe(
        () => {
          this.loadCategories();
          alert('Category deleted successfully');
        },
        (error) => {
          console.error('Delete failed', error);
          alert('Failed to delete category');
        }
      );
    }
    this.closeDeleteModal();
  }

  /** Close the delete confirmation modal */
  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedDeleteIndex = -1;
  }

  /** Compute the filtered list based on the search box */
  get filteredCategories(): any[] {
    if (!this.searchText) {
      return this.categories;
    }
    const lower = this.searchText.toLowerCase();
    return this.categories.filter(c => c.name.toLowerCase().includes(lower));
  }
}