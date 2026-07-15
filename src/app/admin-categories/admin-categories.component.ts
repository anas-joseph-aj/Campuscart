import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../services/admin.service';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './admin-categories.component.html',
  styleUrls: ['./admin-categories.component.css']
})
export class AdminCategoriesComponent implements OnInit {

  /* =========================
     SEARCH
  ========================= */

  searchText = '';

  /* =========================
     ACTIVE SIDEBAR MENU
  ========================= */

  activeMenu = 'Categories';

  /* =========================
     MODALS
  ========================= */

  showModal = false;
  showDeleteModal = false;
  isEditMode = false;

  selectedCategoryIndex = -1;
  selectedCategoryId: string | null = null;
  selectedDeleteIndex = -1;

  /* =========================
     FORM DATA
  ========================= */

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
          try {
            console.debug('loadCategories: raw categories', (data || []).map((c: any) => ({ id: c.id, name: c.name, iconRaw: c.icon })));
          } catch (e) { }
          this.categories = (data || []).map((cat: any) => ({
            ...cat,
            icon: this.getDisplayIcon(cat),
            productCount: cat.productCount ?? 0
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
          try {
            console.debug('loadCategories (getCategories): raw categories', (data || []).map((c: any) => ({ id: c.id, name: c.name, iconRaw: c.icon })));
          } catch (e) { }
          this.categories = (data || []).map((cat: any) => ({
            ...cat,
            icon: this.getDisplayIcon(cat),
            productCount: cat.productCount ?? 0
          }));
        },
        (error) => {
          console.error('Failed to load categories', error);
          // Fallback to mock data if backend fails
          this.loadMockCategories();
        }
      );
    }
  }

  /** Gets display icon from category object, with mapping fallback */
  private isEmojiString(s: string): boolean {
    if (!s) return false;
    // Try Unicode property regex first (may throw on older engines)
    try {
      const re = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u;
      if (re.test(s)) return true;
    } catch (e) { }
    // Fallback: detect surrogate pairs or common emoji ranges
    const surrogatePairRe = /[\uD800-\uDBFF][\uDC00-\uDFFF]/;
    if (surrogatePairRe.test(s)) return true;
    // Common miscellaneous symbols and dingbats
    const rangeRe = /[\u2600-\u27BF\u1F300-\u1F6FF\u1F900-\u1F9FF]/;
    return rangeRe.test(s);
  }

  getDisplayIcon(cat: any): string {
    if (cat && cat.icon) {
      let iconStr = (cat.icon || '').toString().trim();
      // If backend stored HTML-encoded entities (e.g. &#128214;), decode them to real emoji
      if (iconStr.includes('&#') || iconStr.includes('&amp;#')) {
        iconStr = this.decodeHtmlEntities(iconStr);
      }
      // If the string contains emoji characters, return as-is
      if (this.isEmojiString(iconStr)) {
        return iconStr;
      }
      // Short strings (likely emoji or simple icons) should be returned as-is
      if (iconStr.length <= 4 && !/[a-zA-Z0-9]/.test(iconStr)) {
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
    const fallback = this.getIcon(cat ? cat.name : '');
    try {
      console.debug('getDisplayIcon: fallback', { id: cat?.id, name: cat?.name, iconRaw: cat?.icon, resolved: fallback });
    } catch (e) { }
    return fallback;
  }

  // Called when an admin selects a suggested emoji from the UI
  selectSuggestedEmoji(emoji: string): void {
    this.categoryForm.icon = emoji;
  }

  /** Decode HTML numeric entities (decimal and hex) and basic amp-escaped forms */
  private decodeHtmlEntities(input: string): string {
    let s = input.replace(/&amp;#/g, '&#');
    // Replace decimal entities
    s = s.replace(/&#(\d+);/g, (_m, dec) => String.fromCodePoint(parseInt(dec, 10)));
    // Replace hex entities
    s = s.replace(/&#x([0-9a-fA-F]+);/g, (_m, hex) => String.fromCodePoint(parseInt(hex, 16)));
    return s;
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

  /* =========================
     OPEN ADD MODAL
  ========================= */

  openAddModal(): void {
    this.isEditMode = false;
    this.selectedCategoryId = null;
    this.categoryForm = {
      name: '',
      icon: ''
    };
    this.showModal = true;
  }

  /* =========================
     OPEN EDIT MODAL
  ========================= */

  openEditModal(index: number): void {
    this.isEditMode = true;
    this.selectedCategoryIndex = index;
    const cat = this.filteredCategories[index];
    this.selectedCategoryId = cat.id || null;
    this.categoryForm = {
      name: cat.name,
      icon: cat.icon
    };
    this.showModal = true;
  }

  /* =========================
     SAVE CATEGORY
  ========================= */

  saveCategory(): void {
    const name = this.categoryForm.name?.trim();
    if (!name) {
      alert('Please enter category name');
      return;
    }

    const payload: any = {
      name: name,
      icon: this.categoryForm.icon?.trim() || '📦'
    };

    if (this.isEditMode && this.selectedCategoryId) {
      this.adminService.updateCategory(this.selectedCategoryId, payload).subscribe(
        () => {
          this.loadCategories();
          alert('Category updated successfully');
        },
        (error) => {
          console.error('Update failed', error);
          alert('Failed to update category');
        }
      );
    } else {
      this.adminService.addCategory(payload).subscribe(
        () => {
          this.loadCategories();
          alert('Category added successfully');
        },
        (error) => {
          console.error('Add failed', error);
          alert('Failed to add category');
        }
      );
    }

    this.closeModal();
  }

  /* =========================
     DELETE BUTTON CLICK
  ========================= */

  deleteCategory(index: number): void {
    this.selectedDeleteIndex = index;
    this.showDeleteModal = true;
  }

  /* =========================
     CONFIRM DELETE
  ========================= */

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

  /* =========================
     CLOSE DELETE MODAL
  ========================= */

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedDeleteIndex = -1;
  }

  /* =========================
     CLOSE ADD/EDIT MODAL
  ========================= */

  closeModal(): void {
    this.showModal = false;
    this.isEditMode = false;
    this.categoryForm = {
      name: '',
      icon: ''
    };
    this.selectedCategoryIndex = -1;
  }

  /** Load mock categories for demonstration */
  loadMockCategories(): void {
    const mockData = [
      { id: '1', name: 'Books', icon: '📚', productCount: 2 },
      { id: '2', name: 'Furniture', icon: '🪑', productCount: 2 },
      { id: '3', name: 'Electronics', icon: '💻', productCount: 0 },
      { id: '4', name: 'Fashion', icon: '👗', productCount: 1 },
      { id: '5', name: 'Pets', icon: '🐾', productCount: 2 },
      { id: '6', name: 'Kitchen', icon: '🍳', productCount: 1 },
      { id: '7', name: 'Vehicle', icon: '🚗', productCount: 1 },
      { id: '8', name: 'Sports', icon: '⚽', productCount: 1 },
      { id: '9', name: 'Miscellaneous', icon: '📦', productCount: 2 },
      { id: '10', name: 'Donation', icon: '🎁', productCount: 3 }
    ];
    this.categories = mockData;
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