import { Component, OnInit, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ClaimService } from 'app/services/claim.service';

@Component({
  selector: 'app-claim',
  templateUrl: './claim.component.html',
  styleUrls: ['./claim.component.css'],
  providers: [NgbAlertConfig]
})

export class ClaimComponent  implements OnInit {

  public claimForm: FormGroup;
  public alertMessage: string = '';
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public claim: string = '';
  public priorities: string[] = [ 'Baja', 'Media', 'Alta' ];
  public types: string[] = [ 'Sugerencia', 'Mejora', 'Error', 'Nueva Implementación' ];

  public formErrors = {
    'claim': '',
    'priority': '',
    'type': '',
    'name': ''
  };

  public validationMessages = {
    'claim': {
      'required': 'Este campo es requerido.',
    },
    'priority': {
      'required': 'Este campo es requerido.',
    },
    'type': {
      'required': 'Este campo es requerido.',
    },
    'name': {
      'required': 'Este campo es requerido.',
    }
  };

  constructor(
    public _claimService: ClaimService,
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
  ) { }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.buildForm();
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {

    this.claimForm = this._fb.group({
      'claim': ['', [
          Validators.required
        ]
      ],
      'priority': [this.priorities[0], [
          Validators.required
        ]
      ],
      'type': [this.types[0], [
          Validators.required
        ]
      ],
      'name': ['', [
          Validators.required
        ]
      ]
    });

    this.claimForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
    this.focusEvent.emit(true);
  }

  public onValueChanged(data?: any): void {

    if (!this.claimForm) { return; }
    const form = this.claimForm;

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

  public addClaim(): void {
    this.loading = true;
    this.saveClaim();
  }

  public saveClaim(): void {
    
    this.loading = true;

    let message = "{" + this.claimForm.value.type +"} " + "{" + this.claimForm.value.priority +"} " + this.claimForm.value.claim + " - " + this.claimForm.value.name;
    
    this._claimService.saveClaim(message).subscribe(
      result => {
        this.loading = false;
        if (!result.claimId) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true); 
        } else {
          this.showMessage(`El informe ha sido recibido correctamente, estaremos en contacto contigo pronto. Tú nro de reclamo es ${result.claimId}, débes guardarlo para consultar el estado del mismo.`, 'success', false);
          this.buildForm();
        }
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
