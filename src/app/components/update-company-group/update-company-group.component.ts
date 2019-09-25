import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { CompanyGroup } from './../../models/company-group';

import { CompanyGroupService } from './../../services/company-group.service';

@Component({
  selector: 'app-update-company-group',
  templateUrl: './update-company-group.component.html',
  styleUrls: ['./update-company-group.component.css'],
  providers: [NgbAlertConfig]
})
export class UpdateCompanyGroupComponent implements OnInit {

  @Input() companyGroup: CompanyGroup;
  @Input() readonly: boolean;
  public companyGroupForm: FormGroup;
  public alertMessage: string = '';
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public orientation: string = 'horizontal';

  public formErrors = {
    'description': ''
  };

  public validationMessages = {
    'description': {
      'required':       'Este campo es requerido.'
    }
  };

  constructor(
    public _companyGroupService: CompanyGroupService,
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) {
    if(window.screen.width < 1000) this.orientation = 'vertical';
  }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.buildForm();
    this.companyGroupForm.setValue({
      '_id':this.companyGroup._id,
      'description': this.companyGroup.description
    });
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {

    this.companyGroupForm = this._fb.group({
      '_id': [this.companyGroup._id, [
        ]
      ],
      'description': [this.companyGroup.description, [
          Validators.required
        ]
      ],
    });

    this.companyGroupForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
  }

  public onValueChanged(data?: any): void {

    if (!this.companyGroupForm) { return; }
    const form = this.companyGroupForm;

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

  public updateCompanyGroup (): void {
    if (!this.readonly) {
      this.loading = true;
      this.companyGroup = this.companyGroupForm.value;
      this.saveChanges();
    }
  }

  public saveChanges(): void {
    
    this._companyGroupService.updateCompanyGroup(this.companyGroup).subscribe(
      result => {
        if (!result.companyGroup) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true); 
          this.loading = false;
        } else {
          this.companyGroup = result.companyGroup;
          this.showMessage("El grupo se ha actualizado con éxito.", 'success', false);
          this.activeModal.close('save_close');
        }
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
