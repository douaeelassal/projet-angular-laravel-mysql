import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Order } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) { }

  getMyOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/my-orders`).pipe(
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  getOrder(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/orders/${id}`).pipe(
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  createOrder(productId: number): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/orders`, { product_id: productId }).pipe(
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  updateOrderStatus(orderId: number, status: 'pending' | 'completed' | 'cancelled'): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/orders/${orderId}/status`, { status }).pipe(
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  // Simuler une transaction de paiement (dans une application réelle, cela serait géré par un service de paiement)
  processPayment(orderId: number, paymentDetails: any): Observable<any> {
    // Simuler API de paiement
    console.log('Processing payment for order', orderId, 'with details:', paymentDetails);
    
    // Remplacer par une véritable intégration de paiement
    return new Observable(observer => {
      setTimeout(() => {
        observer.next({ success: true, message: 'Payment processed successfully' });
        observer.complete();
      }, 1500);
    });
  }
}