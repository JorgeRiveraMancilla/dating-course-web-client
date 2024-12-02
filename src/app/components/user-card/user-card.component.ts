import { Component, Input, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { User } from '../../interfaces/user';
import { LikeService } from '../../services/like.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [CardModule, ButtonModule],
  templateUrl: './user-card.component.html',
})
export class UserCardComponent {
  @Input() user!: User;
  private readonly router = inject(Router);
  private readonly likeService = inject(LikeService);

  protected readonly defaultImageUrl = environment.defaultUserImageUrl;
  protected hover = false;

  protected onProfileView(): void {
    this.router.navigate(['/users', this.user.id]);
  }

  protected onLike(): void {
    this.likeService.toggleLike(this.user.id).subscribe({
      next: () => {
        this.user.isLiked = !this.user.isLiked;
      },
    });
  }

  protected onChat(): void {
    // TODO
  }

  protected onLikeProfile(): void {
    // TODO
  }
}
