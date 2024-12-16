import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ChipModule } from 'primeng/chip';
import { TagModule } from 'primeng/tag';
import { UserWithRole } from '../../../../interfaces/user-with-role';
import { AdminService } from '../../../../services/admin.service';
import { PaginatorState } from 'primeng/paginator';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, ChipModule, TagModule],
  templateUrl: './user-management.component.html',
})
export class UserManagementComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly messageService = inject(MessageService);

  protected users: UserWithRole[] = [];
  protected pagination = {
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 0,
  };
  protected loading = false;

  ngOnInit(): void {
    this.loadUsers();
  }

  protected getRoleSeverity(
    role: string
  ): 'success' | 'info' | 'warning' | 'danger' {
    const severities: Record<
      string,
      'success' | 'info' | 'warning' | 'danger'
    > = {
      Admin: 'danger',
      Moderator: 'warning',
      Member: 'info',
    };
    return severities[role] || 'info';
  }

  protected canEditUser(user: UserWithRole): boolean {
    return !user.roles.includes('Admin');
  }

  protected onPageChange(event: PaginatorState): void {
    if (event.first === undefined || event.rows === undefined) return;

    const pageNumber = Math.floor(event.first / event.rows) + 1;

    this.loadUsers(pageNumber, event.rows);
  }

  private loadUsers(page: number = 1, pageSize: number = 10): void {
    if (this.loading) return;
    this.loading = true;

    this.adminService.getUserWithRoles(page, pageSize).subscribe({
      next: (response) => {
        this.users = response.result;
        this.pagination = response.pagination;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los usuarios',
        });
        this.loading = false;
      },
    });
  }

  toggleModeratorRole(user: UserWithRole): void {
    if (!this.canEditUser(user)) return;

    const roles = user.roles.includes('Moderator')
      ? user.roles.filter((r) => r !== 'Moderator')
      : [...user.roles, 'Moderator'];

    this.adminService.updateUserRoles(user.id, roles).subscribe({
      next: (updatedRoles) => {
        user.roles = updatedRoles;
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Roles actualizados correctamente',
        });
      },
      error: () =>
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron actualizar los roles',
        }),
    });
  }
}
