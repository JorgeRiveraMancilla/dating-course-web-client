import { CommonModule } from '@angular/common';
import { Component, inject, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../services/auth.service';
import { MenuModule } from 'primeng/menu';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    MenuModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  readonly isAuthenticated = computed(() => this.authService.isAuthenticated());
  readonly isAuthInitialized = computed(() =>
    this.authService.isAuthInitialized()
  );
  readonly currentUser = computed(
    () => this.authService.getCurrentAuth()?.userName
  );

  protected readonly userMenu: {
    items: MenuItem[];
  } = {
    items: [
      {
        label: 'Editar perfil',
        icon: 'pi pi-user-edit',
        command: () => this.navigateTo('/profile'),
      },
      { separator: true },
      {
        label: 'Cerrar sesión',
        icon: 'pi pi-sign-out',
        command: () => this.handleLogout(),
      },
    ],
  };

  protected navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  private handleLogout(): void {
    this.authService.logout();
    this.navigateTo('/');
  }
}
