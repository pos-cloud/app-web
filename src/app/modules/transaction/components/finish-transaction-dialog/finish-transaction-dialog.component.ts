import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { NgbActiveModal, NgbAlertConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

import { PrintService } from '@core/services/print.service';
import { SendEmailComponent } from '@shared/components/send-email/send-email.component';
import { SendWppComponent } from '@shared/components/send-wpp/send-wpp.component';
import { ToastService } from '@shared/components/toast/toast.service';
import { ApiResponse, PrintType } from '@types';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import * as printJS from 'print-js';

interface TransactionOption {
  id: string;
  name: string;
  icon: string;
  description: string;
}

@Component({
  selector: 'app-finish-transaction-dialog',
  templateUrl: './finish-transaction-dialog.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, PipesModule, TranslateModule],
})
export class FinishTransactionDialogComponent implements OnInit {
  @Input() transaction: any;

  public transactionOptions: TransactionOption[] = [
    {
      id: 'print',
      name: 'Imprimir',
      icon: 'fa-print',
      description: 'Imprimir la transacción',
    },
    {
      id: 'whatsapp',
      name: 'Enviar por WhatsApp',
      icon: 'fa-whatsapp',
      description: 'Enviar por WhatsApp',
    },
    {
      id: 'email',
      name: 'Enviar por Correo',
      icon: 'fa-envelope',
      description: 'Enviar por correo electrónico',
    },
  ];

  public selectedOption: TransactionOption;
  public alertMessage: string = '';
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();

  constructor(
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    private _modalService: NgbModal,
    private _printService: PrintService,
    private _toastService: ToastService
  ) {}

  ngOnInit() {
    // Por defecto seleccionar la primera opción
    if (this.transactionOptions.length > 0) {
      this.selectedOption = this.transactionOptions[0];
    }
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public selectOption(option: TransactionOption): void {
    this.selectedOption = option;
  }

  public async finishTransaction(): Promise<void> {
    if (this.loading) return;
    this.loading = true;

    try {
      switch (this.selectedOption.id) {
        case 'print':
          await this.printTransaction();
          break;
        case 'whatsapp':
          await this.sendWhatsApp();
          break;
        case 'email':
          await this.sendEmail();
          break;
      }
    } catch (error) {
      this.showMessage('Error al procesar la acción', 'danger', false);
    } finally {
      this.loading = false;
    }
  }

  private async printTransaction(): Promise<void> {
    return new Promise<void>((resolve) => {
      const data = {
        transactionId: this.transaction._id,
      };

      this._printService.toPrint(PrintType.Transaction, data).subscribe({
        next: (result: Blob | ApiResponse) => {
          if (!result) {
            this._toastService.showToast({ message: 'Error al generar el PDF' });
            resolve();
            return;
          }
          if (result instanceof Blob) {
            try {
              const blobUrl = URL.createObjectURL(result);
              printJS(blobUrl);
              this.activeModal.close({
                option: this.selectedOption,
                action: 'print',
                success: true,
              });
            } catch (e) {
              this._toastService.showToast({ message: 'Error al generar el PDF' });
            } finally {
              resolve();
            }
          } else {
            this._toastService.showToast(result);
            resolve();
          }
        },
        error: () => {
          this._toastService.showToast({ message: 'Error al generar el PDF' });
          resolve();
        },
        complete: () => {
          // En caso de que no haya pasado por next/error
          resolve();
        },
      });
    });
  }

  private async sendWhatsApp(): Promise<void> {
    const modalRef = this._modalService.open(SendWppComponent, {
      size: 'md',
      backdrop: 'static',
    });

    if (this.transaction && this.transaction.company) {
      modalRef.componentInstance.phone = this.transaction.company.phones;
    }
    modalRef.componentInstance.transactionId = this.transaction._id;

    try {
      const result = await modalRef.result;
      this.activeModal.close({
        option: this.selectedOption,
        action: 'whatsapp',
        success: true,
      });
    } catch (e) {
      // Modal cerrado sin enviar
    }
  }

  private async sendEmail(): Promise<void> {
    const modalRef = this._modalService.open(SendEmailComponent, {
      size: 'lg',
      backdrop: 'static',
    });

    if (this.transaction && this.transaction.company) {
      modalRef.componentInstance.to = this.transaction.company.emails;
      modalRef.componentInstance.subject = `${this.transaction.type.name} ${this.padNumber(
        this.transaction.origin,
        4
      )}-${this.transaction.letter}-${this.padNumber(this.transaction.number, 8)}`;
    }
    modalRef.componentInstance.transactionId = this.transaction._id;

    try {
      const result = await modalRef.result;
      this.activeModal.close({
        option: this.selectedOption,
        action: 'email',
        success: true,
      });
    } catch (e) {
      // Modal cerrado sin enviar
    }
  }

  private padNumber(n, length): string {
    n = n.toString();
    while (n.length < length) n = '0' + n;
    return n;
  }

  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage(): void {
    this.alertMessage = '';
  }

  @HostListener('window:keydown', ['$event'])
  public handleKeyboardShortcuts(event: KeyboardEvent): void {
    if (this.loading) return;

    const key = event.key;

    if (key === 'Enter') {
      event.preventDefault();
      this.finishTransaction();
      return;
    }

    const match = /^F(\d+)$/.exec(key);
    if (!match) return;

    const fnNumber = parseInt(match[1], 10);
    const index = fnNumber - 1; // F1 => 0, F2 => 1
    if (this.transactionOptions && index >= 0 && index < this.transactionOptions.length) {
      event.preventDefault();
      this.selectedOption = this.transactionOptions[index];
    }
  }
}
