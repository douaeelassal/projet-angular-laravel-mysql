import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Conversation, Message } from '../models/message.model';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) { }

  getConversations(): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${this.apiUrl}/conversations`).pipe(
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  getProductMessages(productId: number): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/products/${productId}/messages`).pipe(
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  sendMessage(productId: number, receiverId: number, content: string): Observable<Message> {
    return this.http.post<Message>(`${this.apiUrl}/messages`, {
      product_id: productId,
      receiver_id: receiverId,
      content
    }).pipe(
      catchError(error => {
        return throwError(() => error);
      })
    );
  }
}