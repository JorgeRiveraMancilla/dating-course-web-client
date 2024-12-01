import { Component, Input } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { User } from '../../interfaces/user';

@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [CardModule, ButtonModule],
  templateUrl: './user-card.component.html',
  styles: ``,
})
export class UserCardComponent {
  @Input() user!: User;

  readonly defaultImageUrl = '/assets/user.png';
  hover = false;

  onProfileView(): void {}

  onLike(): void {}

  onChat(): void {}

  onLikeProfile(): void {}
}
