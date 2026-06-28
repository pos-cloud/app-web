import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FileService } from 'app/core/services/file.service';

@Component({
  selector: 'app-process-invoice-upload',
  templateUrl: './process-invoice-upload.component.html',
  styleUrls: ['./process-invoice-upload.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class ProcessInvoiceUploadComponent {
  uploading = false;

  @Input() accept =
    '.png,.jpg,.jpeg,.gif,.webp,.bmp,.pdf,image/png,image/jpeg,image/gif,image/webp,application/pdf';
  @Output() invoiceUpload = new EventEmitter<{ urls: string[]; invoice: unknown | null }>();

  constructor(private fileService: FileService) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    input.value = '';
    void this.processFile(file);
  }

  private async processFile(file: File): Promise<void> {
    const urls: string[] = [];
    let invoice: unknown | null = null;

    this.uploading = true;
    try {
      const result = await this.fileService.processInvoice([file]);
      if (result !== null && typeof result === 'object') {
        invoice = result;
        const record = result as Record<string, unknown>;
        const maybeUrl = record.url ?? record.fileUrl;
        if (typeof maybeUrl === 'string') {
          urls.push(maybeUrl);
        }
      } else if (result != null && result !== '') {
        urls.push(String(result));
      }
      this.invoiceUpload.emit({ urls, invoice });
    } catch (error) {
      console.error('Error processing invoice:', error);
      this.invoiceUpload.emit({ urls: [], invoice: null });
    } finally {
      this.uploading = false;
    }
  }
}
