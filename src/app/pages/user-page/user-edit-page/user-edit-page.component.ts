import { Component, HostListener, inject, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../interfaces/user';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { MessageModule } from 'primeng/message';
import { TabViewModule } from 'primeng/tabview';

@Component({
  selector: 'app-user-edit-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    InputTextareaModule,
    TabViewModule,
    MessageModule,
  ],
  templateUrl: './user-edit-page.component.html',
})
export class UserEditPageComponent {
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly messageService = inject(MessageService);

  @ViewChild('editForm') editForm: NgForm | undefined;

  protected user: User | undefined;
  protected readonly auth = this.authService.getCurrentAuth();

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: Event) {
    if (this.editForm?.dirty) {
      $event.returnValue = true;
    }
  }

  constructor() {
    this.loadMember();
  }

  private loadMember(): void {
    if (!this.user) return;

    this.userService.getUser(this.user.id).subscribe({
      next: (member) => (this.user = member),
    });
  }

  protected updateUser(): void {
    if (!this.editForm?.valid || !this.auth) return;

    this.userService
      .updateUser(this.auth.userId, this.editForm.value)
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Perfil actualizado correctamente',
          });
          this.editForm?.reset(this.user);
        },
      });
  }
}
