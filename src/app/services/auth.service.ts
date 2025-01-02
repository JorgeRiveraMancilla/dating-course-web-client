import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { Auth } from '../interfaces/auth';
import { LoginForm } from '../interfaces/login-form';
import { RegisterForm } from '../interfaces/register-form';
import { StorageService } from './storage.service';
import { TokenService } from './token.service';
import { AuthState } from '../interfaces/auth-state';
import { ChangePasswordForm } from '../interfaces/change-password-form';
import { PresenceService } from './presence.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(StorageService);
  private readonly tokenService = inject(TokenService);
  private presenceService = inject(PresenceService);
  private readonly baseUrl = environment.apiUrl;

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

  async login(credentials: LoginForm): Promise<Auth> {
    const auth = await firstValueFrom(
      this.http.post<Auth>(`${this.baseUrl}/account/login`, credentials)
    );
    this.handleSuccessfulAuth(auth);
    return auth;
  }

  register(userData: RegisterForm): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/account/register`, userData);
  }

  async logout(): Promise<void> {
    try {
      await this.presenceService.stopHubConnection();
    } finally {
      this.storage.removeItem(environment.authStorageKey);
      this.clearAuthState();
    }
  }

  changePassword(changePasswordData: ChangePasswordForm): Observable<void> {
    return this.http.post<void>(
      `${this.baseUrl}/account/change-password`,
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

    this.presenceService.createHubConnection(auth);
  }

  private clearAuthState(): void {
    this.state.set({
      currentAuth: null,
      roles: [],
      isInitialized: true,
    });
    this.presenceService.stopHubConnection();
  }
}
