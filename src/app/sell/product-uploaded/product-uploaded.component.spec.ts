import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductUploadedComponent } from './product-uploaded.component';

describe('ProductUploadedComponent', () => {
  let component: ProductUploadedComponent;
  let fixture: ComponentFixture<ProductUploadedComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProductUploadedComponent]
    });
    fixture = TestBed.createComponent(ProductUploadedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
