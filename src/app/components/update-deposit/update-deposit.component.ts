import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Deposit } from './../../models/deposit';

import { DepositService } from './../../services/deposit.service';

@Component({
  selector: 'app-update-deposit',
  templateUrl: './update-deposit.component.html',
  styleUrls: ['./update-deposit.component.css'],
  providers: [NgbAlertConfig]
})
export class UpdateDepositComponent implements OnInit {

  @Input() deposit: Deposit;
  @Input() readonly: boolean;
  public depositForm: FormGroup;
  public alertMessage: string = "";
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();

  public formErrors = {
    'name': '',
    'capacity':''
  };

  public validationMessages = {
    'name': {
      'required': 'Este campo es requerido.'
    },
    'capacity' : {
    }
  };

  constructor(
    public _depositService: DepositService,
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) { }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.buildForm();
    this.depositForm.setValue({
      '_id': this.deposit._id,
      'name': this.deposit.name,
      'capacity' : this.deposit.capacity
    });
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {

    this.depositForm = this._fb.group({
      '_id': [this.deposit._id, [
        ]
      ],
      'name': [this.deposit.name, [
        Validators.required
        ]
      ],
      'capacity' : [this.deposit.capacity,[
        ]
      ]
    });

    this.depositForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
  }

  public onValueChanged(data?: any): void {

    if (!this.depositForm) { return; }
    const form = this.depositForm;

    for (const field in this.formErrors) {
      this.formErrors[field] = '';
      const control = form.get(field);

      if (control && control.dirty && !control.valid) {
        const messages = this.validationMessages[field];
        for (const key in control.errors) {
          this.formErrors[field] += messages[key] + ' ';
        }
      }
    }
  }

  public updateDeposit(): void {
    if (!this.readonly) {
      this.loading = true;
      this.deposit = this.depositForm.value;
      this.saveChanges();
    }
  }

  public saveChanges(): void {

    this.loading = true;

    this._depositService.updateDeposit(this.deposit).subscribe(
      result => {
        if (!result.deposit) {
          if (result.message && result.message !== "") this.showMessage(result.message, "info", true);
          this.loading = false;
        } else {
          this.deposit = result.deposit;
          this.showMessage("El impuesto se ha actualizado con éxito.", "success", false);
          this.activeModal.close('save_close');
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage(): void {
    this.alertMessage = "";
  }
}
