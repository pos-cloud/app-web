import { Component, OnInit, EventEmitter, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { UseOfCFDI } from '../use-of-CFDI';

import { UseOfCFDIService } from '../use-of-CFDI.service';

@Component({
  selector: 'app-add-use-of-CFDI',
  templateUrl: './add-use-of-CFDI.component.html',
  styleUrls: ['./add-use-of-CFDI.component.css'],
  providers: [NgbAlertConfig]
})

export class AddUseOfCFDIComponent implements OnInit {

  public useOfCFDI: UseOfCFDI;
  @Input() useOfCFDIId: string;
  @Input() operation: string;
  @Input() readonly: boolean;
  public useOfCFDIForm: FormGroup;
  public alertMessage: string = '';
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();

  public formErrors = {
    'code': '',
    'description': ''
  };

  public validationMessages = {
    'code': {
      'required': 'Este campo es requerido.'
    },
    'description': {
      'required': 'Este campo es requerido.'
    }
  };

  constructor(
    public _useOfCFDIService: UseOfCFDIService,
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) {
    this.useOfCFDI = new UseOfCFDI();
  }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.buildForm();
    if (this.useOfCFDIId) {
      this.getUseOfCFDI();
    } else {
      this.getLastUseOfCFDI();
    }
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {

    this.useOfCFDIForm = this._fb.group({
      '_id': [this.useOfCFDI._id, [
        ]
      ],
      'code': [this.useOfCFDI.code, [
          Validators.required
        ]
      ],
      'description': [this.useOfCFDI.description, [
          Validators.required
        ]
      ]
    });

    this.useOfCFDIForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
    this.focusEvent.emit(true);
  }

  public onValueChanged(data?: any): void {

    if (!this.useOfCFDIForm) { return; }
    const form = this.useOfCFDIForm;

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

  public getLastUseOfCFDI(): void {

    this.loading = true;

    let query = 'sort="code":-1&limit=1';

    this._useOfCFDIService.getUsesOfCFDI(query).subscribe(
      result => {
        if (!result.useOfCFDIs) {
          this.loading = false;
        } else {
          this.hideMessage();
          this.loading = false;
          try {
            this.useOfCFDI.code = (parseInt(result.useOfCFDIs[0].code) + 1).toString();
            this.setValuesForm();
          } catch (e) {
          }
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }


  public getUseOfCFDI(): void {

    this.loading = true;

    this._useOfCFDIService.getUseOfCFDI(this.useOfCFDIId).subscribe(
      result => {
        if (!result.useOfCFDI) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          this.hideMessage();
          this.useOfCFDI = result.useOfCFDI;
          this.setValuesForm();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public setValuesForm(): void {

    if (!this.useOfCFDI._id) { this.useOfCFDI._id = ''; }
    if (!this.useOfCFDI.code) { this.useOfCFDI.code = '1'; }
    if (!this.useOfCFDI.description) { this.useOfCFDI.description = ''; }

    const values = {
      '_id': this.useOfCFDI._id,
      'code': this.useOfCFDI.code,
      'description': this.useOfCFDI.description,
    };

    this.useOfCFDIForm.setValue(values);
  }

  public addUseOfCFDI(): void {

    if (!this.readonly) {
      this.useOfCFDI = this.useOfCFDIForm.value;
      if (this.operation === 'add') {
        this.saveUseOfCFDI();
      } else if (this.operation === 'update') {
        this.updateUseOfCFDI();
      }
    }
  }

  public saveUseOfCFDI(): void {

    this.loading = true;

    this._useOfCFDIService.saveUseOfCFDI(this.useOfCFDI).subscribe(
      result => {
        if (!result.useOfCFDI) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.loading = false;
        } else {
          this.useOfCFDI = result.useOfCFDI;
          this.showMessage("El uso de CFDI se ha añadido con éxito.", 'success', true);
          this.useOfCFDI = new UseOfCFDI ();
          this.buildForm();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public updateUseOfCFDI(): void {

    this.loading = true;

    this._useOfCFDIService.updateUseOfCFDI(this.useOfCFDI).subscribe(
      result => {
        if (!result.useOfCFDI) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.loading = false;
        } else {
          this.useOfCFDI = result.useOfCFDI;
          this.showMessage("El uso de CFDI se ha actualizado con éxito.", 'success', true);
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public deleteUseOfCFDI(): void {

    this.loading = true;

    this._useOfCFDIService.deleteUseOfCFDI(this.useOfCFDI._id).subscribe(
      result => {
        this.activeModal.close('delete_close');
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage():void {
    this.alertMessage = '';
  }
}
