import { Component, Input, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { User } from '../../interfaces/user';

@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [CardModule, ButtonModule],
  templateUrl: './user-card.component.html',
})
export class UserCardComponent {
  @Input() user!: User;
  private readonly router = inject(Router);

  protected readonly defaultImageUrl = '/assets/user.png';
  protected hover = false;

  protected onProfileView(): void {
    this.router.navigate(['/users', this.user.id]);
  }

  protected onLike(): void {
    // TODO
  }

  protected onChat(): void {
    // TODO
  }

  protected onLikeProfile(): void {
    // TODO
  }
}
