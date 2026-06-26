import React, { useState, useEffect } from 'react';
import { productService, Product, getProductImageUrl } from './productService';

export const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  // Edit Form State
  const [formName, setFormName] = useState<string>('');
  const [formPrice, setFormPrice] = useState<number>(0);
  const [formCategory, setFormCategory] = useState<string>('');
  const [formStatus, setFormStatus] = useState<string>('AVAILABLE');
  const [formImages, setFormImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState<string>('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productService.getAllProducts();
      setProducts(data);
    } catch (err: any) {
      setError('Failed to fetch products from database.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Open edit modal with pre-populated data
  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormPrice(product.price);
    setFormCategory(product.category);
    setFormStatus(product.status);
    setFormImages([...product.images]);
    setNewImageUrl('');
  };

  // Save updated product
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      const updates: Partial<Product> = {
        name: formName,
        price: Number(formPrice),
        category: formCategory,
        status: formStatus,
        images: formImages,
      };

      await productService.updateProduct(editingProduct.id, updates);

      // Update state instantly/locally
      setProducts((prev) =>
        prev.map((p) => (p.id === editingProduct.id ? { ...p, ...updates } : p))
      );

      // Close modal
      setEditingProduct(null);
    } catch (err: any) {
      alert('Failed to update product. Please try again.');
      console.error(err);
    }
  };

  // Delete product
  const handleDeleteConfirm = async () => {
    if (!deletingProductId) return;

    try {
      await productService.deleteProduct(deletingProductId);

      // Dynamically filter out deleted product
      setProducts((prev) => prev.filter((p) => p.id !== deletingProductId));
      setDeletingProductId(null);
    } catch (err: any) {
      alert('Failed to delete product. Please try again.');
      console.error(err);
    }
  };

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setFormImages((prev) => [...prev, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormImages((prev) => prev.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2BAE96]"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen text-slate-800 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Products Directory</h1>
            <p className="text-xs text-slate-400 font-medium">Manage all platform products and listings</p>
          </div>
          <button
            onClick={fetchProducts}
            className="px-4 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            Refresh List
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 text-xs font-semibold rounded-xl border border-red-100">
            {error}
          </div>
        )}

        {/* Product Table */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Image</th>
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Price</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-8 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 font-semibold">
                      No products found.
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Image Thumbnail */}
                      <td className="py-4 px-6">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200/50 flex items-center justify-center shrink-0">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={getProductImageUrl(product.images[0])}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'assets/placeholder.png';
                              }}
                            />
                          ) : (
                            <span className="text-[10px] text-slate-400">No Image</span>
                          )}
                        </div>
                      </td>

                      {/* Name */}
                      <td className="py-4 px-6 font-bold text-slate-900 text-sm">
                        {product.name}
                      </td>

                      {/* Category */}
                      <td className="py-4 px-6">{product.category}</td>

                      {/* Price */}
                      <td className="py-4 px-6 font-bold text-slate-900">
                        ₹{product.price.toLocaleString('en-IN')}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase border ${
                            product.status === 'AVAILABLE' || product.status === 'Available'
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                              : product.status === 'SOLD' || product.status === 'Sold'
                              ? 'bg-rose-50 text-rose-600 border-rose-100'
                              : 'bg-amber-50 text-amber-600 border-amber-100'
                          }`}
                        >
                          {product.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-8 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditClick(product)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#00b69b] bg-[#e6f8f5] hover:bg-[#ccf2ec] transition-colors border border-[#d6f4ee]"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeletingProductId(product.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors border border-rose-100"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl flex flex-col gap-4 border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-base">Edit Product</h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#2BAE96]"
                />
              </div>

              {/* Price & Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#2BAE96]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    required
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#2BAE96]"
                  />
                </div>
              </div>

              {/* Status Option */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Listing Status
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#2BAE96] bg-white"
                >
                  <option value="AVAILABLE">AVAILABLE</option>
                  <option value="PENDING">PENDING</option>
                  <option value="SOLD">SOLD</option>
                </select>
              </div>

              {/* Product Images Management */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Product Images
                </label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add image URL or filename"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#2BAE96]"
                    />
                    <button
                      type="button"
                      onClick={handleAddImage}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  {/* Images list */}
                  <div className="grid grid-cols-3 gap-2">
                    {formImages.map((url, idx) => (
                      <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-200 h-16 bg-slate-50">
                        <img
                          src={getProductImageUrl(url)}
                          alt="preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'assets/placeholder.png';
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute inset-0 bg-red-600/75 text-white text-xs font-bold opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#00b69b] rounded-lg hover:bg-[#009688] transition-colors shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingProductId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl flex flex-col gap-4 border border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm">Confirm Permanent Deletion</h3>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              Are you sure you want to delete this product listing? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 mt-2">
              <button
                onClick={() => setDeletingProductId(null)}
                className="px-4 py-2 text-xs font-bold text-slate-500 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition-colors shadow-sm"
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
