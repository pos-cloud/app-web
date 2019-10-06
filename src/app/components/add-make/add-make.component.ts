import { Component, OnInit, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Make } from './../../models/make';

import { MakeService } from './../../services/make.service';
import { Config } from 'app/app.config';

@Component({
  selector: 'app-add-make',
  templateUrl: './add-make.component.html',
  styleUrls: ['./add-make.component.css'],
  providers: [NgbAlertConfig]
})

export class AddMakeComponent implements OnInit {

  public make: Make;
  public makeForm: FormGroup;
  public alertMessage: string = '';
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public filesToUpload: Array<File>;
  public imageURL: string;
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
    public _makeService: MakeService,
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) {
    if(window.screen.width < 1000) this.orientation = 'vertical';
  }

  ngOnInit(): void {

    this.imageURL = './../../../assets/img/default.jpg';
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.make = new Make ();
    this.buildForm();
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {

    this.makeForm = this._fb.group({
      'description': [this.make.description, [
          Validators.required
        ]
      ],
      'visibleSale' : [this.make.visibleSale, [
        ]
      ],
      'ecommerceEnabled' : [this.make.ecommerceEnabled, [
        ]
      ]
    });

    this.makeForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
    this.focusEvent.emit(true);
  }

  public onValueChanged(data?: any): void {

    if (!this.makeForm) { return; }
    const form = this.makeForm;

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

  public addMake(): void {
    
    this.make = this.makeForm.value;
    this.saveMake();
  }

  public saveMake(): void {
    
    this.loading = true;
    
    this._makeService.saveMake(this.make).subscribe(
      result => {
        if (!result.make) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true); 
          this.loading = false;
        } else {
          this.make = result.make;
          if (this.filesToUpload) {
            this._makeService.makeFileRequest(this.make._id, this.filesToUpload)
                .then(
                  (result)=>{
                    let resultUpload;
                    resultUpload = result;
                    this.make.picture = resultUpload.make.picture;
                    if (this.make.picture && this.make.picture !== 'default.jpg') {
                      this.imageURL = Config.apiURL + 'get-image-make/' + this.make.picture + "/" + Config.database;
                    } else {
                      this.imageURL = './../../../assets/img/default.jpg';
                    }
                    this.showMessage("La marca se ha añadido con éxito.", 'success', false);
                    this.make = new Make();
                    this.filesToUpload = null;
                    this.buildForm();
                  },
                  (error) =>{
                    this.showMessage(error, 'danger', false);
                  }
                );
          } else {
            this.showMessage("El rubro se ha añadido con éxito.", 'success', false);
            this.make = new Make();
            this.filesToUpload = null;
            this.buildForm();
          }
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public fileChangeEvent(fileInput: any) {

    this.filesToUpload = <Array<File>>fileInput.target.files;
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