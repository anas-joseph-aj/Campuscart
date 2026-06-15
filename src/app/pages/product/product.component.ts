import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { Product, ProductService } from '../../product.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, RouterModule, SharedModule],
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {
  products: Product[] = [];

  constructor(private productService: ProductService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    // Use local mock data for product list to guarantee availability
    this.products = this.productService.getProducts();
  }

  viewProduct(productId: number): void {
    this.router.navigate(['/product', productId]);
  }

  reportSeller(product: Product): void {
    this.router.navigate(['/report'], {
      queryParams: {
        sellerName: product.name,
        sellerEmail: product.sellerEmail || ''
      }
    });
  }

}
