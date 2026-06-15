import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductSoldComponent } from './product-sold.component';

describe('ProductSoldComponent', () => {
  let component: ProductSoldComponent;
  let fixture: ComponentFixture<ProductSoldComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProductSoldComponent]
    });
    fixture = TestBed.createComponent(ProductSoldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
