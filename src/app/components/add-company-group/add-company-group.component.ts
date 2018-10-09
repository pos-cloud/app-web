import { Component, OnInit, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { CompanyGroup } from './../../models/company-group';

import { CompanyGroupService } from './../../services/company-group.service';

@Component({
  selector: 'app-add-company-group',
  templateUrl: './add-company-group.component.html',
  styleUrls: ['./add-company-group.component.css'],
  providers: [NgbAlertConfig]
})
export class  AddCompanyGroupComponent implements OnInit {

  public companyGroup: CompanyGroup;
  public companyGroupForm: FormGroup;
  public alertMessage: string = '';
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();

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
  ) { }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.companyGroup = new CompanyGroup ();
    this.buildForm();
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {

    this.companyGroupForm = this._fb.group({
      'description': [this.companyGroup.description, [
          Validators.required
        ]
      ],
    });

    this.companyGroupForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
    this.focusEvent.emit(true);
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

  public addCompanyGroup(): void {
    this.loading = true;
    this.companyGroup = this.companyGroupForm.value;
    this.saveCompanyGroup();
  }

  public saveCompanyGroup(): void {
    
    this.loading = true;
    
    this._companyGroupService.saveCompanyGroup(this.companyGroup).subscribe(
      result => {
        if (!result.companyGroup) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true); 
          this.loading = false;
        } else {  
          this.companyGroup = result.companyGroup;
          this.showMessage("El salón se ha añadido con éxito.", 'success', false); 
          this.companyGroup = new CompanyGroup ();
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

  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage():void {
    this.alertMessage = '';
  }

}
