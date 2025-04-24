import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) { }

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products`).pipe(
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/products/${id}`).pipe(
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  getSellerProducts(sellerId: number): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/sellers/${sellerId}/products`).pipe(
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  getMyProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/my-products`).pipe(
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  createProduct(product: Product, image: File | null): Observable<Product> {
    const formData = new FormData();
    formData.append('title', product.title);
    formData.append('description', product.description);
    formData.append('price', product.price.toString());
    
    if (image) {
      formData.append('image', image);
    }

    return this.http.post<Product>(`${this.apiUrl}/products`, formData).pipe(
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  updateProduct(id: number, product: Partial<Product>, image?: File): Observable<Product> {
    const formData = new FormData();
    
    if (product.title) formData.append('title', product.title);
    if (product.description) formData.append('description', product.description);
    if (product.price) formData.append('price', product.price.toString());
    if (product.status) formData.append('status', product.status);
    
    if (image) {
      formData.append('image', image);
    }

    return this.http.post<Product>(`${this.apiUrl}/products/${id}?_method=PUT`, formData).pipe(
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/products/${id}`).pipe(
      catchError(error => {
        return throwError(() => error);
      })
    );
  }
}