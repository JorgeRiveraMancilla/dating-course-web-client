import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { RegisterPageComponent } from './pages/register-page/register-page.component';
import { authGuard } from './guards/auth.guard';
import { UserPageComponent } from './pages/user-page/user-page.component';
import { NotFoundPageComponent } from './pages/not-found-page/not-found-page.component';
import { UserDetailPageComponent } from './pages/user-page/user-detail-page/user-detail-page.component';
import { userResolver } from './resolvers/user.resolver';
import { UserEditPageComponent } from './pages/user-page/user-edit-page/user-edit-page.component';
import { preventUnsavedChangesGuard } from './guards/prevent-unsaved-changes.guard';
import { AdminPanelPageComponent } from './pages/admin-panel-page/admin-panel-page.component';

export const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'login', component: LoginPageComponent },
  { path: 'register', component: RegisterPageComponent },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      { path: 'users', component: UserPageComponent },
      {
        path: 'users/:id',
        component: UserDetailPageComponent,
        resolve: {
          user: userResolver,
        },
      },
      {
        path: 'users/:id/edit',
        component: UserEditPageComponent,
        resolve: {
          user: userResolver,
        },
        canDeactivate: [preventUnsavedChangesGuard],
      },
      {
        path: 'admin',
        component: AdminPanelPageComponent,
      },
    ],
  },
  { path: 'not-found', component: NotFoundPageComponent },
  { path: '**', redirectTo: 'not-found', pathMatch: 'full' },
];
