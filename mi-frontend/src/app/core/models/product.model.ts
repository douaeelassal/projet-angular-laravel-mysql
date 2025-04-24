import { User } from './user.model';

export interface Product {
  id?: number;
  title: string;
  description: string;
  price: number;
  image_path?: string;
  seller_id: number;
  seller?: User;
  status: 'available' | 'sold';
  created_at?: string;
  updated_at?: string;
}