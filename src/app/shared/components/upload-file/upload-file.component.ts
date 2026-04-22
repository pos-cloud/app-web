import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { FileService } from 'app/core/services/file.service';

@Component({
  selector: 'app-upload-file',
  templateUrl: './upload-file.component.html',
  styleUrls: ['./upload-file.component.scss'],
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule],
  standalone: true,
})
export class UploadFileComponent {
  selectedFiles: File[] = [];
  imageUrl: string | undefined;
  uploading = false;
  /** En modo preview: el archivo local es PDF (no se usa `<img>` con data URL, el navegador lo expande mal). */
  previewIsPdf = false;
  selectedFileLabel = '';

  @Output() uploadedUrls = new EventEmitter<string[]>();
  @Input() folder = '';
  @Input() displayMode: 'preview' | 'icon' = 'preview';
  @Input() accept = 'image/*';
  @Input() set existingImageUrl(url: string | undefined) {
    if (url && url.includes('https') && url !== this.imageUrl) {
      this.imageUrl = url;
      this.previewIsPdf = /\.pdf(\?|$)/i.test(url);
    } else if (!url) {
      this.previewIsPdf = false;
    }
  }
  constructor(private uploadService: FileService) {}

  onFileSelected(event: any): void {
    const file = event.target.files[0] as File | undefined;
    const input = event.target as HTMLInputElement;
    if (!file) {
      return;
    }
    this.selectedFiles = [file];

    if (this.displayMode === 'icon') {
      this.previewIsPdf = false;
      this.selectedFileLabel = file.name;
      void this.uploadImages();
      input.value = '';
      return;
    }

    const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
    this.selectedFileLabel = file.name;
    if (isPdf) {
      this.previewIsPdf = true;
      this.imageUrl = undefined;
      return;
    }

    this.previewIsPdf = false;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imageUrl = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  async uploadImages() {
    const urls: string[] = [];

    // Si no hay archivos seleccionados pero hay una imagen existente, no emitir nada
    if (this.selectedFiles.length === 0 && this.imageUrl) {
      return;
    }

    this.uploading = true;
    let database = localStorage.getItem('company');
    try {
      for (const file of this.selectedFiles) {
        try {
          if (this.displayMode === 'icon') {
            const url = await this.uploadService.processInvoice([file]);
            urls.push(url.toString());
          } else {
            const url = await this.uploadService.uploadImage(`${database}/${this.folder}`, [file]);
            urls.push(url.toString());
          }
        } catch (error) {
          console.error('Error uploading file:', error);
        }
      }
      this.uploadedUrls.emit(urls);
    } finally {
      this.uploading = false;
    }
  }

  // UploadFileComponent
  async onDeleteImage(event: Event, pictureDelete: string): Promise<void> {
    event.stopPropagation(); // Evita que se abra el selector de archivos

    if (this.previewIsPdf) {
      try {
        if (this.imageUrl) {
          await this.uploadService.deleteImage(this.imageUrl).toPromise();
        }
      } catch (error) {
        console.error('Error deleting image:', error);
      }
      this.previewIsPdf = false;
      this.selectedFileLabel = '';
      this.imageUrl = undefined;
      this.selectedFiles = [];
      this.uploadedUrls.emit([]);
      return;
    }

    if (!this.imageUrl) return;
    try {
      await this.uploadService.deleteImage(this.imageUrl).toPromise(); // o await si es promesa
    } catch (error) {
      console.error('Error deleting image:', error);
    }

    this.imageUrl = undefined; // Limpia la imagen
    this.selectedFiles = []; // Limpia los archivos seleccionados
    this.uploadedUrls.emit([]); // Emite vacío para notificar al padre
  }
}
