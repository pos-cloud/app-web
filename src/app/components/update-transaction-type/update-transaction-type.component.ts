import { Component, OnInit, EventEmitter, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { TransactionType, TransactionTypeMovements, CurrentAcount, CodeAFIP } from './../../models/transaction-type';
import { Room } from './../../models/room';

import { TransactionTypeService } from './../../services/transaction-type.service';
import { RoomService } from './../../services/room.service';

@Component({
  selector: 'app-update-transaction-type',
  templateUrl: './update-transaction-type.component.html',
  styleUrls: ['./update-transaction-type.component.css'],
  providers: [NgbAlertConfig]
})

export class UpdateTransactionTypeComponent implements OnInit {

  @Input() transactionType: TransactionType;
  @Input() readonly: boolean;
  public transactionTypeForm: FormGroup;
  public alertMessage: string = "";
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();

  public formErrors = {
    'name': '',
    'currentAccount': '',
    'movement': '',
    'fixedOrigin': '',
    'fixedLetter': '',
    'electronics': '',
    'codeA': '',
    'codeB': '',
    'codeC': '',
  };

  public validationMessages = {
    'name': {
      'required': 'Este campo es requerido.',
    },
    'currentAccount': {
      'required': 'Este campo es requerido.',
    },
    'movement': {
      'required': 'Este campo es requerido.',
    },
    'fixedOrigin': {
    },
    'fixedLetter': {
    },
    'electronics': {
      'required': 'Este campo es requerido.',
    },
    'codeA': {
    },
    'codeB': {
    },
    'codeC': {
    }
  };

  constructor(
    public _transactionTypeService: TransactionTypeService,
    public _roomService: RoomService,
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
  ) { }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.buildForm();
    this.setValueForm();
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {

    this.transactionTypeForm = this._fb.group({
      '_id': [this.transactionType._id, [
          Validators.required
        ]
      ],
      'name': [this.transactionType.name, [
          Validators.required
        ]
      ],
      'currentAccount': [this.transactionType.currentAccount, [
          Validators.required
        ]
      ], 
      'movement': [this.transactionType.movement, [
        Validators.required
      ]
      ],
      'fixedOrigin': [this.transactionType.fixedOrigin, [
        ]
      ], 
      'fixedLetter': [this.transactionType.fixedLetter, [
        ]
      ], 
      'electronics': [this.transactionType.electronics, [
          Validators.required,
        ]
      ],
      'codeA': [this.getCode(this.transactionType,"A"), [
        ]
      ],
      'codeB': [this.getCode(this.transactionType, "B"), [
        ]
      ],
      'codeC': [this.getCode(this.transactionType, "C"), [
        ]
      ]
    });


    this.transactionTypeForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
    this.focusEvent.emit(true);
  }

  public onValueChanged(data?: any): void {

    if (!this.transactionTypeForm) { return; }
    const form = this.transactionTypeForm;

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

  public setValueForm(): void {

    if (!this.transactionType._id) this.transactionType._id = "";
    if (!this.transactionType.name) this.transactionType.name = "";
    if (!this.transactionType.currentAccount) this.transactionType.currentAccount = CurrentAcount.No;
    if (!this.transactionType.movement) this.transactionType.movement = TransactionTypeMovements.Inflows;
    if (!this.transactionType.fixedOrigin) this.transactionType.fixedOrigin = 0;
    if (!this.transactionType.fixedLetter) this.transactionType.fixedLetter = "";
    if (!this.transactionType.electronics) this.transactionType.electronics = "No";

    this.transactionTypeForm.setValue({
      '_id': this.transactionType._id,
      'name': this.transactionType.name,
      'currentAccount': this.transactionType.currentAccount,
      'movement': this.transactionType.movement,
      'fixedOrigin': this.transactionType.fixedOrigin,
      'fixedLetter': this.transactionType.fixedLetter,
      'electronics': this.transactionType.electronics,
      'codeA': this.getCode(this.transactionType, "A"),
      'codeB': this.getCode(this.transactionType, "B"),
      'codeC': this.getCode(this.transactionType, "C")
    });
  }

  public getCode(transactionType: TransactionType, letter: string): number {

    let code: number = 0;
    if (transactionType.codes) {
      let jsonString = JSON.stringify(transactionType.codes);
      let json = JSON.parse(jsonString);
      json.find(function (x) {
        if (x.letter === letter) {
          code = x.code;
        }
      });
    }

    return code;
  }

  public updateTransactionType(): void {
    if (!this.readonly) {
      this.loading = true;
      this.transactionType = this.transactionTypeForm.value;
      this.transactionType.codes = this.getCodes();
      this.saveChanges();
    }
  }

  public getCodes(): CodeAFIP[] {

    let codes = new Array();
    let codeA = new CodeAFIP();
    codeA.letter = "A";
    codeA.code = this.transactionTypeForm.value.codeA;
    codes.push(codeA);
    let codeB = new CodeAFIP();
    codeB.letter = "B";
    codeB.code = this.transactionTypeForm.value.codeB;
    codes.push(codeB);
    let codeC = new CodeAFIP();
    codeC.letter = "C";
    codeC.code = this.transactionTypeForm.value.codeC;
    codes.push(codeC);

    return codes;
  }

  public saveChanges(): void {

    this._transactionTypeService.updateTransactionType(this.transactionType).subscribe(
      result => {
        if (!result.transactionType) {
          this.showMessage(result.message, "info", true);
          this.loading = false;
        } else {
          this.transactionType = result.transactionType;
          this.showMessage("El tipo de transacción se ha actualizado con éxito.", "success", false);
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