import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { FileService } from 'app/core/services/file.service';
import { ToastService } from 'app/shared/components/toast/toast.service';

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

  @Output() uploadedUrls = new EventEmitter<string[]>();
  @Input() folder = '';
  @Input() set existingImageUrl(url: string | undefined) {
    if (url && url.includes('https') && url !== this.imageUrl) {
      this.imageUrl = url;
    }
  }
  constructor(
    private uploadService: FileService,
    private toast: ToastService
  ) {}

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFiles = [file];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imageUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  async uploadImages() {
    const urls: string[] = [];

    // Si no hay archivos seleccionados pero hay una imagen existente, no emitir nada
    if (this.selectedFiles.length === 0 && this.imageUrl) {
      return;
    }

    let failed = false;
    for (const file of this.selectedFiles) {
      try {
        const url = await this.uploadService.uploadImage(this.folder, [file]);
        urls.push(url.toString());
      } catch (error) {
        failed = true;
        console.error('Error uploading file:', error);
      }
    }

    if (failed) {
      this.toast.showToast(null, 'danger', '', 'No se pudo subir la imagen.');
    }
    if (failed && urls.length === 0) {
      return;
    }
    this.uploadedUrls.emit(urls);
  }

  // UploadFileComponent
  async onDeleteImage(event: Event, pictureDelete: string): Promise<void> {
    event.stopPropagation(); // Evita que se abra el selector de archivos

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
