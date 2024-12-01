import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { GalleriaModule } from 'primeng/galleria';
import { TabViewModule } from 'primeng/tabview';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { AuthService } from '../../../services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { User } from '../../../interfaces/user';
import { Photo } from '../../../interfaces/photo';

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
  styles: ``,
})
export class UserDetailPageComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private activatedRoute = inject(ActivatedRoute);

  auth = this.authService.getCurrentAuth();
  user: User = {} as User;
  userImages: Photo[] = [];
  readonly defaultImageUrl = '/assets/user.png';

  activeTabIndex = 0;

  readonly tabMap: { [key: string]: number } = {
    About: 0,
    Interests: 1,
    Photos: 2,
    Messages: 3,
  };

  ngOnInit(): void {
    this.activatedRoute.data.subscribe({
      next: (data) => {
        console.log(data);
      },
    });

    this.activatedRoute.queryParams.subscribe({
      next: (params) => {
        console.log(params);
      },
    });
  }

  ngOnDestroy(): void {
    throw new Error('Method not implemented.');
  }

  selectTab(tabName: string): void {
    this.activeTabIndex = this.tabMap[tabName] ?? 0;
  }

  getImages() {
    if (!this.user) return;
  }
}
