import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductLisitingComponent } from './product-lisiting.component';

describe('ProductLisitingComponent', () => {
  let component: ProductLisitingComponent;
  let fixture: ComponentFixture<ProductLisitingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProductLisitingComponent]
    });
    fixture = TestBed.createComponent(ProductLisitingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
