import axios from 'axios';

const BASE_URL = 'http://localhost:3000';
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  role: string;
  address: string;
  phone: string;
  avatar: string;
  delivery_address: string;
  is_active?: boolean;
}

interface ProductFormData {
  name: string;
  price: number;
  description: string;
  description_detail?: string;
  image: string;
  category: number;
  available: boolean;
  unit: string;
  slug: string;
  discount_price?: number;
  start_discount?: string;
  end_discount?: string;
  quantity_in_stock: number;
  supplier: number;
}

interface CategoryFormData {
  name: string;
  slug: string;
  image?: string;
  parent_id?: number;
}

interface SupplierFormData {
  name: string;
  address: string;
  phone: string;
  email: string;
}

interface UserFormData {
  name: string;
  email: string;
  password?: string;
  role: string;
  address: string;
  phone: string;
  avatar?: string;
  delivery_address?: string;
  is_active?: boolean;
}

interface PromotionFormData {
  code: string;
  discountValue: number;
  discountType: 'percentage' | 'fixed';
  validFrom: string;
  validTo: string;
  isActive: boolean;
  min_order_value: number;
  max_discount_amount: number;
  usage_limit: number;
  usage_count?: number;
}

export const getProducts = () => api.get('/products');
export const getProductById = (id: number) => api.get(`/products/${id}`);
export const addProduct = (data: ProductFormData) => api.post('/products', data);
export const updateProduct = (id: number, data: Partial<ProductFormData>) => api.put(`/products/${id}`, data);
export const deleteProduct = (id: number) => api.delete(`/products/${id}`);
export const getCartItems = () => api.get('/cart-items');
export const addCartItem = (data: { productId: number; quantity: number }) => api.post('/cart-items', data);
export const updateCartItem = (id: number, data: { quantity: number }) => api.patch(`/cart-items/${id}`, data);
export const removeCartItem = (id: number) => api.delete(`/cart-items/${id}`);
export const createOrder = (data: any) => api.post('/orders', data);
export const applyPromotion = (code: string) => api.get(`/promotions/code/${code}`);
export const register = (data: RegisterFormData) => api.post('/auth/register', data);
export const login = (data: { email: string; password: string }) => api.post('/auth/login', data);
export const getChatMessages = (receiverId: number) => api.get(`/chat-messages/${receiverId}`);
export const sendChatMessage = (data: { receiverId: number; message: string }) => api.post('/chat-messages', data);
export const getSupplier = (id: number) => api.get(`/suppliers/${id}`);
export const getSuppliers = () => api.get('/suppliers');
export const createSupplier = (data: SupplierFormData) => api.post('/suppliers', data);
export const updateSupplier = (id: number, data: Partial<SupplierFormData>) => api.put(`/suppliers/${id}`, data);
export const deleteSupplier = (id: number) => api.delete(`/suppliers/${id}`);
export const createCategory = (data: CategoryFormData) => api.post('/categories', data);
export const updateCategory = (id: number, data: Partial<CategoryFormData>) => api.put(`/categories/${id}`, data);
export const deleteCategory = (id: number) => api.delete(`/categories/${id}`);
export const getPaymentMethods = () => api.get('/payment-methods');
export const getCategories = () => api.get('/categories');
export const getProductsByCategory = (categoryId: number) => api.get(`/categories/${categoryId}/products`);
export const getUsers = () => api.get('/users');
export const getUserById = (id: number) => api.get(`/users/${id}`);
export const createUser = (data: UserFormData) => api.post('/users', data);
export const updateUser = (id: number, data: Partial<UserFormData>) => api.put(`/users/${id}`, data);
export const deleteUser = (id: number) => api.delete(`/users/${id}`);
export const getPromotions = () => api.get('/promotions');
export const getPromotionById = (id: number) => api.get(`/promotions/${id}`);
export const addPromotion = (data: PromotionFormData) => api.post('/promotions', data);
export const updatePromotion = (id: number, data: Partial<PromotionFormData>) => api.put(`/promotions/${id}`, data);
export const deletePromotion = (id: number) => api.delete(`/promotions/${id}`);
export const togglePromotionActive = (id: number) => api.patch(`/promotions/${id}/toggle`);