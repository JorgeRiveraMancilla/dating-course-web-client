import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { Auth } from '../interfaces/auth';
import { LoginDto } from '../interfaces/login-dto';
import { RegisterDto } from '../interfaces/register-dto';
import { StorageService } from './storage.service';
import { TokenService } from './token.service';
import { AuthState } from '../interfaces/auth-state';
import { ChangePasswordForm } from '../interfaces/change-password-form';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(StorageService);
  private readonly tokenService = inject(TokenService);

  private readonly state = signal<AuthState>({
    currentAuth: null,
    roles: [],
    isInitialized: false,
  });

  async initializeAuth(): Promise<void> {
    const storedAuth = this.storage.getItem<Auth>(environment.authStorageKey);

    if (storedAuth) {
      this.handleSuccessfulAuth(storedAuth);
    }

    this.state.update((state) => {
      return {
        ...state,
        isInitialized: true,
      };
    });
  }

  getCurrentAuth(): Auth | null {
    return this.state().currentAuth;
  }

  setCurrentAuth(auth: Auth): void {
    if (!auth?.token) {
      this.clearAuthState();
      return;
    }

    const { payload, isValid } = this.tokenService.parseToken(auth.token);
    if (!isValid) {
      this.clearAuthState();
      return;
    }

    const roles = this.tokenService.extractRoles(payload);

    this.storage.setItem(environment.authStorageKey, auth);

    this.state.set({
      currentAuth: auth,
      roles,
      isInitialized: true,
    });
  }

  getRoles(): string[] {
    return this.state().roles;
  }

  getIsInitialized(): boolean {
    return this.state().isInitialized;
  }

  async login(credentials: LoginDto): Promise<Auth> {
    const auth = await firstValueFrom(
      this.http.post<Auth>(`${environment.apiUrl}/account/login`, credentials)
    );
    this.handleSuccessfulAuth(auth);
    return auth;
  }

  register(userData: RegisterDto): Observable<void> {
    return this.http.post<void>(
      `${environment.apiUrl}/account/register`,
      userData
    );
  }

  logout(): void {
    this.storage.removeItem(environment.authStorageKey);
    this.clearAuthState();
  }

  changePassword(changePasswordData: ChangePasswordForm): Observable<void> {
    return this.http.post<void>(
      `${environment.apiUrl}/account/change-password`,
      changePasswordData
    );
  }

  private handleSuccessfulAuth(auth: Auth): void {
    if (!auth?.token) {
      this.clearAuthState();
      return;
    }

    const { payload, isValid } = this.tokenService.parseToken(auth.token);

    if (!isValid) {
      this.clearAuthState();
      return;
    }

    const roles = this.tokenService.extractRoles(payload);

    this.storage.setItem(environment.authStorageKey, auth);
    this.state.set({
      currentAuth: auth,
      roles,
      isInitialized: true,
    });
  }

  private clearAuthState(): void {
    this.state.set({
      currentAuth: null,
      roles: [],
      isInitialized: true,
    });
  }
}
