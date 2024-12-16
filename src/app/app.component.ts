import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { FooterComponent } from './components/footer/footer.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent,
    FooterComponent,
    ToastModule,
    ConfirmDialogModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  private readonly authService = inject(AuthService);
  protected loading = true;

  async ngOnInit() {
    try {
      await this.authService.initializeAuth();
      this.loading = false;
    } catch (error) {
      this.loading = false;
    }
  }
}
