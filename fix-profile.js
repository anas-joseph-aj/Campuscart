const fs = require('fs');
const path = 'd:\\otp\\otp-ui\\src\\app\\pages\\profile\\profile.component.ts';
let text = fs.readFileSync(path, 'utf8');

text = text.replace(/title: p\.name \|\| p\.title \|\| 'Product',/, "title: p.name || 'Product',");

text = text.replace(/\s*\/\/ Map to SellerProduct interface[\s\S]*?\}\)\);/, '      this.recentProducts = mergedProducts.slice(0, 3);');

if (!text.includes('private mergeSellerProducts(localProducts: SellerProduct[], backendProducts: SellerProduct[]): SellerProduct[]')) {
  text = text.replace('  // Menu Controllers', `  private mergeSellerProducts(localProducts: SellerProduct[], backendProducts: SellerProduct[]): SellerProduct[] {
    const mergedMap = new Map<number, SellerProduct>();

    backendProducts.forEach(prod => mergedMap.set(prod.id, prod));
    localProducts.forEach(prod => {
      const existing = mergedMap.get(prod.id);
      mergedMap.set(prod.id, existing ? { ...existing, ...prod } : prod);
    });

    return Array.from(mergedMap.values()).sort((a, b) => b.id - a.id);
  }

  // Menu Controllers`);
}

fs.writeFileSync(path, text, 'utf8');
console.log('patch applied');
