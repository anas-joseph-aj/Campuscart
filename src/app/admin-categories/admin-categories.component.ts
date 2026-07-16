import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './admin-categories.component.html',
  styleUrls: ['./admin-categories.component.css']
})

export class AdminCategoriesComponent {

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

  selectedDeleteIndex = -1;

  /* =========================
     FORM DATA
  ========================= */

  categoryForm = {

    name: '',
    icon: ''

  };

  /* =========================
     CATEGORY DATA
  ========================= */

  categories = [

    {
      icon: '📚',
      name: 'Books',
      count: 2
    },

    {
      icon: '🪑',
      name: 'Furniture',
      count: 2
    },

    {
      icon: '💻',
      name: 'Electronics',
      count: 9
    },

    {
      icon: '👗',
      name: 'Fashion',
      count: 1
    },

    {
      icon: '🐾',
      name: 'Pets',
      count: 2
    },

    {
      icon: '🍳',
      name: 'Kitchen',
      count: 1
    },

    {
      icon: '🚗',
      name: 'Vehicle',
      count: 1
    },

    {
      icon: '⚽',
      name: 'Sports',
      count: 1
    },

    {
      icon: '📦',
      name: 'Miscellaneous',
      count: 2
    },

    {
      icon: '🎁',
      name: 'Donation',
      count: 3
    }

  ];

  /* =========================
     SIDEBAR ACTIVE MENU
  ========================= */

  setActiveMenu(menu: string): void {

    this.activeMenu = menu;

  }

  /* =========================
     SEARCH FILTER
  ========================= */

  get filteredCategories() {

    return this.categories.filter(category =>

      category.name
        .toLowerCase()
        .includes(this.searchText.toLowerCase())

    );

  }

  /* =========================
     OPEN ADD MODAL
  ========================= */

  openAddModal(): void {

    this.isEditMode = false;

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

    this.categoryForm = {

      name:
        this.filteredCategories[index].name,

      icon:
        this.filteredCategories[index].icon

    };

    this.showModal = true;

  }

  /* =========================
     SAVE CATEGORY
  ========================= */

  saveCategory(): void {

    /* VALIDATION */

    if (!this.categoryForm.name.trim()) {

      alert('Please enter category name');

      return;

    }

    /* CATEGORY OBJECT */

    const categoryData = {

      name:
        this.categoryForm.name.trim(),

      icon:
        this.categoryForm.icon.trim() || '📦',

      count: 0

    };

    /* =========================
       EDIT CATEGORY
    ========================= */

    if (this.isEditMode) {

      const currentCategory =

        this.filteredCategories[
          this.selectedCategoryIndex
        ];

      const actualIndex =

        this.categories.indexOf(
          currentCategory
        );

      this.categories[actualIndex] = {

        ...this.categories[actualIndex],

        name: categoryData.name,

        icon: categoryData.icon

      };

      /* REFRESH */

      this.categories = [
        ...this.categories
      ];

    }

    /* =========================
       ADD CATEGORY
    ========================= */

    else {

      this.categories.push(categoryData);

      /* REFRESH */

      this.categories = [
        ...this.categories
      ];

    }

    /* CLOSE MODAL */

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

    if (this.selectedDeleteIndex !== -1) {

      const category =

        this.filteredCategories[
          this.selectedDeleteIndex
        ];

      this.categories =

        this.categories.filter(

          c => c !== category

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

    this.categoryForm = {

      name: '',
      icon: ''

    };

    this.selectedCategoryIndex = -1;

  }

}