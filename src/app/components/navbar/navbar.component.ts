import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
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

  protected readonly isInitialized = computed(() =>
    this.authService.getIsInitialized()
  );

  protected readonly currentAuth = computed(() =>
    this.authService.getCurrentAuth()
  );

  protected readonly userMenu = computed(() => ({
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
  }));

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
    this.router.navigate(['users']);
  }

  private onEditProfileClick(): void {
    const auth = this.currentAuth();
    if (auth) {
      this.router.navigate(['users', auth.userId, 'edit']);
    }
  }

  private onLogoutClick(): void {
    this.authService.logout();
    this.router.navigate(['login']);
  }
}
