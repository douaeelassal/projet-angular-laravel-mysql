import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { User, AuthResponse } from '../models/user.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/api';
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private tokenKey = 'auth_token';

  constructor(private http: HttpClient, private router: Router) {
    this.currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(response => {
          this.storeUserData(response);
        }),
        catchError(error => {
          return throwError(() => error);
        })
      );
  }

  register(name: string, email: string, password: string, password_confirmation: string, role: 'buyer' | 'seller'): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, { 
      name, 
      email, 
      password, 
      password_confirmation, 
      role 
    }).pipe(
      tap(response => {
        this.storeUserData(response);
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => {
        this.clearUserData();
        this.router.navigate(['/login']);
      }),
      catchError(error => {
        this.clearUserData();
        this.router.navigate(['/login']);
        return of(null);
      })
    );
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`).pipe(
      tap(user => {
        this.currentUserSubject.next(user);
      }),
      catchError(error => {
        if (error.status === 401) {
          this.clearUserData();
        }
        return throwError(() => error);
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isBuyer(): boolean {
    const user = this.currentUserValue;
    return !!user && user.role === 'buyer';
  }

  isSeller(): boolean {
    const user = this.currentUserValue;
    return !!user && user.role === 'seller';
  }

  private storeUserData(authResponse: AuthResponse): void {
    localStorage.setItem(this.tokenKey, authResponse.token);
    localStorage.setItem('user', JSON.stringify(authResponse.user));
    this.currentUserSubject.next(authResponse.user);
  }

  private clearUserData(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  private getUserFromStorage(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        this.clearUserData();
      }
    }
    return null;
  }
}