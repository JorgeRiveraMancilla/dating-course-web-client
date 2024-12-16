import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { TabViewModule } from 'primeng/tabview';
import { HasUnsavedChanges } from '../../../guards/prevent-unsaved-changes.guard';
import { User } from '../../../interfaces/user';
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { EditProfileComponent } from './components/edit-profile/edit-profile.component';
import { PhotoEditorComponent } from './components/photo-editor/photo-editor.component';

enum TabType {
  EditProfile = 'editProfile',
  ChangePassword = 'changePassword',
  Photos = 'photos',
}

@Component({
  selector: 'app-user-edit-page',
  standalone: true,
  imports: [
    CardModule,
    TabViewModule,
    EditProfileComponent,
    ChangePasswordComponent,
    PhotoEditorComponent,
  ],
  templateUrl: './user-edit-page.component.html',
})
export class UserEditPageComponent implements OnInit, HasUnsavedChanges {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly tabMap = new Map<string, number>([
    [TabType.EditProfile, 0],
    [TabType.ChangePassword, 1],
    [TabType.Photos, 2],
  ]);

  @ViewChild(EditProfileComponent)
  private editProfileComponent!: EditProfileComponent;
  @ViewChild(ChangePasswordComponent)
  private changePasswordComponent!: ChangePasswordComponent;

  protected user: User = {} as User;
  protected loading = false;
  protected activeTabIndex = 0;

  ngOnInit(): void {
    this.activatedRoute.queryParamMap.subscribe((params) => {
      const tab = params.get('tab') || TabType.EditProfile;
      this.activeTabIndex = this.tabMap.get(tab) ?? 0;
    });

    this.activatedRoute.data.subscribe({
      next: (data) => {
        if (data['user']) {
          this.user = data['user'];
        }
      },
      error: () => this.router.navigate(['/']),
    });
  }

  protected onTabChange(index: number): void {
    const tabEntry = Array.from(this.tabMap.entries()).find(
      ([, value]) => value === index
    );

    if (tabEntry) {
      const [tabId] = tabEntry;
      this.router.navigate([], {
        relativeTo: this.activatedRoute,
        queryParams: { tab: tabId },
        queryParamsHandling: 'merge',
      });
    }
  }

  hasUnsavedChanges(): boolean {
    if (
      this.editProfileComponent?.hasUnsavedChanges() ||
      this.changePasswordComponent?.hasUnsavedChanges()
    ) {
      return true;
    }

    return false;
  }
}
