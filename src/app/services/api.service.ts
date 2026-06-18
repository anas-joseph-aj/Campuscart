import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError, Subject } from 'rxjs';
import { map, switchMap, catchError, tap } from 'rxjs/operators';
import { Product } from '../product.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://10.204.205.47:8080';

  // Subject to notify components when product data changes
  private productRefreshSubject = new Subject<void>();
  // Observable for external subscription
  productRefresh$ = this.productRefreshSubject.asObservable();

  // Subject to notify components when profile data changes
  private profileRefreshSubject = new Subject<void>();
  // Observable for external subscription
  profileRefresh$ = this.profileRefreshSubject.asObservable();

  constructor(private http: HttpClient) { }

  // Call this after any product mutation (add, update, delete) to trigger a refresh
  triggerProductRefresh(): void {
    this.productRefreshSubject.next();
  }

  // Call this after any profile mutation (update) to trigger a refresh
  triggerProfileRefresh(): void {
    this.profileRefreshSubject.next();
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  /** Get all categories */
  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/categories`);
  }

  /** Get seller's products */
  getSellerProducts(email: string): Observable<Product[]> {
    const encodedEmail = encodeURIComponent(email);
    return this.http.get<Product[]>(`${this.baseUrl}/api/products/seller/${encodedEmail}`).pipe(
      map(products => products.map(this.transformProduct.bind(this)))
    );
  }



  /** Get all products */
  getAllProducts(): Observable<Product[]> {
    return this.http
      .get<Product[]>(`${this.baseUrl}/api/products`)
      .pipe(map(products => products.map(this.transformProduct.bind(this))));
  }

  /** Get latest products */
  getLatestProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/api/products/latest`);
  }

  /** Search products by keyword */
  searchProducts(keyword: string): Observable<Product[]> {
    return this.http
      .get<Product[]>(`${this.baseUrl}/api/products/search/${keyword}`)
      .pipe(map(products => products.map(this.transformProduct.bind(this))));
  }

  /** Get products by category */
  getProductsByCategory(category: string): Observable<Product[]> {
    return this.http
      .get<Product[]>(`${this.baseUrl}/api/products/category/${category}`)
      .pipe(map(products => products.map(this.transformProduct.bind(this))));
  }

  /** Normalize an image path returned from the backend, including leading slash paths */
  public normalizeImageUrl(imageUrl?: string | null): string | null {
    if (!imageUrl) {
      return null;
    }

    const trimmed = imageUrl.toString().trim();
    if (!trimmed) {
      return null;
    }

    if (trimmed.startsWith('http') || trimmed.startsWith('assets/')) {
      return trimmed;
    }

    if (trimmed.startsWith('/')) {
      return `${this.baseUrl}${trimmed}`;
    }

    return `${this.baseUrl}/${trimmed}`;
  }

  private extractProfileImage(profile: any): string | null {
    if (!profile || typeof profile !== 'object') {
      return null;
    }

    const candidateFields = [
      profile.profileImage,
      profile.profile_image,
      profile.avatarUrl,
      profile.avatar_url,
      profile.image,
      profile.picture,
      profile.photo,
      profile.profilePic,
      profile.profile_pic,
      profile.profile_image_url,
      profile.photoUrl,
      profile.photo_url
    ];

    for (const field of candidateFields) {
      const normalized = this.normalizeImageUrl(field);
      if (normalized) {
        return normalized;
      }
    }

    // Search nested objects if needed
    const nested = profile.data || profile.result || profile.profile || profile.user;
    if (nested && typeof nested === 'object' && nested !== profile) {
      return this.extractProfileImage(nested);
    }

    return null;
  }

  /** Get seller profile by email */
  getSellerProfile(email: string): Observable<any> {
    const encodedEmail = encodeURIComponent(email);
    return this.http.get<any>(`${this.baseUrl}/user/profile/${encodedEmail}`).pipe(
      map(response => {
        let profile = response;
        if (response && typeof response === 'object') {
          if (response.data && typeof response.data === 'object') {
            profile = response.data;
          } else if (response.result && typeof response.result === 'object') {
            profile = response.result;
          }
        }
        if (profile) {
          const profileImage = this.extractProfileImage(profile);
          if (profileImage) {
            profile.profileImage = profileImage;
          }
        }
        return profile;
      })
    );
  }

  /** Save/Update user profile */
  saveUserProfile(profileData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/user/save`, profileData).pipe(
      tap(() => this.triggerProfileRefresh())
    );
  }

  /** Upload profile image and return the saved path */
  uploadProfileImage(imageFile: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', imageFile, imageFile.name);
    return this.http.post<any>(`${this.baseUrl}/user/upload-profile`, formData);
  }

  /** Get product by ID */
  getProductById(id: string): Observable<Product> {
    return this.http
      .get<Product>(`${this.baseUrl}/api/products/id/${id}`)
      .pipe(map(product => this.transformProduct(product)));
  }

  /** Get chat list for a user */
  getUserChats(email: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/chat/user/${encodeURIComponent(email)}`);
  }

  /** Get conversation between two users */
  getConversation(senderEmail: string, receiverEmail: string): Observable<any> {
    const encodedSender = encodeURIComponent(senderEmail);
    const encodedReceiver = encodeURIComponent(receiverEmail);
    return this.http.get<any>(`${this.baseUrl}/chat/conversation?senderEmail=${encodedSender}&receiverEmail=${encodedReceiver}`);
  }

  /** Upload a file attachment */
  uploadAttachment(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<any>(`${this.baseUrl}/chat/upload`, formData);
  }

  /** Upload report attachment(s) */
  uploadReportAttachment(files: File[], userEmail: string): Observable<string[]> {
    const formData = new FormData();
    formData.append('userEmail', userEmail);
    files.forEach(file => {
      formData.append('files', file, file.name);
    });
    return this.http
      .post<string[]>(`${this.baseUrl}/report/upload`, formData)
      .pipe(
        catchError(err => {
          console.error('Report attachment upload failed', err);
          return throwError(() => err);
        })
      );
  }

  /** Send a chat message */
  sendMessage(message: any): Observable<any> {
    const payload: any = {
      senderEmail: message.senderEmail || message.sender || '',
      receiverEmail: message.receiverEmail || message.receiver || '',
      message: message.message ?? message.content ?? ''
    };

    if (message.productId) {
      payload.productId = message.productId;
    }
    if (message.attachmentUrl || message.fileUrl) {
      payload.attachmentUrl = message.attachmentUrl || message.fileUrl;
    }
    if (message.voiceUrl) {
      payload.voiceUrl = message.voiceUrl;
    }
    if (message.replyToMessageId) {
      payload.replyToMessageId = message.replyToMessageId;
    }
    if (message.replyToMessage) {
      payload.replyToMessage = message.replyToMessage;
    }
    if (message.replyToSender) {
      payload.replyToSender = message.replyToSender;
    }

    return this.http.post<any>(`${this.baseUrl}/chat/send`, payload);
  }

  /** Upload a voice message */
  uploadVoice(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('audio', file, file.name);
    return this.http.post<any>(`${this.baseUrl}/chat/upload-voice`, formData);
  }

  /** Mark messages as seen */
  markSeen(receiverEmail: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/chat/seen?receiverEmail=${encodeURIComponent(receiverEmail)}`, {});
  }

  /** Unsend a message for everyone */
  unsendMessage(chatId: string, email: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/chat/delete-for-everyone?chatId=${encodeURIComponent(chatId)}&email=${encodeURIComponent(email)}`, {});
  }

  /** Get products by category and keyword */
  getProductsByCategoryAndKeyword(category: string, keyword: string): Observable<Product[]> {
    return this.http
      .get<Product[]>(
        `${this.baseUrl}/api/products/category/${category}/search/${keyword}`
      )
      .pipe(map(products => products.map(this.transformProduct.bind(this))));
  }

  /** Transform product image URLs to absolute paths */
  private transformProduct(product: Product): Product {
    // Handle main image
    if (product.image && !product.image.startsWith('http')) {
      // If the image is a local asset, keep it unchanged
      if (product.image.startsWith('assets/')) {
        // no change
      } else {
        product.image = `${this.baseUrl}${product.image}`;
      }
    }
    // Handle images array
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      // Ensure a primary image exists
      if (!product.image) {
        const firstImg = product.images[0];
        if (typeof firstImg === 'string') {
          product.image = firstImg.startsWith('http') || firstImg.startsWith('assets/')
            ? firstImg
            : `${this.baseUrl}${firstImg}`;
        } else if (firstImg && typeof firstImg === 'object') {
          if ('path' in firstImg && typeof (firstImg as any).path === 'string') {
            const p = (firstImg as any).path;
            product.image = p.startsWith('http') || p.startsWith('assets/') ? p : `${this.baseUrl}${p}`;
          } else if ('url' in firstImg && typeof (firstImg as any).url === 'string') {
            product.image = (firstImg as any).url;
          }
        }
      }
      // Transform each image in the array
      product.images = product.images.map(img => {
        if (typeof img === 'string') {
          return img.startsWith('http') || img.startsWith('assets/') ? img : `${this.baseUrl}${img}`;
        } else if (img && typeof img === 'object') {
          if ('path' in img && typeof (img as any).path === 'string') {
            const p = (img as any).path;
            return p.startsWith('http') || p.startsWith('assets/') ? p : `${this.baseUrl}${p}`;
          }
          if ('url' in img && typeof (img as any).url === 'string') {
            return (img as any).url;
          }
        }
        return '';
      });
    }
    if (!product.sellerEmail) {
      const productAny = product as any;
      if (productAny.seller && typeof productAny.seller === 'string') {
        product.sellerEmail = productAny.seller;
      } else if (productAny.seller && typeof productAny.seller === 'object') {
        product.sellerEmail = productAny.seller.email || productAny.seller.userEmail || productAny.seller.emailAddress || productAny.seller.username || productAny.sellerId || productAny.seller?.id || productAny.seller?.profileEmail || productAny.seller?.contactEmail || productAny.seller?.emailId || productAny.seller?.user?.email || productAny.owner?.email || productAny.user?.email;
      } else if (productAny.sellerEmailAddress) {
        product.sellerEmail = productAny.sellerEmailAddress;
      }
    }

    if (!product.sellerName) {
      const sellerInfo = product.seller || (product as any).owner || (product as any).user || (product as any).sellerInfo;
      if (sellerInfo && typeof sellerInfo === 'object') {
        product.sellerName = sellerInfo.name || sellerInfo.fullName || sellerInfo.displayName || sellerInfo.username || [sellerInfo.firstName, sellerInfo.lastName].filter(Boolean).join(' ') || sellerInfo.email || sellerInfo.userName || sellerInfo.userFullName || sellerInfo.sellerName || '';
      }
    }

    // Handle sold status from various backend formats
    const anyProd = product as any;
    product.sold = anyProd.sold === true || 
                   (typeof anyProd.status === 'string' && ['SOLD', 'sold', 'Inactive'].includes(anyProd.status)) ||
                   anyProd.sold === 'true';

    return product;
  }

  /** Add a new product (POST) */
  addProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(`${this.baseUrl}/api/products/add`, product);
  }

  /** Get available products */
  getAvailableProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/api/products/available`);
  }

  /** Get category statistics */
  getCategoryStats(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/products/category-stats`);
  }

  /** Update an existing product (PUT) */
  updateProduct(id: number, product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.baseUrl}/api/products/${id}`, product);
  }

  /** Mark a product as sold */
  markProductSold(id: number): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/api/products/sold/${id}`, {});
  }

  /** Delete a product */
  deleteProduct(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/api/products/${id}`);
  }

  /** Upload multiple product images */
  uploadImages(files: File[], userEmail: string): Observable<string[]> {
    const formData = new FormData();
    formData.append('userEmail', userEmail);
    files.forEach(file => {
      formData.append('images', file, file.name);
    });
    console.log('Uploading', files.length, 'image(s) to', `${this.baseUrl}/api/products/upload-images`);
    return this.http
      .post<string[]>(`${this.baseUrl}/api/products/upload-images`, formData)
      .pipe(
        catchError(err => {
          console.error('Image upload failed', err);
          return throwError(() => err);
        })
      );
  }

  /** Add a product with images */
  addProductWithImages(product: Product, files: File[], userEmail: string): Observable<Product> {
    return this.uploadImages(files, userEmail).pipe(
      map((imagePaths: string[]) => {
        const pathsArray = imagePaths;
        product.images = pathsArray;
        product.image = pathsArray[0] || '';
        return product;
      }),
      switchMap(p => this.addProduct(p))
    );
  }

  /** Upload report screenshot */
  uploadReportScreenshot(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('image', file, file.name);
    return this.http.post(`${this.baseUrl}/report/upload-image`, formData, { responseType: 'text' });
  }

  /** Get wishlist items for a user */
  getWishlist(email: string): Observable<any[]> {
    const encodedEmail = encodeURIComponent(email);
    return this.http.get<any[]>(`${this.baseUrl}/wishlist/${encodedEmail}`);
  }

  /** Add a product to wishlist */
  addToWishlist(email: string, productId: number | string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/wishlist/add`, {
      userEmail: email,
      productId: productId
    });
  }

  /** Remove a product from wishlist */
  removeFromWishlist(email: string, productId: number | string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/wishlist/remove/${encodeURIComponent(email)}/${productId}`);
  }

  /** Submit a user report */
  submitReport(report: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/report/add`, report);
  }

  /** Submit user feedback */
  submitFeedback(payload: { userEmail: string; rating: number; feedback: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/feedback/add`, payload);
  }
}
