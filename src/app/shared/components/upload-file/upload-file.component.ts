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

  @Output() uploadedUrls = new EventEmitter<string[]>();
  @Input() folder = '';
  @Input() set existingImageUrl(url: string) {
    this.imageUrl = url;
  }
  constructor(private uploadService: FileService) {}

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

    for (const file of this.selectedFiles) {
      try {
        const url = await this.uploadService.uploadImage(this.folder, [file]);
        urls.push(url.toString());
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
    this.uploadedUrls.emit(urls);
  }
}
