import { Injectable } from '@angular/core';
import { PaginatedResult } from '../interfaces/paginated-result';
import { User } from '../interfaces/user';
import { UserParams } from '../interfaces/user-params';

@Injectable({
  providedIn: 'root',
})
export class UserCacheService {
  private cache = new Map<string, PaginatedResult<User[]>>();

  set(key: string, value: PaginatedResult<User[]>): void {
    this.cache.set(key, value);
  }

  get(key: string): PaginatedResult<User[]> | undefined {
    return this.cache.get(key);
  }

  getCachedUser(userId: number): User | undefined {
    return [...this.cache.values()]
      .reduce((arr: User[], elem) => arr.concat(elem.result), [])
      .find((user) => user.id === userId);
  }

  updateUserInCache(userId: number, updates: Partial<User>): void {
    [...this.cache.keys()].forEach((key) => {
      const cache = this.cache.get(key);
      if (cache?.result) {
        const userToUpdate = cache.result.find((user) => user.id === userId);
        if (userToUpdate) {
          Object.assign(userToUpdate, updates);
        }
      }
    });
  }

  getCacheKey(params: UserParams): string {
    const { minAge, maxAge, gender, orderBy } = params;
    return Object.values({ minAge, maxAge, gender, orderBy }).join('-');
  }

  clear(): void {
    this.cache.clear();
  }
}
