import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Product {
  id: number;
  name: string;
  category: string;
  price?: string;
  image?: string;
  images?: (string | { path?: string; url?: string })[]; // backend may return objects
  liked: boolean;
  sellerEmail?: string;
  sellerName?: string;
  sellerId?: string | number;
  seller?: any;
  owner?: any;
  user?: any;
  sellerInfo?: any;
  categories?: string[];
  description?: string;
  subtitle?: string;
  sold?: boolean; // Tracks if product is sold

  company?: string; // Manufacturer or brand
  isUserProduct?: boolean; // Marks products added by current user
  specs?: string; // Product specifications (e.g., size, color)
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private productAddedSubject = new Subject<void>();
  public productAdded$ = this.productAddedSubject.asObservable();
  private products: Product[] = [
    { id: 1, name: 'iPhone 16', price: '₹69,900', category: 'Electronics', image: 'assets/iphone16.png', liked: false, company: 'Apple', subtitle: 'Latest model', specs: '56GB • Pink', description: 'Brand new Apple iPhone 16.', sellerEmail: 'seller1@example.com' },
    { id: 7, name: 'Apple iPhone 11', price: '₹27,100', category: 'Electronics', image: 'assets/iphone11.png', liked: false, company: 'Apple', subtitle: 'Red', specs: '64GB • Red', description: 'Classic iPhone 11.', sellerEmail: 'seller2@example.com' },
    { id: 8, name: 'Wooden Cot', price: '₹2,800', category: 'Furniture', image: 'assets/woodencot.png', liked: false, company: 'HomeCraft', subtitle: 'Wooden bed', specs: 'King Size • Teak', description: 'Sturdy wooden cot.', sellerEmail: 'seller3@example.com' },
    { id: 9, name: 'Study Table', price: '₹1,400', category: 'Furniture', image: 'assets/studytable.png', liked: false, company: 'StudyPro', subtitle: 'Compact design', specs: 'Wood • Brown', description: 'Perfect study table.', sellerEmail: 'seller4@example.com' },
    { id: 10, name: 'Induction Cooktop', price: '₹4,500', category: 'Electronics', image: 'assets/inductioncooktopprestise.png', liked: false, company: 'Prestige', subtitle: '2-burner', specs: '1200W • Black', description: 'Efficient induction cooktop.', sellerEmail: 'seller5@example.com' },
    { id: 11, name: '32inch Smart TV', price: '₹11,200', category: 'Electronics', image: 'assets/smarttv.png', liked: false, company: 'ViewPlus', subtitle: 'Smart display', specs: 'LED • 1080p', description: 'Compact smart TV.', sellerEmail: 'seller6@example.com' },
    { id: 12, name: 'The Price of Freedom', price: '₹340', category: 'Books', image: 'assets/priceoffreedom.png', liked: false, company: 'Publication House', subtitle: 'Paperback', specs: 'English • 200pg', description: 'A compelling book.', sellerEmail: 'seller7@example.com' },
    { id: 13, name: 'Forensic Science in Criminal Investigation', price: '₹490', category: 'Books', image: 'assets/forensicscience.png', liked: false, company: 'Academic Press', subtitle: 'Reference book', specs: 'Hardcover', description: 'Essential guide.', sellerEmail: 'seller8@example.com' },
    { id: 14, name: 'MRF Cricket Bat', price: '₹3,200', category: 'Sports', image: 'assets/mrfcricketbat.png', liked: false, company: 'MRF', subtitle: 'Professional bat', specs: 'English Willow', description: 'High-quality cricket bat.', sellerEmail: 'seller9@example.com' },
    { id: 15, name: 'Siberian Cat', price: '₹2,200', category: 'Pets', image: 'assets/cat.png', liked: false, company: 'PetMart', subtitle: 'Pet adoption', specs: 'Age: 2 months', description: 'Friendly Siberian cat.', sellerEmail: 'seller10@example.com' },
    { id: 16, name: 'Gold Fish', price: '₹50', category: 'Pets', image: 'assets/fish.png', liked: false, company: 'PetMart', subtitle: 'Aquarium fish', specs: 'Small • Orange', description: 'Beautiful goldfish.', sellerEmail: 'seller11@example.com' },
    { id: 17, name: 'Cooker', price: '₹2,200', category: 'Kitchen', image: 'assets/prestigecooker.png', liked: false, company: 'Prestige', subtitle: 'Pressure cooker', specs: '5 Liters • Steel', description: 'Durable pressure cooker.', sellerEmail: 'seller12@example.com' },
    { id: 18, name: 'Dustbin', category: 'Donation', image: 'assets/dustbin.png', liked: false, company: 'CleanHome', subtitle: 'Plastic bin', specs: 'Medium • Green', description: 'Compact dustbin.', sellerEmail: 'seller13@example.com' },
    { id: 19, name: 'Curtains', category: 'Donation', image: 'assets/curtain.png', liked: false, company: 'HomeDecor', subtitle: 'Window curtains', specs: 'Cotton • Grey', description: 'Elegant curtains.', sellerEmail: 'seller14@example.com' },
    { id: 20, name: 'Fairy Lights', price: '₹100', category: 'Miscellaneous', image: 'assets/fairylights.png', liked: false, company: 'GlowDecor', subtitle: 'String lights', specs: '10m • Warm', description: 'Decorative fairy lights.', sellerEmail: 'seller15@example.com' },
    { id: 21, name: 'Flower Pot', price: '₹70', category: 'Miscellaneous', image: 'assets/flowerpot.png', liked: false, company: 'GardenStyle', subtitle: 'Ceramic pot', specs: '6 inch', description: 'Stylish flower pot.', sellerEmail: 'seller16@example.com' },
    { id: 2, name: 'Smart Watch', price: '₹5,500', category: 'Electronics', image: 'assets/smartwatch.png', liked: false, company: 'WatchPro', subtitle: 'Fitness edition', specs: 'Water Resistant', description: 'Track your health.', sellerEmail: 'seller17@example.com' },
    { id: 3, name: 'Running Shoes', price: '₹1,200', category: 'Fashion', image: 'assets/shoes.png', liked: false, company: 'RunFast', subtitle: 'Lightweight', specs: 'Size 10 • Blue', description: 'Comfortable running shoes.', sellerEmail: 'seller18@example.com' },
    { id: 4, name: 'Laptop', price: '₹37,000', category: 'Electronics', image: 'assets/delllaptop.png', liked: false, company: 'Dell', subtitle: 'Business laptop', specs: '8GB RAM • 256GB SSD', description: 'Reliable Dell laptop.', sellerEmail: 'seller19@example.com' },
    { id: 5, name: 'MacBook Air M2', price: '₹72,500', category: 'Electronics', image: 'assets/macbook.png', liked: false, company: 'Apple', subtitle: 'Midnight', specs: '8GB RAM • 256GB SSD', description: 'Ultra-thin MacBook Air.', sellerEmail: 'seller20@example.com' },
    { id: 6, name: 'Apple iPhone 17 Pro', price: '₹70,000', category: 'Electronics', image: 'assets/iphone17.png', liked: false, company: 'Apple', subtitle: 'Black Titanium', specs: '256GB • Pro Max', description: 'Premium iPhone 17 Pro.', sellerEmail: 'seller21@example.com' }
  ];

  getProducts(): Product[] { return this.products; }

  addProduct(product: Product): Product {
    const maxId = this.products.reduce((max, item) => Math.max(max, item.id || 0), 0);
    const withId = { ...product, id: maxId + 1, isUserProduct: true };
    this.products.push(withId);
    this.productAddedSubject.next();
    return withId;
  }

  deleteProduct(id: number): void {
    this.products = this.products.filter(p => p.id !== id);
    this.productAddedSubject.next();
  }

  updateProduct(id: number, updates: Partial<Product>): void {
    const product = this.products.find(p => p.id === id);
    if (product) {
      Object.assign(product, updates);
      this.productAddedSubject.next();
    }
  }

  public getControlName(field: string): string {
    return field.toLowerCase().replace(/\s+/g, '');
  }

  processImages(images: any[]): string[] {
    return images.map((img: any) => {
      let str = '';
      if (typeof img === 'string') {
        str = img;
      } else if (img && typeof img === 'object') {
        if ('path' in img && typeof img.path === 'string') {
          str = img.path;
        } else if ('url' in img && typeof img.url === 'string') {
          str = img.url;
        }
      }
      const trimmed = str.trim();
      return trimmed.startsWith('/') ? trimmed : '/' + trimmed;
    });
  }

  getProductById(id: number): Product | undefined { return this.products.find(p => p.id === id); }
  getRelatedProducts(id: number): Product[] {
    return this.products.filter(p => p.id !== id).slice(0, 3);
  }
}