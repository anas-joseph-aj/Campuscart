import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { ProductService } from '../product.service';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SharedModule],
  templateUrl: './admin-categories.component.html',
  styleUrls: ['./admin-categories.component.css']
})
export class AdminCategoriesComponent implements OnInit {

  searchText = '';
  activeMenu = 'Categories';

  /* ===== MODAL VARIABLES ===== */

  showModal = false;
  showDeleteModal = false;
  isEditMode = false;

  selectedCategoryIndex = -1;
  selectedDeleteIndex = -1;

  categoryForm = {
    name: '',
    icon: ''
  };

  suggestedEmojis = [
    '📚', '🪑', '💻', '👗', '🐾', '🍳', '🚗', '⚽', '📦', '🎁', 
    '🧸', '🍔', '🛠️', '🌿', '🏠', '✈️', '🛒', '📱', '🚲', '🍕'
  ];

  /* ===== CATEGORY DATA ===== */

  categories = [
    { icon: '📚', name: 'Books', key: 'Books', count: 0 },
    { icon: '🪑', name: 'Furniture', key: 'Furniture', count: 0 },
    { icon: '💻', name: 'Electronics', key: 'Electronics', count: 0 },
    { icon: '👗', name: 'Fashion', key: 'Fashion', count: 0 },
    { icon: '🐾', name: 'Pets', key: 'Pets', count: 0 },
    { icon: '🍳', name: 'Kitchen', key: 'Kitchen', count: 0 },
    { icon: '🚗', name: 'Vehicle', key: 'Vehicles', count: 0 },
    { icon: '⚽', name: 'Sports', key: 'Sports', count: 0 },
    { icon: '📦', name: 'Miscellaneous', key: 'Miscellaneous', count: 0 },
    { icon: '🎁', name: 'Donation', key: 'Donation', count: 0 }
  ];

  constructor(private productService: ProductService) {}

  ngOnInit(): void {

    const counts: Record<string, number> = {};

    this.productService.getProducts().forEach(product => {

      const category = product.category || 'Miscellaneous';

      counts[category] = (counts[category] || 0) + 1;

    });

    this.categories = this.categories.map(category => ({
      ...category,
      count: counts[category.key] || 0
    }));
  }

  setActiveMenu(menu: string): void {
    this.activeMenu = menu;
  }

  /* ===== SEARCH ===== */

  get filteredCategories() {
    return this.categories.filter(category =>
      category.name
        .toLowerCase()
        .includes(this.searchText.toLowerCase())
    );
  }

  /* ===== ADD CATEGORY ===== */

  openAddModal(): void {

    this.isEditMode = false;

    this.categoryForm = {
      name: '',
      icon: ''
    };

    this.showModal = true;
  }

  /* ===== EDIT CATEGORY ===== */

  openEditModal(index: number): void {

    this.isEditMode = true;

    this.selectedCategoryIndex = index;

    this.categoryForm = {
      name: this.filteredCategories[index].name,
      icon: this.filteredCategories[index].icon
    };

    this.showModal = true;
  }

  /* ===== SAVE CATEGORY ===== */

  saveCategory(): void {

    if (!this.categoryForm.name.trim()) {

      alert('Please enter category name');
      return;
    }

    if (this.isEditMode) {

      const category = this.filteredCategories[this.selectedCategoryIndex];
      if (category) {
        category.name = this.categoryForm.name.trim();
        category.icon = this.categoryForm.icon.trim() || '📦';
        this.categories = [...this.categories];
      }

    } else {

      this.categories.push({
        icon: this.categoryForm.icon.trim() || '📦',
        name: this.categoryForm.name.trim(),
        key: this.categoryForm.name.trim(),
        count: 0
      });
      this.categories = [...this.categories];

    }

    this.closeModal();
  }

  /* ===== DELETE CATEGORY ===== */

  deleteCategory(index: number): void {
    this.selectedDeleteIndex = index;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (this.selectedDeleteIndex !== -1) {
      const category = this.filteredCategories[this.selectedDeleteIndex];
      if (category) {
        this.categories = this.categories.filter(
          c => c !== category
        );
      }
    }
    this.closeDeleteModal();
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedDeleteIndex = -1;
  }

  /* ===== CLOSE MODAL ===== */

  closeModal(): void {

    this.showModal = false;

    this.categoryForm = {
      name: '',
      icon: ''
    };

    this.selectedCategoryIndex = -1;
  }
}