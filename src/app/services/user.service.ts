import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { of, map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PaginatedResult } from '../interfaces/paginated-result';
import { User } from '../interfaces/user';
import { UserParams } from '../interfaces/user-params';
import { AuthService } from './auth.service';
import { UserUpdate } from '../interfaces/user-update';
import { setPaginatedResponse } from './paginationHelper';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly baseUrl = environment.apiUrl;

  paginatedResult = signal<PaginatedResult<User[]> | null>(null);
  userCache = new Map();
  auth = this.authService.getCurrentAuth();
  userParams: UserParams = new UserParams(this.auth);

  getUsers(userParams?: UserParams): Observable<PaginatedResult<User[]>> {
    if (userParams) this.userParams = userParams;

    const response = this.userCache.get(
      Object.values(this.userParams).join('-')
    );

    if (response) return of(response);

    const params = new HttpParams()
      .append('minAge', this.userParams.minAge.toString())
      .append('maxAge', this.userParams.maxAge.toString())
      .append('gender', this.userParams.gender)
      .append('orderBy', this.userParams.orderBy);

    return this.http
      .get<User[]>(`${this.baseUrl}/user`, { observe: 'response', params })
      .pipe(
        map((response) => {
          setPaginatedResponse(response, this.paginatedResult);

          this.userCache.set(
            Object.values(this.userParams).join('-'),
            this.paginatedResult() ?? null
          );

          return this.paginatedResult()!;
        })
      );
  }

  getUser(id: number): Observable<User> {
    const user = [...this.userCache.values()]
      .reduce((arr, elem) => arr.concat(elem?.result || []), [])
      .find((user: User) => user.id === id);

    if (user) return of(user);

    return this.http.get<User>(`${this.baseUrl}/user/${id}`);
  }

  updateUser(userId: number, updateUser: UserUpdate): Observable<void> {
    return this.http
      .put<void>(`${this.baseUrl}/user/${userId}`, updateUser)
      .pipe(
        map(() => {
          if (this.auth && this.auth.userId === userId) {
            this.auth = { ...this.auth, ...updateUser };
            this.authService.setCurrentAuth(this.auth);
          }

          const updatedResult = this.paginatedResult()?.result.map((user) =>
            user.id === userId ? { ...user, ...updateUser } : user
          );

          if (updatedResult) {
            this.paginatedResult.set({
              ...this.paginatedResult()!,
              result: updatedResult,
            });
          }

          [...this.userCache.keys()].forEach((key) => {
            const cache = this.userCache.get(key);
            if (cache) {
              const userToUpdate = cache.result.find(
                (user: User) => user.id === userId
              );
              if (userToUpdate) {
                Object.assign(userToUpdate, updateUser);
              }
            }
          });
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
    return this.userParams;
  }

  setUserParams(userParams: UserParams): void {
    this.userParams = userParams;
  }

  resetUserParams() {
    if (this.auth) {
      const resetParams = new UserParams(this.auth);
      this.userParams = resetParams;
      return resetParams;
    }
    return undefined;
  }
}
