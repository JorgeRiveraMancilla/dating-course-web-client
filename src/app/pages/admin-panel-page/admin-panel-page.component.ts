import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { TabViewModule } from 'primeng/tabview';
import { UserManagementComponent } from "./components/user-management/user-management.component";
import { PhotoManagementComponent } from "./components/photo-management/photo-management.component";

enum TabType {
  UserManagement = 'userManagement',
  PhotoManagement = 'photoManagement',
}

@Component({
  selector: 'app-admin-panel-page',
  standalone: true,
  imports: [CardModule, TabViewModule, UserManagementComponent, PhotoManagementComponent],
  templateUrl: './admin-panel-page.component.html',
})
export class AdminPanelPageComponent implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly tabMap = new Map<string, number>([
    [TabType.UserManagement, 0],
    [TabType.PhotoManagement, 1],
  ]);

  protected activeTabIndex = 0;

  ngOnInit(): void {
    this.activatedRoute.queryParamMap.subscribe((params) => {
      const tab = params.get('tab') || TabType.UserManagement;
      this.activeTabIndex = this.tabMap.get(tab) ?? 0;
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
}
