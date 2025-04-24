export interface User {
    id: number;
    name: string;
    email: string;
    role: 'buyer' | 'seller';
    created_at?: string;
    updated_at?: string;
  }
  
  export interface AuthResponse {
    user: User;
    token: string;
  }