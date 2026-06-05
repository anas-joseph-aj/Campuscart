import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Product, ProductService } from '../product.service';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent implements OnInit {
  product?: Product;
  liked = false;
  relatedProducts: Product[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (!Number.isNaN(id)) {
        this.product = this.productService.getProductById(id);
        if (this.product) {
          this.liked = this.product.liked;
          const queryCategory = this.route.snapshot.queryParamMap.get('category');
          if (queryCategory && queryCategory !== 'All Products') {
            this.relatedProducts = this.productService.getProducts()
              .filter(p => p.category === queryCategory && p.id !== id)
              .slice(0, 3);
          } else {
            this.relatedProducts = this.productService.getRelatedProducts(id);
          }
        } else {
          this.relatedProducts = [];
        }
      } else {
        this.product = undefined;
        this.relatedProducts = [];
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  navigateToRelated(productId: number) {
    this.router.navigate(['/product-details', productId]);
  }

  toggleMainLike() {
    if (!this.product) {
      return;
    }
    this.product.liked = !this.product.liked;
    this.liked = this.product.liked;
  }

  toggleRelatedLike(product: Product) {
    product.liked = !product.liked;
  }

  navigateToAllProducts(): void {
    this.router.navigate(['/products']);
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }
}