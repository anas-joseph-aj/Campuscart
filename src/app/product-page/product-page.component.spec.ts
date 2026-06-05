import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProdutPageComponent } from './product-page.component';

describe('ProdutPageComponent', () => {
  let component: ProdutPageComponent;
  let fixture: ComponentFixture<ProdutPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProdutPageComponent]
    });
    fixture = TestBed.createComponent(ProdutPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
