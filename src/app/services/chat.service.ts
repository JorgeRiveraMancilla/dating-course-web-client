import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { Message } from '../interfaces/message';
import { BehaviorSubject, take } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { Auth } from '../interfaces/auth';
import { NewMessage } from '../interfaces/new-message';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private hubConnection?: HubConnection;
  private messageThreadSource = new BehaviorSubject<Message[]>([]);
  messageThread$ = this.messageThreadSource.asObservable();

  createHubConnection(auth: Auth, otherUserId: number) {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(`${environment.hubUrl}/chat?user=${otherUserId}`, {
        accessTokenFactory: () => auth.token,
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .catch((error) => console.error('Error al iniciar conexión:', error));

    this.hubConnection.on('ReceiveMessageThread', (messages: Message[]) => {
      this.messageThreadSource.next(messages);
    });

    this.hubConnection.on('NewMessage', (message: Message) => {
      this.messageThread$.pipe(take(1)).subscribe({
        next: (messages) => {
          this.messageThreadSource.next([...messages, message]);
        },
      });
    });
  }

  async stopHubConnection() {
    if (this.hubConnection) {
      await this.hubConnection.stop();
      this.messageThreadSource.next([]);
    }
  }

  async sendMessage(newMessage: NewMessage) {
    try {
      await this.hubConnection?.invoke('SendMessage', newMessage);
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      throw error;
    }
  }
}
