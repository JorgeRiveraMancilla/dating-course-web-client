import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-photo-preview',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './photo-preview.component.html',
})
export class PhotoPreviewComponent {
  @Input() previewUrl: string | null = null;
  @Input() isUploading = false;
  @Output() deletePhoto = new EventEmitter<void>();
  @Output() uploadPhoto = new EventEmitter<void>();
}
