import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { Auth } from '../interfaces/auth';
import { map, Observable } from 'rxjs';
import { LoginDto } from '../interfaces/login-dto';
import { RegisterDto } from '../interfaces/register-dto';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly baseUrl = environment.apiUrl;
  private readonly currentAuth = signal<Auth | null>(null);
  private readonly roles = signal<string[]>(this.getRolesFromToken());

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const storedAuth = localStorage.getItem('auth');
      if (storedAuth) {
        this.currentAuth.set(JSON.parse(storedAuth));
        this.roles.set(this.getRolesFromToken());
      }
    }
  }

  getRolesFromToken(): string[] {
    const auth = this.currentAuth();

    if (!auth || !auth.token) return [];

    const token = auth.token;
    const tokenParts = token.split('.');

    if (tokenParts.length !== 3) return [];

    const payloadBase64 = tokenParts[1];

    try {
      const payloadJson = atob(payloadBase64);
      const payload = JSON.parse(payloadJson);
      let roles = payload.role;

      if (!roles) return [];
      if (!Array.isArray(roles)) roles = [roles];

      return roles;
    } catch (error) {
      console.error('Error parsing token:', error);
      return [];
    }
  }

  login(model: LoginDto): Observable<Auth> {
    return this.http.post<Auth>(`${this.baseUrl}/account/login`, model).pipe(
      map((auth) => {
        this.setCurrentAuth(auth);
        this.roles.set(this.getRolesFromToken());
        return auth;
      })
    );
  }

  register(model: RegisterDto): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/account/register`, model);
  }

  setCurrentAuth(auth: Auth): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('auth', JSON.stringify(auth));
    }
    this.currentAuth.set(auth);
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('auth');
    }
    this.currentAuth.set(null);
    this.roles.set([]);
  }

  getCurrentAuth(): Auth | null {
    return this.currentAuth();
  }

  getRoles(): string[] {
    return this.roles();
  }

  isAuthenticated(): boolean {
    return this.currentAuth() !== null;
  }
}
