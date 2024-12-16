import { MessageModule } from 'primeng/message';
import { SpinnerModule } from 'primeng/spinner';
import { CommonModule } from '@angular/common';
import { Component, inject, Input, ViewChild } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { FileUploadModule } from 'primeng/fileupload';
import { TooltipModule } from 'primeng/tooltip';
import { User } from '../../../../../interfaces/user';
import { UserService } from '../../../../../services/user.service';
import { PhotoGridComponent } from '../photo-grid/photo-grid.component';
import { PhotoPreviewComponent } from '../photo-preview/photo-preview.component';
import { PhotoUploadButtonComponent } from '../photo-upload-button/photo-upload-button.component';
import { Photo } from '../../../../../interfaces/photo';
import { HttpErrorResponse } from '@angular/common/http';
import { FileSelectEvent } from '../../../../../interfaces/file-select-event';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-photo-editor',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    ProgressSpinnerModule,
    FileUploadModule,
    TooltipModule,
    SpinnerModule,
    MessageModule,
    PhotoPreviewComponent,
    PhotoGridComponent,
    PhotoUploadButtonComponent,
  ],
  templateUrl: './photo-editor.component.html',
  styleUrl: './photo-editor.component.css',
})
export class PhotoEditorComponent {
  private readonly userService = inject(UserService);
  private readonly messageService = inject(MessageService);

  @Input() user: User = {} as User;
  @ViewChild('fileUpload') fileUpload?: PhotoUploadButtonComponent;

  selectedFile: File | null = null;
  previewUrl: string | null = null;
  isUploading: boolean = false;
  deletingPhotoId: number | null = null;

  uploadPhoto(): void {
    if (!this.selectedFile) {
      this.showMessage(
        'warn',
        'Advertencia',
        'Por favor, selecciona una imagen primero'
      );
      return;
    }

    this.isUploading = true;
    const formData = this.createFormData();

    this.userService.uploadPhoto(formData).subscribe({
      next: (photo) => this.handlePhotoUploadSuccess(photo),
      error: (error) => this.handlePhotoUploadError(error),
      complete: () => this.resetUploadState(),
    });
  }

  setMainPhoto(photoId: number): void {
    const photo = this.findPhotoById(photoId);

    if (!photo) {
      this.showMessage('error', 'Error', 'No se encontró la foto seleccionada');
      return;
    }

    if (!photo.isApproved) {
      this.showMessage(
        'warn',
        'Advertencia',
        'No se puede establecer como principal una foto que no está aprobada'
      );
      return;
    }

    this.userService.setMainPhoto(photoId).subscribe({
      next: () => this.handleSetMainPhotoSuccess(photo),
      error: (error) => this.handleSetMainPhotoError(error),
    });
  }

  deletePhoto(photoId: number): void {
    const photo = this.findPhotoById(photoId);

    if (!photo) {
      this.showMessage('error', 'Error', 'No se encontró la foto a eliminar');
      return;
    }

    if (photo.isMain) {
      this.showMessage(
        'warn',
        'Advertencia',
        'No se puede eliminar la foto principal'
      );
      return;
    }

    this.deletingPhotoId = photoId;

    this.userService.deletePhoto(photoId).subscribe({
      next: () => this.handleDeletePhotoSuccess(photo),
      error: (error) => this.handleDeletePhotoError(error),
      complete: () => (this.deletingPhotoId = null),
    });
  }

  onFileSelect(event: FileSelectEvent): void {
    if (!event.files?.length) {
      this.resetUploadState();
      return;
    }

    const file = event.files[0];
    if (!this.validateImage(file)) {
      this.showMessage(
        'error',
        'Error',
        'Por favor, selecciona un archivo de imagen válido'
      );
      this.resetUploadState();
      return;
    }

    this.selectedFile = file;
    this.createPreview(file);
  }

  private createFormData(): FormData {
    const formData = new FormData();
    if (this.selectedFile) {
      formData.append('file', this.selectedFile, this.selectedFile.name);
    }
    return formData;
  }

  private validateImage(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    return validTypes.includes(file.type);
  }

  private findPhotoById(photoId: number) {
    return this.user.photos.find((p) => p.id === photoId);
  }

  private createPreview(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      this.previewUrl = (e.target?.result as string) || null;
    };
    reader.onerror = () => {
      this.showMessage(
        'error',
        'Error',
        'Error al crear la previsualización de la imagen'
      );
      this.resetUploadState();
    };
    reader.readAsDataURL(file);
  }

  private handlePhotoUploadSuccess(photo: Photo): void {
    if (!this.user.photos) {
      this.user.photos = [];
    }

    const updatedPhotos = [...this.user.photos, photo];

    this.user = {
      ...this.user,
      photos: updatedPhotos,
    };

    this.showMessage('success', 'Éxito', 'Foto subida correctamente');
  }

  private handleSetMainPhotoSuccess(photo: Photo): void {
    this.user.photos = this.user.photos.map((p) => ({
      ...p,
      isMain: p.id === photo.id,
    }));
    this.user.mainPhoto = { ...photo, isMain: true };
    this.showMessage(
      'success',
      'Éxito',
      'Foto principal actualizada correctamente'
    );
  }

  private handleDeletePhotoSuccess(photo: Photo): void {
    this.user.photos = this.user.photos.filter((p) => p.id !== photo.id);
    this.showMessage('success', 'Éxito', 'Foto eliminada correctamente');

    if (this.previewUrl && this.previewUrl.includes(photo.url)) {
      this.resetUploadState();
    }
  }

  private handlePhotoUploadError(error: HttpErrorResponse): void {
    console.error('Error al subir la foto:', error);
    const errorMessage =
      error.message || 'Error al subir la foto. Por favor, intenta nuevamente';
    this.showMessage('error', 'Error', errorMessage);
  }

  private handleSetMainPhotoError(error: HttpErrorResponse): void {
    console.error('Error al establecer la foto principal:', error);
    const errorMessage =
      error.message || 'Error al actualizar la foto principal';
    this.showMessage('error', 'Error', errorMessage);
  }

  private handleDeletePhotoError(error: HttpErrorResponse): void {
    console.error('Error al eliminar la foto:', error);
    const errorMessage = error.message || 'Error al eliminar la foto';
    this.showMessage('error', 'Error', errorMessage);
    this.deletingPhotoId = null;
  }

  private showMessage(severity: string, summary: string, detail: string): void {
    this.messageService.add({ severity, summary, detail });
  }

  resetUploadState(): void {
    this.isUploading = false;
    this.selectedFile = null;
    this.previewUrl = null;

    if (this.fileUpload) {
      this.fileUpload.reset();
    }
  }
}
