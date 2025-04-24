import { User } from './user.model';
import { Product } from './product.model';

export interface Message {
  id?: number;
  sender_id: number;
  sender?: User;
  receiver_id: number;
  receiver?: User;
  product_id: number;
  product?: Product;
  content: string;
  created_at?: string;
  updated_at?: string;
}

export interface Conversation {
  product_id: number;
  product?: Product;
  other_user_id: number;
  other_user?: User;
  last_message?: Message;
}