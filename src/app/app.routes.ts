import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { RegisterPageComponent } from './pages/register-page/register-page.component';
import { authGuard } from './guards/auth.guard';
import { UserPageComponent } from './pages/user-page/user-page.component';
import { NotFoundPageComponent } from './pages/not-found-page/not-found-page.component';
import { UserDetailPageComponent } from './pages/user-page/user-detail-page/user-detail-page.component';
import { userDetailPageResolverResolver } from './resolvers/user-detail-page-resolver.resolver';

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
          user: userDetailPageResolverResolver,
        },
      },
    ],
  },
  { path: 'not-found', component: NotFoundPageComponent },
  { path: '**', redirectTo: 'not-found', pathMatch: 'full' },
];
