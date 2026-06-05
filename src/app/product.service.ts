import { Injectable } from '@angular/core';

export interface Product {
  id: number;
  name: string;
  price?: string;
  category: string;
  categories?: string[];
  image: string;
  liked: boolean;
  subtitle?: string;
  company?: string;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private products: Product[] = [
    { id: 1, name: 'iPhone 16', price: '₹69,900', category: 'Electronics', image: 'assets/iphone16.png', liked: false, company: 'Apple', subtitle: 'Latest model', description: 'Brand new Apple iPhone 16 with premium performance and camera.' },
    { id: 2, name: 'Smart Watch', price: '₹5,500', category: 'Electronics', image: 'assets/smartwatch.png', liked: false, company: 'WatchPro', subtitle: 'Fitness edition', description: 'Track your health and workouts with this sleek smartwatch.' },
    { id: 3, name: 'Running Shoes', price: '₹1,200', category: 'Fashion', image: 'assets/shoes.png', liked: false, company: 'RunFast', subtitle: 'Lightweight', description: 'Comfortable running shoes designed for everyday training.' },
    { id: 4, name: 'Laptop', price: '₹37,000', category: 'Electronics', image: 'assets/delllaptop.png', liked: false, company: 'Dell', subtitle: 'Business laptop', description: 'Reliable Dell laptop with solid performance for study and work.' },
    { id: 5, name: 'MacBook Air M2', price: '₹72,500', category: 'Electronics', image: 'assets/macbook.png', liked: false, company: 'Apple', subtitle: 'Midnight', description: 'Ultra-thin Apple MacBook Air with M2 chip for smooth productivity.' },
    { id: 6, name: 'Apple iPhone 17 Pro', price: '₹70,000', category: 'Electronics', image: 'assets/iphone17.png', liked: false, company: 'Apple', subtitle: 'Black Titanium', description: 'Premium Apple iPhone 17 Pro with advanced camera and display.' },
    { id: 7, name: 'Apple iPhone 11', price: '₹27,100', category: 'Electronics', image: 'assets/iphone11.png', liked: false, company: 'Apple', subtitle: 'Red', description: 'Classic Apple iPhone 11 in a striking red finish.' },
    { id: 8, name: 'Wooden Cot', price: '₹2,800', category: 'Furniture', image: 'assets/woodencot.png', liked: false, company: 'HomeCraft', subtitle: 'Wooden bed', description: 'Sturdy wooden cot with comfortable design for your bedroom.' },
    { id: 9, name: 'Study Table', price: '₹1,400', category: 'Furniture', image: 'assets/studytable.png', liked: false, company: 'StudyPro', subtitle: 'Compact design', description: 'Perfect study table for small rooms with organized storage.' },
    { id: 10, name: 'Induction Cooktop', price: '₹4,500', category: 'Electronics', image: 'assets/inductioncooktopprestige.png', liked: false, company: 'Prestige', subtitle: '2-burner', description: 'Efficient induction cooktop for quick and safe cooking.' },
    { id: 11, name: '32inch Smart TV', price: '₹11,200', category: 'Electronics', image: 'assets/smarttv.png', liked: false, company: 'ViewPlus', subtitle: 'Smart display', description: 'Compact smart TV with crisp picture quality.' },
    { id: 12, name: 'The Price of Freedom', price: '₹340', category: 'Books', image: 'assets/priceoffreedom.png', liked: false, company: 'Publication House', subtitle: 'Paperback', description: 'A compelling book about rights, justice, and liberty.' },
    { id: 13, name: 'Forensic Science in Criminal Investigation', price: '₹490', category: 'Books', image: 'assets/forensicscience.png', liked: false, company: 'Academic Press', subtitle: 'Reference book', description: 'Essential guide for forensic investigation and evidence analysis.' },
    { id: 14, name: 'MRF Cricket Bat', price: '₹3,200', category: 'Sports', image: 'assets/mrfcricketbat.png', liked: false, company: 'MRF', subtitle: 'Professional bat', description: 'High-quality cricket bat built for power and control.' },
    { id: 15, name: 'Siberian Cat', price: '₹2,200', category: 'Pets', image: 'assets/cat.png', liked: false, company: 'PetMart', subtitle: 'Pet adoption', description: 'Friendly Siberian cat looking for a loving home.' },
    { id: 16, name: 'Gold Fish', price: '₹50', category: 'Pets', image: 'assets/fish.png', liked: false, company: 'PetMart', subtitle: 'Aquarium fish', description: 'Beautiful goldfish perfect for aquarium beginners.' },
    { id: 17, name: 'Cooker', price: '₹2,200', category: 'Kitchen', image: 'assets/prestigecooker.png', liked: false, company: 'Prestige', subtitle: 'Pressure cooker', description: 'Durable pressure cooker for fast and safe cooking.' },
    { id: 18, name: 'Dustbin', category: 'Donation', image: 'assets/dustbin.png', liked: false, company: 'CleanHome', subtitle: 'Plastic bin', description: 'Compact dustbin ideal for home or office use.' },
    { id: 19, name: 'Curtains', category: 'Donation', image: 'assets/curtain.png', liked: false, company: 'HomeDecor', subtitle: 'Window curtains', description: 'Elegant curtains to brighten up your living room.' },
    { id: 20, name: 'Fairy Lights', price: '₹100', category: 'Miscellaneous', image: 'assets/fairylights.png', liked: false, company: 'GlowDecor', subtitle: 'String lights', description: 'Decorative fairy lights for a cozy atmosphere.' },
    { id: 21, name: 'Flower Pot', price: '₹70', category: 'Miscellaneous', image: 'assets/flowerpot.png', liked: false, company: 'GardenStyle', subtitle: 'Ceramic pot', description: 'Stylish flower pot for indoor plants.' },
    { id: 22, name: 'Hero Xtreme 160R 4V', price: '₹45,000', category: 'Vehicles', image: 'assets/herobike.png', liked: false, company: 'Hero', subtitle: 'Sports bike', description: 'Reliable bike with great performance for daily rides.' },
    { id: 23, name: 'Electric Kettle', price: '₹1,500', category: 'Electronics', categories: ['Electronics'], image: 'assets/kettle.png', liked: false, company: 'KitchenPro', subtitle: 'Fast boil kettle', description: 'Electric kettle with quick heating and auto shutoff.' },
    { id: 24, name: 'Samsung Fridge', price: '₹2,500', category: 'Electronics', categories: ['Electronics'], image: 'assets/fridge.png', liked: false, company: 'Samsung', subtitle: 'Double Door', description: 'Samsung double-door refrigerator in excellent condition.' }
  ];

  getProducts(): Product[] {
    return this.products;
  }

  getProductById(id: number): Product | undefined {
    return this.products.find(product => product.id === id);
  }

  getRelatedProducts(currentId: number): Product[] {
    const current = this.getProductById(currentId);
    if (!current) {
      return this.products.filter(product => product.id !== currentId).slice(0, 3);
    }
    const sameCategory = this.products.filter(product => product.category === current.category && product.id !== currentId);
    return sameCategory.length >= 3 ? sameCategory.slice(0, 3) : this.products.filter(product => product.id !== currentId).slice(0, 3);
  }
}
