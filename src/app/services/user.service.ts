import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, of, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { setPaginatedResponse } from '../helpers/paginationHelper';
import { PaginatedResult } from '../interfaces/paginated-result';
import { User } from '../interfaces/user';
import { UserParams } from '../interfaces/user-params';
import { UserUpdate } from '../interfaces/user-update';
import { AuthService } from './auth.service';
import { UserCacheService } from './user-cache.service';
import { UserParamsService } from './user-params.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly cacheService = inject(UserCacheService);
  private readonly paramsService = inject(UserParamsService);
  private readonly baseUrl = environment.apiUrl;

  private readonly paginatedResult = signal<PaginatedResult<User[]> | null>(
    null
  );
  private readonly auth = this.authService.getCurrentAuth();

  private readonly emptyPaginatedResult: PaginatedResult<User[]> = {
    result: [],
    pagination: {
      currentPage: 1,
      itemsPerPage: 0,
      totalItems: 0,
      totalPages: 0,
    },
  };

  constructor() {
    if (this.auth) {
      this.paramsService.initializeParams(this.auth);
    }
  }

  // Public API
  getUsers(userParams?: UserParams): Observable<PaginatedResult<User[]>> {
    if (userParams) {
      this.paramsService.setParams(userParams);
    }

    const currentParams = this.paramsService.getParams();
    if (!currentParams) return of(this.emptyPaginatedResult);

    const cacheKey = this.cacheService.getCacheKey(currentParams);
    const cachedResponse = this.cacheService.get(cacheKey);
    if (cachedResponse) return of(cachedResponse);

    return this.fetchUsers(currentParams);
  }

  getUser(id: number): Observable<User> {
    const cachedUser = this.cacheService.getCachedUser(id);
    if (cachedUser) return of(cachedUser);

    return this.http.get<User>(`${this.baseUrl}/user/${id}`);
  }

  updateUser(userId: number, updates: UserUpdate): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/user/${userId}`, updates).pipe(
      map(() => {
        this.handleUserUpdate(userId, updates);
      })
    );
  }

  setMainPhoto(photoId: number): Observable<void> {
    return this.http.put<void>(
      `${this.baseUrl}/user/set-main-photo/${photoId}`,
      {}
    );
  }

  deletePhoto(photoId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/user/delete-photo/${photoId}`
    );
  }

  getUserParams(): UserParams | undefined {
    return this.paramsService.getParams();
  }

  setUserParams(params: UserParams): void {
    this.paramsService.setParams(params);
  }

  resetUserParams(): UserParams | undefined {
    if (!this.auth) return undefined;

    return this.paramsService.resetParams(this.auth);
  }

  // Private methods
  private fetchUsers(params: UserParams): Observable<PaginatedResult<User[]>> {
    const httpParams = this.buildHttpParams(params);

    return this.http
      .get<User[]>(`${this.baseUrl}/user`, {
        observe: 'response',
        params: httpParams,
      })
      .pipe(
        map((response) => {
          setPaginatedResponse(response, this.paginatedResult);
          const result = this.paginatedResult();

          if (result) {
            this.cacheService.set(
              this.cacheService.getCacheKey(params),
              result
            );
            return result;
          }

          return this.emptyPaginatedResult;
        })
      );
  }

  private buildHttpParams(params: UserParams): HttpParams {
    return new HttpParams()
      .append('minAge', params.minAge.toString())
      .append('maxAge', params.maxAge.toString())
      .append('gender', params.gender)
      .append('orderBy', params.orderBy);
  }

  private handleUserUpdate(userId: number, updates: UserUpdate): void {
    this.updateAuthIfNeeded(userId, updates);
    this.updatePaginatedResult(userId, updates);
    this.cacheService.updateUserInCache(userId, updates);
  }

  private updateAuthIfNeeded(userId: number, updates: UserUpdate): void {
    if (this.auth && this.auth.userId === userId) {
      const updatedAuth = { ...this.auth, ...updates };
      this.authService.setCurrentAuth(updatedAuth);
    }
  }

  private updatePaginatedResult(userId: number, updates: Partial<User>): void {
    const currentResult = this.paginatedResult();
    if (!currentResult) return;

    const updatedUsers = currentResult.result.map((user) =>
      user.id === userId ? { ...user, ...updates } : user
    );

    this.paginatedResult.set({
      ...currentResult,
      result: updatedUsers,
    });
  }
}
