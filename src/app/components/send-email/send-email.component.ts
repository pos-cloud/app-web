import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import { NgbActiveModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

import { CompanyService } from '../../core/services/company.service';
import { EmailService } from '../../core/services/send-email.service';

@Component({
  selector: 'app-send-email',
  templateUrl: './send-email.component.html',
  styleUrls: ['./send-email.component.css'],
  providers: [NgbAlertConfig],
  encapsulation: ViewEncapsulation.None,
})
export class SendEmailComponent implements OnInit {
  public sendEmailForm: UntypedFormGroup;
  public alertMessage: string = '';
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  @Input() emails;
  @Input() subject;
  @Input() body;
  @Input() attachments;

  public formErrors = {
    emails: '',
    subject: '',
    // 'body': ''
  };

  public validationMessages = {
    emails: {
      required: 'Este campo es requerido.',
    },
    subject: {
      required: 'Este campo es requerido.',
    },
    // 'body' : {
    //   'required':       'Este campo es requerido.'
    // }
  };

  observationContent: string = '';
  quillConfig = {
    formats: ['bold', 'italic', 'underline', 'strike', 'list', 'link'],
    modules: {
      toolbar: [
        ['bold', 'italic', 'underline', 'strike'], // Estilos básicos
        [{ list: 'ordered' }, { list: 'bullet' }], // Listas
        ['link'], // Enlaces
      ],
    },
    theme: 'snow', // Tema similar a "modern" en TinyMCE
    readOnly: false, // Si quieres solo lectura, usa true
    styles: {
      height: '150px', // Altura del editor
      width: '600px',
    },
  };

  constructor(
    public _companyService: CompanyService,
    public _serviceEmail: EmailService,
    public _fb: UntypedFormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) {}

  ngOnInit() {
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.buildForm();
    this.sendEmailForm.setValue({
      emails: this.emails || '',
      subject: this.subject || '',
      body: this.body || '',
      attachments: this.attachments || '',
    });
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {
    this.sendEmailForm = this._fb.group({
      emails: [this.emails, [Validators.required]],
      subject: [this.subject, [Validators.required]],
      body: ['', []],
      // 'body': [this.body, [
      //     Validators.required
      //   ]
      // ],
      attachments: ['', []],
    });

    this.sendEmailForm.valueChanges.subscribe((data) =>
      this.onValueChanged(data)
    );

    this.onValueChanged();
  }

  public onValueChanged(data?: any): void {
    if (!this.sendEmailForm) {
      return;
    }
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

  public sendEmail(): void {
    this.loading = true;
    this.sendEmailForm.value.attachments = this.attachments;

    this._serviceEmail.sendEmail(this.sendEmailForm.value).subscribe(
      (result) => {
        this.loading = false;
        if (result.accepted && result.accepted.length > 0) {
          this.showMessage(
            'El email se ha enviado correctamente.',
            'success',
            false
          );
        }
        if (result.message && result.message !== '') {
          this.showMessage(result.message, 'info', true);
        }
      },
      (err) => {
        this.loading = false;
        this.showMessage(err.error, 'danger', false);
      }
    );
  }

  public showMessage(
    message: string,
    type: string,
    dismissible: boolean
  ): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage(): void {
    this.alertMessage = '';
  }
}
