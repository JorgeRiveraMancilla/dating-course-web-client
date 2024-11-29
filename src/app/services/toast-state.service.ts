import { inject, Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class ToastStateService {
  private messageService = inject(MessageService);
  private toastDisplayed = false;

  showToastOnce(
    severity: string,
    summary: string,
    detail: string,
    life: number = 3000
  ) {
    if (!this.toastDisplayed) {
      this.toastDisplayed = true;
      this.messageService.add({ severity, summary, detail, life });
    }
  }

  resetToastState() {
    this.toastDisplayed = false;
  }
}
