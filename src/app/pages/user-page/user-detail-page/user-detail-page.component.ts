import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { GalleriaModule } from 'primeng/galleria';
import { TabViewModule } from 'primeng/tabview';
import { Photo } from '../../../interfaces/photo';
import { User } from '../../../interfaces/user';
import { AuthService } from '../../../services/auth.service';
import { environment } from '../../../../environments/environment';
import { LikeService } from '../../../services/like.service';

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
  ],
  templateUrl: './user-detail-page.component.html',
})
export class UserDetailPageComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly likeService = inject(LikeService);

  protected readonly auth = this.authService.getCurrentAuth();
  protected user: User = {} as User;
  protected readonly defaultImageUrl = environment.defaultUserImageUrl;
  protected activeTabIndex = 0;

  protected readonly galleriaResponsiveOptions = [
    { breakpoint: '1024px', numVisible: 5 },
    { breakpoint: '768px', numVisible: 3 },
    { breakpoint: '560px', numVisible: 1 },
  ];

  ngOnInit(): void {
    this.initializeComponent();
  }

  protected get userDetails() {
    return [
      {
        label: 'Ubicación',
        value:
          this.user.city && this.user.country
            ? `${this.user.city}, ${this.user.country}`
            : 'No especificada',
      },
      {
        label: 'Edad',
        value: this.user.age ? `${this.user.age} años` : 'No especificada',
      },
      {
        label: 'Última conexión',
        value: this.user.lastActive
          ? new Date(this.user.lastActive).toLocaleDateString()
          : 'Sin información',
      },
      {
        label: 'Usuario desde',
        value: this.user.created
          ? new Date(this.user.created).toLocaleDateString()
          : 'Sin información',
      },
    ];
  }

  protected get userSections() {
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
    this.selectTab('Mensajes');
  }

  private initializeComponent(): void {
    this.route.data.subscribe({
      next: (data) => {
        if (data['user']) this.user = data['user'];
      },
    });

    this.route.queryParams.subscribe({
      next: (params) => {
        if (params['tab']) this.selectTab(params['tab']);
      },
    });
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
      }[tabName] ?? -1
    );
  }
}
