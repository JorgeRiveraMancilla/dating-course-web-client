import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../../services/auth.service';
import { ChatService } from '../../../../../services/chat.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { TimeAgoPipe } from '../../../../../pipes/time-ago.pipe';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    CardModule,
    InputTextareaModule,
    TimeAgoPipe,
  ],
  templateUrl: './chat.component.html',
})
export class ChatComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);

  protected readonly messageService = inject(MessageService);
  protected readonly chatService = inject(ChatService);
  protected readonly authService = inject(AuthService);

  protected messageContent = '';
  protected loading = false;

  ngOnInit() {
    const auth = this.authService.getCurrentAuth();
    if (!auth) return;

    const userId = this.route.snapshot.params['id'];
    this.chatService.createHubConnection(auth, userId);
  }

  ngOnDestroy() {
    this.chatService.stopHubConnection();
  }

  protected async sendMessage() {
    if (!this.messageContent.trim()) return;

    this.loading = true;
    const userId = this.route.snapshot.params['id'];

    try {
      await this.chatService.sendMessage({
        recipientUserId: +userId,
        content: this.messageContent,
      });
      this.messageContent = '';
    } catch (error) {
      // Agregar manejo de errores con PrimeNG Toast
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo enviar el mensaje',
      });
    } finally {
      this.loading = false;
    }
  }
}
