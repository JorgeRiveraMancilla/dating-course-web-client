import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { UserWithRole } from '../interfaces/user-with-role';
import { PhotoForApproval } from '../interfaces/photo-for-approval';
import { map, Observable } from 'rxjs';
import { PaginatedResult } from '../interfaces/paginated-result';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getUserWithRoles(
    pageNumber = 1,
    pageSize = 10
  ): Observable<PaginatedResult<UserWithRole[]>> {
    const params = new HttpParams()
      .append('pageNumber', pageNumber)
      .append('pageSize', pageSize);

    return this.http
      .get<UserWithRole[]>(`${this.baseUrl}/admin/users-with-roles`, {
        observe: 'response',
        params,
      })
      .pipe(
        map((response) => {
          const paginatedResult: PaginatedResult<UserWithRole[]> = {
            result: response.body || [],
            pagination: {
              currentPage: 1,
              itemsPerPage: pageSize,
              totalItems: 0,
              totalPages: 0,
            },
          };

          if (response.headers.get('Pagination')) {
            paginatedResult.pagination = JSON.parse(
              response.headers.get('Pagination')!
            );
          }

          return paginatedResult;
        })
      );
  }

  updateUserRoles(userId: number, roles: string[]): Observable<string[]> {
    if (!roles.includes('Member')) {
      roles.push('Member');
    }
    return this.http.post<string[]>(
      `${this.baseUrl}/admin/edit-roles/${userId}`,
      {},
      { params: { roles: roles.join(',') } }
    );
  }

  getPhotosForApproval(): Observable<PhotoForApproval[]> {
    return this.http.get<PhotoForApproval[]>(
      `${this.baseUrl}/admin/photos-to-moderate`
    );
  }

  approvePhoto(photoId: number): Observable<void> {
    return this.http.post<void>(
      `${this.baseUrl}/admin/approve-photo/${photoId}`,
      {}
    );
  }

  rejectPhoto(photoId: number): Observable<void> {
    return this.http.post<void>(
      `${this.baseUrl}/admin/reject-photo/${photoId}`,
      {}
    );
  }
}
