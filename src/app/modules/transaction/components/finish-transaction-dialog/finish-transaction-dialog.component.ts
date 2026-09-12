import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { NgbActiveModal, NgbAlertConfig, NgbAlertModule, NgbModal, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

import { PrintService } from '@core/services/print.service';
import { PosCloudAgentService } from '@core/services/pos-cloud-agent.service';
import { SendEmailComponent } from '@shared/components/send-email/send-email.component';
import { SendWppComponent } from '@shared/components/send-wpp/send-wpp.component';
import { ToastService } from '@shared/components/toast/toast.service';
import { ApiResponse, PrintType } from '@types';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import * as printJS from 'print-js';
import { firstValueFrom } from 'rxjs';

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
  imports: [CommonModule, FormsModule, PipesModule, TranslateModule, NgbTooltipModule, NgbAlertModule],
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
      id: 'print-direct',
      name: 'Impresión directa',
      icon: 'fa-bolt',
      description: 'Imprimir sin diálogo y abrir la gaveta',
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
    private _agent: PosCloudAgentService,
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
        case 'print-direct':
          await this.printDirect();
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
    try {
      const result = await firstValueFrom(
        this._printService.toPrint(PrintType.Transaction, { transactionId: this.transaction._id })
      );

      if (!result) {
        this._toastService.showToast({ message: 'Error al generar el PDF' });
        return;
      }

      if (result instanceof Blob) {
        printJS(URL.createObjectURL(result));
        this.activeModal.close({
          option: this.selectedOption,
          action: 'print',
          success: true,
        });
        return;
      }

      this._toastService.showToast(result);
    } catch {
      this._toastService.showToast({ message: 'Error al generar el PDF' });
    }
  }

  private async printDirect(): Promise<void> {
    if (!(await this._agent.isAvailable())) {
      this._toastService.showToast({
        message: 'No se encontró el agente de impresión. Instalá POS Cloud Agent en esta PC o usá Imprimir.',
      });
      return;
    }

    try {
      const result = await firstValueFrom(
        this._printService.toPrint(PrintType.Transaction, { transactionId: this.transaction._id })
      );

      if (!result) {
        this._toastService.showToast({ message: 'Error al generar el PDF' });
        return;
      }

      if (!(result instanceof Blob)) {
        this._toastService.showToast(result);
        return;
      }

      const printed = await this._agent.printPdf(result);
      if (!printed) {
        this._toastService.showToast({
          message: 'No se pudo imprimir. Probá de nuevo o usá Imprimir.',
        });
        return;
      }

      const drawerOpened = await this._agent.openDrawer();
      if (!drawerOpened) {
        this._toastService.showToast({
          message: 'Se imprimió el ticket, pero no se pudo abrir la gaveta.',
        });
      }

      this.activeModal.close({
        option: this.selectedOption,
        action: 'print-direct',
        success: true,
      });
    } catch {
      this._toastService.showToast({ message: 'Error al generar el PDF' });
    }
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
    }
    modalRef.componentInstance.subject = `${this.transaction.type.name} ${this.padNumber(this.transaction.origin, 4)}-${
      this.transaction.letter
    }-${this.padNumber(this.transaction.number, 8)}`;
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

    if (key === 'ArrowUp' || key === 'ArrowDown') {
      event.preventDefault();
      this.navigateOptions(key === 'ArrowUp' ? -1 : 1);
    }
  }

  private navigateOptions(direction: number): void {
    if (!this.transactionOptions || this.transactionOptions.length === 0) return;

    const currentIndex = this.transactionOptions.findIndex((option) => option.id === this.selectedOption.id);
    let newIndex = currentIndex + direction;

    // Wrap around - si llega al final, va al principio y viceversa
    if (newIndex >= this.transactionOptions.length) {
      newIndex = 0;
    } else if (newIndex < 0) {
      newIndex = this.transactionOptions.length - 1;
    }

    this.selectedOption = this.transactionOptions[newIndex];
  }
}
