import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { GalleriaModule } from 'primeng/galleria';
import { TabViewModule } from 'primeng/tabview';
import { Photo } from '../../../interfaces/photo';
import { User } from '../../../interfaces/user';
import { environment } from '../../../../environments/environment.development';
import { LikeService } from '../../../services/like.service';
import { PresenceService } from '../../../services/presence.service';
import { ChatComponent } from './components/chat/chat.component';

@Component({
  selector: 'app-user-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    TabViewModule,
    GalleriaModule,
    CardModule,
    ButtonModule,
    DividerModule,
    ChatComponent,
  ],
  templateUrl: './user-detail-page.component.html',
  styles: [
    `
      :host {
        display: block;
        height: calc(100vh - 9rem);
        padding: 0 2rem;
      }
    `,
  ],
})
export class UserDetailPageComponent implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly likeService = inject(LikeService);
  private readonly presenceService = inject(PresenceService);

  protected readonly defaultImageUrl = environment.defaultUserImageUrl;
  protected readonly isOnline = computed(() =>
    this.presenceService.onlineUsers().includes(this.user.id)
  );
  protected user: User = {} as User;
  protected activeTabIndex = 0;

  protected readonly galleriaResponsiveOptions = [
    { breakpoint: '1024px', numVisible: 5 },
    { breakpoint: '768px', numVisible: 3 },
    { breakpoint: '560px', numVisible: 1 },
  ];

  ngOnInit(): void {
    this.activatedRoute.data.subscribe({
      next: (data) => {
        if (data['user']) this.user = data['user'];
      },
    });

    this.activatedRoute.queryParams.subscribe({
      next: (params) => {
        if (params['tab']) this.selectTab(params['tab']);
      },
    });
  }

  protected get userDetails(): { title: string; content: string }[] {
    return [
      {
        title: 'Nombre de usuario',
        content: this.user.userName,
      },
      {
        title: 'Alias',
        content: this.user.knownAs,
      },
      {
        title: 'Correo electrónico',
        content: this.user.email.toLowerCase(),
      },
      {
        title: 'Ubicación',
        content:
          this.user.city && this.user.country
            ? `${this.user.city}, ${this.user.country}`
            : 'No especificada',
      },
      {
        title: 'Edad',
        content: this.user.age ? `${this.user.age} años` : 'No especificada',
      },
      {
        title: 'Última conexión',
        content: this.user.lastActive
          ? new Date(this.user.lastActive).toLocaleDateString()
          : 'Sin información',
      },
      {
        title: 'Usuario desde',
        content: this.user.created
          ? new Date(this.user.created).toLocaleDateString()
          : 'Sin información',
      },
    ];
  }

  protected get userSections(): { title: string; content: string }[] {
    return [
      {
        title: 'Descripción',
        content: this.user.introduction || 'Sin descripción',
      },
      {
        title: 'Qué busca',
        content: this.user.lookingFor || 'Sin descripción',
      },
      {
        title: 'Intereses',
        content: this.user.interests || 'Sin descripción',
      },
    ];
  }

  protected get userImages(): Photo[] {
    return this.user?.photos?.filter((photo) => photo.isApproved) || [];
  }

  protected onLikeClick(): void {
    this.likeService.toggleLike(this.user.id).subscribe({
      next: () => {
        this.user.isLiked = !this.user.isLiked;
      },
    });
  }

  protected onMessageClick(): void {
    this.selectTab('messages');
  }

  private selectTab(tabName: string): void {
    const tabIndex = this.getTabIndex(tabName);
    if (tabIndex !== -1) {
      this.activeTabIndex = tabIndex;
    }
  }

  private getTabIndex(tabName: string): number {
    return (
      {
        profile: 0,
        photos: 1,
        messages: 2,
      }[tabName.toLowerCase()] ?? -1
    );
  }
}
