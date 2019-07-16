import { Component, OnInit, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ClaimService } from 'app/services/claim.service';
import { AuthService } from 'app/services/auth.service';
import { ClaimPriority, ClaimType, Claim } from 'app/models/claim';
import { Config } from 'app/app.config';

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
  public claim: Claim;
  public priorities: ClaimPriority[] = [ ClaimPriority.Low, ClaimPriority.Half, ClaimPriority.High ];
  public types: ClaimType[] = [ ClaimType.Suggestion, ClaimType.Improvement, ClaimType.Err, ClaimType.Implementation ];

  public formErrors = {
    'name': '',
    'description': '',
    'priority': '',
    'type': '',
    'author': '',
    'email': ''
  };

  public validationMessages = {
    'name': {
      'required': 'Este campo es requerido.',
    },
    'description': {
      'required': 'Este campo es requerido.',
    },
    'priority': {
      'required': 'Este campo es requerido.',
    },
    'type': {
      'required': 'Este campo es requerido.',
    },
    'author': {
      'required': 'Este campo es requerido.',
    },
    'email': {
      'required': 'Este campo es requerido.',
    }
  };

  constructor(
    public _claimService: ClaimService,
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    private _authService: AuthService,
  ) {
    this.claim = new Claim();
    this._authService.getIdentity.subscribe(
      identity => {
        if(identity && identity.employee) {
          this.claim.author = identity.employee.name;
        }
      },
    );
    this.claim.email = Config.emailAccount;
  }

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
      'name': [this.claim.name, [
          Validators.required
        ]
      ],
      'description': [this.claim.description, [
          Validators.required
        ]
      ],
      'priority': [this.claim.priority, [
          Validators.required
        ]
      ],
      'type': [this.claim.type, [
          Validators.required
        ]
      ],
      'author': [this.claim.author, [
          Validators.required
        ]
      ],
      'email': [this.claim.email, [
          Validators.required
        ]
      ],
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
    this.claim = this.claimForm.value;
    this.saveClaim();
  }

  public saveClaim(): void {
    
    this.loading = true;

    this._claimService.saveClaim(this.claim).subscribe(
      result => {
        this.loading = false;
        if (!result.claim) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true); 
        } else {
          this.claim = result.claim;
          this.showMessage(`El informe ha sido recibido correctamente, estaremos en contacto contigo pronto. Tú nro de reclamo es ${this.claim._id}, débes guardarlo para consultar el estado del mismo.`, 'success', false);
          this.claim = new Claim();
          this._authService.getIdentity.subscribe(
            identity => {
              if(identity && identity.employee) {
                this.claim.author = identity.employee.name;
              }
            },
          );
          this.claim.email = Config.emailAccount;
          this.focusEvent.emit(true);
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
