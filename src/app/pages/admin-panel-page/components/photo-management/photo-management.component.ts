import { ToastModule } from 'primeng/toast';
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { PhotoForApproval } from '../../../../interfaces/photo-for-approval';
import { AdminService } from '../../../../services/admin.service';

@Component({
  selector: 'app-photo-management',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, ToastModule],
  templateUrl: './photo-management.component.html',
  styles: ``,
})
export class PhotoManagementComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly messageService = inject(MessageService);
  protected photos: PhotoForApproval[] = [];

  ngOnInit(): void {
    this.getPhotosForApproval();
  }

  private getPhotosForApproval(): void {
    this.adminService.getPhotosForApproval().subscribe({
      next: (photos) => (this.photos = photos),
      error: () =>
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las fotos',
        }),
    });
  }

  protected approvePhoto(photoId: number): void {
    this.adminService.approvePhoto(photoId).subscribe({
      next: () => {
        this.photos = this.photos.filter((p) => p.id !== photoId);
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Foto aprobada correctamente',
        });
      },
      error: () =>
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo aprobar la foto',
        }),
    });
  }

  protected rejectPhoto(photoId: number): void {
    this.adminService.rejectPhoto(photoId).subscribe({
      next: () => {
        this.photos = this.photos.filter((p) => p.id !== photoId);
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Foto rechazada correctamente',
        });
      },
      error: () =>
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo rechazar la foto',
        }),
    });
  }
}
