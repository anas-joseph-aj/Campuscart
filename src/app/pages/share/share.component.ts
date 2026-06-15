import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../product.service';

import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-share',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.css']
})
export class ShareComponent implements OnInit {
  productLink: string = '';
  productName: string = '';
  
  // Flag to manage the dynamic "Copied!" button states
  isCopied: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id) {
        const product = this.productService.getProductById(id);
        if (product) {
          this.productName = product.name;
          this.productLink = `${window.location.origin}/product/${id}`;
        } else {
          this.productLink = `${window.location.origin}/product/${id}`;
        }
      } else {
        this.productLink = window.location.href;
      }
    });
  }

  copyLinkToClipboard(): void {
    if (this.isCopied) return; // Prevent multiple clicks while animation runs

    navigator.clipboard.writeText(this.productLink)
      .then(() => {
        this.isCopied = true;
        
        // Reverts button text and styles back to standard "Copy" after 2 seconds
        setTimeout(() => {
          this.isCopied = false;
        }, 2000);
      })
      .catch(err => console.error('Could not copy: ', err));
  }

  shareToSocial(platform: string): void {
    const text = this.productName ? `Check out the "${this.productName}" on CampusCart!` : 'Check out this find on CampusCart!';
    const encodedText = encodeURIComponent(`${text} ${this.productLink}`);

    switch (platform) {
      case 'whatsapp':
        window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank');
        break;

      case 'facebook':
        // FIXED: Added ?locale=en_GB to override local IP mapping and force English layout
        window.open('https://www.facebook.com/?locale=en_GB', '_blank');
        break;

      case 'gmail':
        window.open(`https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent('Check out this product')}&body=${encodedText}`, '_blank');
        break;

      case 'instagram':
        window.open('https://www.instagram.com/', '_blank');
        break;

      case 'more':
        // Native share menu for everything else
        if (navigator.share) {
          navigator.share({ title: 'CampusCart', url: this.productLink })
            .catch(() => this.copyLinkToClipboard());
        } else {
          this.copyLinkToClipboard();
        }
        break;
    }
  }

  goBack(): void {
    this.location.back();
  }
}