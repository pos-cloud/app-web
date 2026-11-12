import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { NgbActiveModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import { Deposit } from '@types';
import { DepositService } from 'app/core/services/deposit.service';

@Component({
  selector: 'app-select-deposit',
  templateUrl: './select-deposit.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class SelectDepositComponent implements OnInit {
  @Input() op: string;
  public transferForm: UntypedFormGroup;
  public deposits: Deposit[];
  public alertMessage = '';
  public loading: boolean = false;

  constructor(
    public _fb: UntypedFormBuilder,
    public _depositService: DepositService,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) {}

  ngOnInit() {
    this.buildForm();
    this.getDeposits();
  }

  public buildForm(): void {
    this.transferForm = this._fb.group({
      origin: [, []],
      destination: [, []],
      deposit: [, []],
    });
  }

  public getDeposits(): void {
    this._depositService
      .getAll({
        project: {
          _id: 1,
          name: 1,
          'branch.name': 1,
          operationType: 1,
        },
        match: { operationType: { $ne: 'D' } },
        sort: { name: 1 },
      })
      .subscribe(
        (result) => {
          if (result?.status === 200 && Array.isArray(result.result) && result.result.length > 0) {
            this.deposits = result.result;
          } else if (result?.status === 200) {
            this.showMessage('No se encontraron depósitos.', 'info', false);
          } else {
            this.showMessage('No se pudieron cargar los depósitos.', 'danger', false);
          }
        },
        (error) => {
          this.showMessage(error._body, 'danger', false);
        }
      );
  }

  public selectTransfer(): void {
    let valid = true;

    if (this.transferForm.value.origin === this.transferForm.value.destination && this.op === 'transfer') {
      this.showMessage('No puede seleccionar el mismo depósito de origen y destino', 'info', true);
      valid = false;
    }

    if (
      this.op === 'transfer' &&
      (this.transferForm.value.origin === null || this.transferForm.value.destination === null)
    ) {
      this.showMessage('Debe seleccionar un depósito para origen y otro para destino', 'info', true);
      valid = false;
    }

    if (valid) {
      this.activeModal.close({
        origin: this.transferForm.value.origin,
        destination: this.transferForm.value.destination,
        deposit: this.transferForm.value.deposit,
      });
    }
  }

  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage(): void {
    this.alertMessage = '';
  }
}
