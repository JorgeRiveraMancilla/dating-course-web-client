// home-page.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule],
  templateUrl: './home-page.component.html',
})
export class HomePageComponent {
  private readonly router = inject(Router);

  protected navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
