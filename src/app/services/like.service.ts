import { LikeParams } from './../interfaces/like-params';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { PaginatedResult } from '../interfaces/paginated-result';
import { User } from '../interfaces/user';

@Injectable({
  providedIn: 'root',
})
export class LikeService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;
  private readonly paginatedResult = signal<PaginatedResult<User[]> | null>(
    null
  );

  private readonly emptyPaginatedResult: PaginatedResult<User[]> = {
    result: [],
    pagination: {
      currentPage: 1,
      itemsPerPage: 0,
      totalItems: 0,
      totalPages: 0,
    },
  };

  toggleLike(targetUserId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/like/${targetUserId}`, {});
  }

  getLikes(likeParams: LikeParams): Observable<PaginatedResult<User[]>> {
    const params = new HttpParams()
      .append('pageNumber', likeParams.pageNumber.toString())
      .append('pageSize', likeParams.pageSize.toString())
      .append('predicate', likeParams.predicate);

    return this.http
      .get<User[]>(`${this.baseUrl}/like`, {
        observe: 'response',
        params,
      })
      .pipe(
        map((response: HttpResponse<User[]>) => {
          const paginationHeader = response.headers.get('Pagination');
          const result = {
            result: response.body || [],
            pagination: paginationHeader
              ? JSON.parse(paginationHeader)
              : this.emptyPaginatedResult.pagination,
          };
          this.paginatedResult.set(result);
          return result;
        })
      );
  }

  getPaginatedResult(): PaginatedResult<User[]> | null {
    return this.paginatedResult();
  }
}
