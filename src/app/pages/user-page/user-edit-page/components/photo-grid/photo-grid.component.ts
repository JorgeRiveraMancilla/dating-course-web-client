import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Photo } from '../../../../../interfaces/photo';

@Component({
  selector: 'app-photo-grid',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    TooltipModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './photo-grid.component.html',
})
export class PhotoGridComponent {
  @Input() photos: Photo[] = [];
  @Input() deletingPhotoId: number | null = null;

  @Output() setMainPhoto = new EventEmitter<number>();
  @Output() deletePhoto = new EventEmitter<number>();

  getMainPhotoTooltip(photo: Photo): string {
    if (photo.isMain) {
      return 'Foto principal actual';
    }
    if (!photo.isApproved) {
      return 'Foto pendiente de aprobación';
    }
    return 'Establecer como principal';
  }

  handleDeletePhoto(photoId: number): void {
    this.deletePhoto.emit(photoId);
  }
}
