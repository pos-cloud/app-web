//Angular
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

//Terceros
import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

//Models
import { MovementOfArticle } from '../../models/movement-of-article';

//Services
import { MovementOfArticleService } from '../../services/movement-of-article.service';

//Pipes
import { RoundNumberPipe } from '../../pipes/round-number.pipe';
import { Article } from '../../models/article';

@Component({
  selector: 'app-add-movement-of-article',
  templateUrl: './add-movement-of-article.component.html',
  styleUrls: ['./add-movement-of-article.component.css'],
  providers: [NgbAlertConfig]
})

export class AddMovementOfArticleComponent implements OnInit {

  @Input() movementOfArticle: MovementOfArticle;
  public movementOfArticleForm: FormGroup;
  public alertMessage: string = "";
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  @Input() isCreateItem: boolean;
  public roundNumber: RoundNumberPipe;

  public formErrors = {
    'description': '',
    'amount': '',
    'salePrice': ''
  };

  public validationMessages = {
    'description': {
      'required': 'Este campo es requerido.'
    },
    'amount': {
      'required': 'Este campo es requerido.'
    },
    'salePrice': {
      'required': 'Este campo es requerido.'
    }
  };

  constructor(
    public _movementOfArticleService: MovementOfArticleService,
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) {
    if(this.isCreateItem) {
      this.isCreateItem = false;
    }
    this.roundNumber = new RoundNumberPipe();
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

    this.movementOfArticleForm = this._fb.group({
      '_id': [this.movementOfArticle._id, [
        ]
      ],
      'description': [this.movementOfArticle.description, [
          Validators.required
        ]
      ],
      'amount': [this.movementOfArticle.amount, [
          Validators.required
        ]
      ],
      'notes': [this.movementOfArticle.notes, [
        ]
      ],
      'salePrice': [this.movementOfArticle.salePrice, [
        ]
      ]
    });

    this.movementOfArticleForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
    this.focusEvent.emit(true);
  }

  public onValueChanged(data?: any): void {

    if (!this.movementOfArticleForm) { return; }
    const form = this.movementOfArticleForm;

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

  public addAmount(): void {
    this.movementOfArticle.amount += 1;
    this.setValueForm();
  }

  public subtractAmount(): void {
    if (this.movementOfArticleForm.value.amount > 1) {
      this.movementOfArticle.amount -= 1;
    } else {
      this.movementOfArticle.amount = 1;
    }
    this.setValueForm();
  }

  public setValueForm(): void {

    if (!this.movementOfArticle._id) this.movementOfArticle._id = "";
    if (!this.movementOfArticle.description) this.movementOfArticle.description = "";
    if (!this.movementOfArticle.amount) this.movementOfArticle.amount = 1;
    if (!this.movementOfArticle.notes) this.movementOfArticle.notes = "";
    if (!this.movementOfArticle.salePrice) this.movementOfArticle.salePrice = 0;

    this.movementOfArticle.amount = this.roundNumber.transform(this.movementOfArticle.amount, 2);

    this.movementOfArticleForm.setValue({
      '_id': this.movementOfArticle._id,
      'description': this.movementOfArticle.description,
      'amount': this.movementOfArticle.amount,
      'notes': this.movementOfArticle.notes,
      'salePrice': this.movementOfArticle.salePrice
    });
  }

  public addMovementOfArticle(): void {

    this.movementOfArticle.description = this.movementOfArticleForm.value.description;
    this.movementOfArticle.amount = this.movementOfArticleForm.value.amount;
    this.movementOfArticle.notes = this.movementOfArticleForm.value.notes;
    this.movementOfArticle.salePrice = this.roundNumber.transform(this.movementOfArticle.amount * this.movementOfArticle.article.salePrice, 2);
    this.movementOfArticle.basePrice = this.roundNumber.transform(this.movementOfArticle.amount * this.movementOfArticle.article.basePrice, 2);
    this.movementOfArticle.VATAmount = this.roundNumber.transform(this.movementOfArticle.amount * this.movementOfArticle.article.VATAmount, 2);
    this.movementOfArticle.costPrice = this.roundNumber.transform(this.movementOfArticle.amount * this.movementOfArticle.article.costPrice, 2);
    this.movementOfArticle.markupPrice = this.roundNumber.transform(this.movementOfArticle.amount * this.movementOfArticle.article.markupPrice, 2);
    this.movementOfArticle.costPrice = this.roundNumber.transform(this.movementOfArticle.amount * this.movementOfArticle.article.costPrice, 2);
    
    if(this.movementOfArticle._id && this.movementOfArticle._id !== "") {
      this.updateMovementOfArticle();
    } else {
      this.saveMovementOfArticle();
    }
  }

  public saveMovementOfArticle(): void {

    this.loading = true;

    this._movementOfArticleService.saveMovementOfArticle(this.movementOfArticle).subscribe(
      result => {
        if (!result.movementOfArticle) {
          if (result.message && result.message !== "") this.showMessage(result.message, "info", true);
        } else {
          this.activeModal.close('save');
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public deleteMovementOfArticle(): void {

    this.loading = true;

    this._movementOfArticleService.deleteMovementOfArticle(this.movementOfArticleForm.value._id).subscribe(
      result => {
        if (!result.movementOfArticle) {
          if (result.message && result.message !== "") this.showMessage(result.message, "info", true);
        } else {
          this.activeModal.close('delete');
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public updateMovementOfArticle() {

    this.loading = true;

    this._movementOfArticleService.updateMovementOfArticle(this.movementOfArticle).subscribe(
      result => {
        if (!result.movementOfArticle) {
          if (result.message && result.message !== "") this.showMessage(result.message, "info", true);
        } else {
          this.activeModal.close('update');
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