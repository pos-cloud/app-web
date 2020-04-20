import { Component, OnInit, Input, EventEmitter, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbActiveModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

import { EmailService } from './send-email.service';
import { CompanyService } from '../company/company.service';
import * as $ from 'jquery';

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

  
    //tiny
    public html = '';

    public tinyMCEConfigBody = {
        selector: "tinymce",
        theme: "modern",
        paste_data_images: true,
        plugins: [
            "advlist autolink lists link image charmap print preview hr anchor pagebreak",
            "searchreplace wordcount visualblocks visualchars code fullscreen",
            "insertdatetime media nonbreaking table contextmenu directionality",
            "emoticons template paste textcolor colorpicker textpattern"
        ],
        toolbar1: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media | forecolor backcolor emoticons | print preview fullscreen",
        image_advtab: true,
        height: 250,
        file_picker_types: 'file image media',
        images_dataimg_filter: function(img) {
            return img.hasAttribute('internal-blob');
          },
        /*file_picker_callback: function (callback, value, meta) {
            if (meta.filetype == 'image') {
                $('#upload').trigger('click');
                $('#upload').on('change', function () {
                    var file = this.files[0];
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        callback(e.target['result'], {
                            alt: ''
                        });
                    };
                    reader.readAsDataURL(file);
                });
            }
        },*/
        file_picker_callback: function(callback, value, meta) {
            if (meta.filetype == 'image') {
              $('#upload').trigger('click');
              $('#upload').on('change', function() {
                var file = this.files[0];
                var reader = new FileReader();
                reader.onload = function(e) {
            
                  callback(e.target['result'], {
                    alt: ''
                  });
                };
                reader.readAsDataURL(file);
              });
            }
          },
    }
  
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

  ngAfterViewInit() {
    this.focusEvent.emit(true);
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

        this.loading = false;
        if(result.accepted && result.accepted.length > 0) {
          this.showMessage("El email se ha enviado correctamente.", 'success', false);
        } 
        if (result.message && result.message !== '') {
            this.showMessage(result.message, 'info', true);
        }

        if(result.error){
            this.showMessage(result.error.response, 'info', true);
        }

      },
      err => {
        this.loading = false;
        this.showMessage(err.error, 'danger', false);
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
