export interface Product {
  _id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  category: {
    _id: number;
    name: string;
    slug: string;
    image?: string;
    parent_id?: number;
  };
  available: boolean;
  unit: string;
  slug: string;
  quantity_in_stock: number;
  supplier: {
    _id: number;
    name: string;
    address: string;
    phone: string;
    email: string;
  };
  createdBy: {
    _id: number;
    name: string;
    email: string;
    role: string;
  };
  description_detail?: string;
  discount_price?: number;
  start_discount?: string;
  end_discount?: string;
  averageRating?: number;
  totalFeedbacks?: number;
}

export interface Category {
  _id: number;
  name: string;
  slug: string;
  image?: string;
  parent_id?: number;
}

export interface Supplier {
  _id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
}

export interface CartItem {
  _id: number;
  product: Product;
  quantity: number;
  productId: number;
}

export interface Promotion {
  _id: number;
  code: string;
  discountValue: number;
  discountType: 'percentage' | 'fixed';
  validFrom: string;
  validTo: string;
  isActive: boolean;
  min_order_value: number;
  max_discount_amount: number;
  usage_limit: number;
  usage_count: number;
}

export interface ChatMessage {
  _id: number;
  sender: User;
  receiver: User;
  content: string;
  createdAt: string;
}

export interface PaymentMethod {
  id: number;
  name: string;
  value: string;
}

export interface User {
  _id: number;
  name: string;
  email: string;
  role: string;
  address: string;
  phone: string;
  avatar?: string;
  delivery_address?: string;
  is_active?: boolean;
}

export interface Feedback {
  _id: number;
  rating: number;
  comment: string;
  product: Product;
  user: User;
  createdAt: string;
}

export interface Order {
  _id: number;
  user: User;
  orderItems: {
    _id: number;
    product: Product;
    quantity: number;
  }[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}