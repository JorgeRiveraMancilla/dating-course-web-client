import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule],
  templateUrl: './navbar.component.html',
  styles: ``,
})
export class NavbarComponent {
  navigateToLogin() {
    //  TODO: Implementar navegación al login
  }

  navigateToRegister() {
    // TODO: Implementar navegación al registro
  }
}
