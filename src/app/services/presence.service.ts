import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import {
  HttpTransportType,
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
} from '@microsoft/signalr';
import { MessageService } from 'primeng/api';
import { environment } from '../../environments/environment';
import { Auth } from '../interfaces/auth';

@Injectable({
  providedIn: 'root',
})
export class PresenceService {
  private readonly hubUrl = environment.hubUrl;
  private readonly messageService = inject(MessageService);
  private hubConnection?: HubConnection;
  private readonly destroyRef = inject(DestroyRef);
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private heartbeatInterval?: number;

  onlineUsers = signal<number[]>([]);
  connectionState = signal<'connected' | 'disconnected' | 'reconnecting'>(
    'disconnected'
  );

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.stopHubConnection();
      });

      this.destroyRef.onDestroy(() => {
        this.stopHubConnection();
      });
    }
  }

  async createHubConnection(auth: Auth) {
    // Evitar crear múltiples conexiones
    if (this.hubConnection?.state === HubConnectionState.Connected) {
      console.log('Connection already exists');
      return;
    }

    if (this.connectionState() === 'reconnecting') {
      console.log('Already attempting to reconnect');
      return;
    }

    this.hubConnection = new HubConnectionBuilder()
      .withUrl(`${this.hubUrl}/presence`, {
        accessTokenFactory: () => auth.token,
        skipNegotiation: true,
        transport: HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 20000])
      .build();

    try {
      await this.hubConnection.start();
      this.connectionState.set('connected');
      this.reconnectAttempts = 0;
      this.setupHeartbeat();
      this.setupEventHandlers();
    } catch (error) {
      console.error('Error starting hub connection:', error);
      this.handleReconnection(auth);
    }
  }

  private handleReconnection(auth: Auth) {
    this.connectionState.set('reconnecting');
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => this.createHubConnection(auth), 5000);
    } else {
      this.connectionState.set('disconnected');
      this.messageService.add({
        severity: 'error',
        summary: 'Error de conexión',
        detail: 'No se pudo establecer conexión con el servidor',
      });
    }
  }

  private setupEventHandlers() {
    if (!this.hubConnection) return;

    this.hubConnection.onclose((error) => {
      console.log('Connection closed:', error);
      this.connectionState.set('disconnected');
      this.cleanupConnection();
    });

    this.hubConnection.onreconnecting(() => {
      console.log('Attempting to reconnect...');
      this.connectionState.set('reconnecting');
    });

    this.hubConnection.onreconnected(() => {
      console.log('Reconnected');
      this.connectionState.set('connected');
      this.hubConnection?.invoke('GetOnlineUsers').catch(console.error);
    });

    this.hubConnection.on('UserIsOnline', (userId) => {
      this.onlineUsers.update((users) => {
        if (!users.includes(userId)) {
          return [...users, userId].sort((a, b) => a - b);
        }
        return users;
      });
    });

    this.hubConnection.on('UserIsOffline', (userId) => {
      this.onlineUsers.update((users) => users.filter((x) => x !== userId));
    });

    this.hubConnection.on('GetOnlineUsers', (userIds) => {
      this.onlineUsers.set(userIds.sort((a: number, b: number) => a - b));
    });

    this.hubConnection.on('NewMessageReceived', ({ knownAs }) => {
      this.messageService.add({
        severity: 'info',
        summary: 'Nuevo mensaje',
        detail: `${knownAs} te ha enviado un mensaje!`,
      });
    });
  }

  private setupHeartbeat() {
    // Limpiar intervalo existente si hay uno
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = window.setInterval(() => {
      if (this.hubConnection?.state === HubConnectionState.Connected) {
        this.hubConnection.invoke('SendHeartbeat').catch(console.error);
      }
    }, 30000);
  }

  private cleanupConnection() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = undefined;
    }
    this.onlineUsers.set([]);
    this.hubConnection = undefined;
    this.reconnectAttempts = 0;
  }

  async stopHubConnection() {
    try {
      if (this.hubConnection?.state === HubConnectionState.Connected) {
        this.connectionState.set('disconnected');
        await this.hubConnection.stop();
        console.log('Hub connection stopped successfully');
      }
    } catch (error) {
      console.error('Error stopping hub connection:', error);
    } finally {
      this.cleanupConnection();
    }
  }
}
