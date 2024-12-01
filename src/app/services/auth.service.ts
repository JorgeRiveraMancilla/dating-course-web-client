import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Auth } from '../interfaces/auth';
import { LoginDto } from '../interfaces/login-dto';
import { RegisterDto } from '../interfaces/register-dto';
import { StorageService } from './storage.service';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(StorageService);
  private readonly tokenService = inject(TokenService);
  private readonly baseUrl = environment.apiUrl;
  private readonly authStorageKey = environment.authStorageKey;

  private readonly currentAuth = signal<Auth | null | undefined>(undefined);
  private readonly roles = signal<string[]>([]);

  constructor() {
    this.initializeAuth();
  }

  login(credentials: LoginDto): Observable<Auth> {
    return this.http
      .post<Auth>(`${this.baseUrl}/account/login`, credentials)
      .pipe(
        map((auth) => {
          this.handleSuccessfulAuth(auth);
          return auth;
        })
      );
  }

  register(userData: RegisterDto): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/account/register`, userData);
  }

  logout(): void {
    this.storage.removeItem(this.authStorageKey);
    this.clearAuthState();
  }

  getCurrentAuth(): Auth | null | undefined {
    return this.currentAuth();
  }

  setCurrentAuth(auth: Auth): void {
    this.storage.setItem(this.authStorageKey, auth);
    this.currentAuth.set(auth);
    this.updateRoles(auth);
  }

  getRoles(): string[] {
    return this.roles();
  }

  isAuthenticated(): boolean {
    const auth = this.currentAuth();
    return auth !== null && auth !== undefined;
  }

  isAuthInitialized(): boolean {
    return this.currentAuth() !== undefined;
  }

  // Private methods
  private initializeAuth(): void {
    const storedAuth = this.storage.getItem<Auth>(this.authStorageKey);

    if (storedAuth) {
      this.handleSuccessfulAuth(storedAuth);
    } else {
      this.currentAuth.set(null);
    }
  }

  private handleSuccessfulAuth(auth: Auth): void {
    this.storage.setItem(this.authStorageKey, auth);
    this.currentAuth.set(auth);
    this.updateRoles(auth);
  }

  private updateRoles(auth: Auth): void {
    if (!auth?.token) {
      this.roles.set([]);
      return;
    }

    const { payload, isValid } = this.tokenService.parseToken(auth.token);
    if (!isValid) {
      this.clearAuthState();
      return;
    }

    const roles = this.tokenService.extractRoles(payload);
    this.roles.set(roles);
  }

  private clearAuthState(): void {
    this.currentAuth.set(null);
    this.roles.set([]);
  }
}
