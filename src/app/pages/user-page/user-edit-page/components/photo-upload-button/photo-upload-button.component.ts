import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { FileSelectEvent } from '../../../../../interfaces/file-select-event';

@Component({
  selector: 'app-photo-upload-button',
  standalone: true,
  imports: [ButtonModule, FileUploadModule],
  templateUrl: './photo-upload-button.component.html',
})
export class PhotoUploadButtonComponent {
  @Input() isUploading = false;
  @Output() fileSelected = new EventEmitter<FileSelectEvent>();
  @ViewChild('fileUpload') fileUploadInput!: ElementRef<HTMLInputElement>;

  onFileSelected(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const files = inputElement.files;

    if (files?.length) {
      const fileSelectEvent: FileSelectEvent = {
        originalEvent: event,
        files: Array.from(files),
        currentFiles: Array.from(files),
      };

      this.fileSelected.emit(fileSelectEvent);
      this.fileUploadInput.nativeElement.value = '';
    }
  }

  reset(): void {
    if (this.fileUploadInput?.nativeElement) {
      this.fileUploadInput.nativeElement.value = '';
    }
  }
}
