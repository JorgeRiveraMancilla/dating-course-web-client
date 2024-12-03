import { CommonModule } from '@angular/common';
import { Component, inject, computed } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../services/auth.service';
import { MenuModule } from 'primeng/menu';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MenubarModule } from 'primeng/menubar';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    MenuModule,
    ProgressSpinnerModule,
    MenubarModule,
  ],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  private readonly authService = inject(AuthService);
  protected readonly router = inject(Router);

  readonly isAuthenticated = computed(() => this.authService.isAuthenticated());
  readonly isAuthInitialized = computed(() =>
    this.authService.isAuthInitialized()
  );
  readonly currentUser = computed(() => this.authService.getCurrentAuth());

  protected readonly userMenu: {
    items: MenuItem[];
  } = {
    items: [
      {
        label: 'Editar perfil',
        icon: 'pi pi-user-edit',
        command: () => this.onEditProfileClick(),
      },
      { separator: true },
      {
        label: 'Cerrar sesión',
        icon: 'pi pi-sign-out',
        command: () => this.onLogoutClick(),
      },
    ],
  };

  protected onLoginClick(): void {
    this.router.navigate(['login']);
  }

  protected onRegisterClick(): void {
    this.router.navigate(['register']);
  }

  protected onHomeClick(): void {
    this.router.navigate(['']);
  }

  protected onUsersClick(): void {
    console.log('Navegando a users...');
    this.router.navigate(['users']);
  }

  private onEditProfileClick(): void {
    this.router.navigate(['users', this.currentUser()?.userId, 'edit']);
  }

  private onLogoutClick(): void {
    this.authService.logout();
    this.router.navigate(['login']);
  }
}
