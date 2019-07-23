import { Component, OnInit, Input, EventEmitter, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbActiveModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

import { EmailService } from './../../services/send-email.service';
import { CompanyService } from './../../services/company.service';

@Component({
  selector: 'app-send-email',
  templateUrl: './send-email.component.html',
  styleUrls: ['./send-email.component.css'],
  providers: [NgbAlertConfig],
  encapsulation: ViewEncapsulation.None
})

export class SendEmailComponent implements OnInit {
  
  public sendEmailForm: FormGroup;
  public alertMessage: string = '';
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  @Input() emails;
  @Input() subject;
  @Input() body;

  public formErrors = {
    'emails': '',
    'subject': '',
    'body': ''
  };

  public validationMessages = {
    'emails': {
      'required':       'Este campo es requerido.'
    },
    'subject': {
      'required':       'Este campo es requerido.'
    },
    'body' : {
      'required':       'Este campo es requerido.'
    }
  };
  
  constructor(
    public _companyService: CompanyService,
    public _serviceEmail: EmailService,
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
  ) { }

  ngOnInit() {
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.buildForm();
    this.sendEmailForm.setValue({
      'emails': this.emails || '',
      'subject': this.subject || '', 
      'body': this.body || ''
    });
  }

  public buildForm(): void {
    this.sendEmailForm = this._fb.group({
      'emails': [this.emails, [
          Validators.required
        ]
      ],
      'subject': [this.subject, [
          Validators.required
        ]
      ],
      'body': [this.body, [
          Validators.required
        ]
      ],
    });

    this.sendEmailForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
  }

  public onValueChanged(data?: any): void {
    
    if (!this.sendEmailForm) { return; }
    const form = this.sendEmailForm;

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

  public sendEmail (): void {
    
    this.loading = true;

    this._serviceEmail.sendEmail(this.sendEmailForm.value).subscribe(
      result => {
        if (!result) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true); 
        } else {
          this.showMessage("El email se ha enviado correctamente.", 'success', false);
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error, 'danger', false);
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
    this.alertMessage = '';
  }
}
