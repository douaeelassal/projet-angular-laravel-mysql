import { User } from './user.model';
import { Product } from './product.model';

export interface Order {
  id?: number;
  buyer_id: number;
  buyer?: User;
  product_id: number;
  product?: Product;
  status: 'pending' | 'completed' | 'cancelled';
  created_at?: string;
  updated_at?: string;
}