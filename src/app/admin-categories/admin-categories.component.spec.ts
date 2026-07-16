import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { AdminCategoriesComponent } from './admin-categories.component';
import { AdminService } from '../services/admin.service';

describe('AdminCategoriesComponent', () => {
  let component: AdminCategoriesComponent;
  let fixture: ComponentFixture<AdminCategoriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminCategoriesComponent],
      providers: [{
        provide: AdminService,
        useValue: {
          getCategories: () => of([]),
          searchCategories: () => of([]),
          addCategory: () => of({}),
          updateCategory: () => of({}),
          deleteCategory: () => of({})
        }
      }]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminCategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update the active menu when setActiveMenu is called', () => {
    component.setActiveMenu('Dashboard');
    expect(component.activeMenu).toBe('Dashboard');
  });
});
