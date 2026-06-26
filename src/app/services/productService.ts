import axios from 'axios';

// ==========================================
// 1. Types & Interfaces
// ==========================================

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  status: 'AVAILABLE' | 'SOLD' | 'PENDING' | string;
  sellerName?: string;
  sellerEmail?: string;
  images: string[];
}

export interface UploadImagesResponse {
  message: string;
  imageUrls: string[];
}

export interface ActionResponse {
  message: string;
}

// ==========================================
// Axios Configuration
// ==========================================

const API_BASE_URL = 'http://localhost:8080';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Image utility mapping rule
export const getProductImageUrl = (filenameOrUrl: string): string => {
  if (!filenameOrUrl) return '';
  if (filenameOrUrl.startsWith('http://') || filenameOrUrl.startsWith('https://') || filenameOrUrl.startsWith('assets/')) {
    return filenameOrUrl;
  }
  return `${API_BASE_URL}/uploads/${filenameOrUrl}`;
};

// ==========================================
// 2. API Functions
// ==========================================

export const productService = {
  /**
   * Fetch all products (for the admin product table).
   * GET /admin/products
   */
  async getAllProducts(): Promise<Product[]> {
    try {
      const response = await apiClient.get<Product[]>('/admin/products');
      return response.data;
    } catch (error: any) {
      console.error('Error in getAllProducts:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Fetch the latest added products (for the dashboard widget).
   * GET /admin/products/latest
   */
  async getLatestProducts(): Promise<Product[]> {
    try {
      const response = await apiClient.get<Product[]>('/admin/products/latest');
      return response.data;
    } catch (error: any) {
      console.error('Error in getLatestProducts:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Upload multiple product images.
   * POST /api/products/upload-images
   * Content-Type: multipart/form-data
   */
  async uploadImages(files: File[]): Promise<UploadImagesResponse> {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('images', file);
      });

      const response = await apiClient.post<UploadImagesResponse>(
        '/api/products/upload-images',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error in uploadImages:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Update details of an existing product.
   * PUT /admin/product/{id}
   */
  async updateProduct(id: string, updates: Partial<Product>): Promise<ActionResponse> {
    try {
      const response = await apiClient.put<ActionResponse>(`/admin/product/${id}`, updates);
      return response.data;
    } catch (error: any) {
      console.error(`Error in updateProduct for ID ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Permanently delete a product from the database.
   * DELETE /admin/product/{id}
   */
  async deleteProduct(id: string): Promise<ActionResponse> {
    try {
      const response = await apiClient.delete<ActionResponse>(`/admin/product/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error in deleteProduct for ID ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },
};
