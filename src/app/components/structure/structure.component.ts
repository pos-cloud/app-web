import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { Structure } from 'app/models/structure';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { StructureService } from 'app/services/structure.service';
import { Router } from '@angular/router';
import { Config } from 'app/app.config';
import { ArticleService } from 'app/services/article.service';
import { Article } from 'app/models/article';

import { debounceTime, distinctUntilChanged, tap, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-structure',
  templateUrl: './structure.component.html',
  styleUrls: ['./structure.component.css']
})

export class StructureComponent implements OnInit {

  public searchArticles = (text$: Observable<string>) =>
  text$.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    tap(() => this.loading = true),
    switchMap(term =>
      this.getArticles(`where="description": { "$regex": "${term}", "$options": "i" }&limit=10`).then(
        articles => {
          return articles;
        }
      )
    ),
    tap(() => this.loading = false)
  )

  public formatterArticles = (x: {description: string}) => x.description;
  
  public filterKey = '';
  public filteredItems = [];
  @Input() operation: string;
  @Input() readonly: boolean;
  @Input() structureId : string;
  public articles : Article[];
  public structures : Structure[];
  public alertMessage: string = '';
  public userType: string;
  public structure: Structure;
  public areStructureEmpty: boolean = true;
  public orderTerm: string[] = ['parent'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public userCountry: string;
  public orientation: string = 'horizontal';
  public result;
  public structureForm: FormGroup;
  public searching: boolean = false;

  public formErrors = {
    'parent': '',
    'child': '',
    'quantity' : ''
  };
  public validationMessages = {
    'parent': {
      'required': 'Este campo es requerido.'
    },
    'child': {
      'required': 'Este campo es requerido.'
    },
    'quantity': {
      'required': 'Este campo es requerido.'
    }
  };

  constructor(
    public alertConfig: NgbAlertConfig,
    public _structureService: StructureService,
    public _articleService : ArticleService,
    public _router: Router,
    public _fb: FormBuilder,
    public activeModal: NgbActiveModal,
  ) {
    if(window.screen.width < 1000) this.orientation = 'vertical';
    this.structure = new Structure();
  }

  ngOnInit() {
    this.userCountry = Config.country;
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];;
    this.buildForm();
    if (this.structureId) {
      this.getStructure();
    }
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public getStructure() {

    this.loading = true;

    this._structureService.getStructure(this.structureId).subscribe(
      result => {
        if (!result.structure) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          this.hideMessage();
          this.structure = result.structure;
          this.setValueForm();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public setValueForm(): void {
   
    if (!this.structure._id) { this.structure._id = ''; }
    if (!this.structure.quantity) { this.structure.quantity = 0; }

    const values = {
      '_id': this.structure._id,
      'parent': this.structure.parent,
      'child': this.structure.child,
      'quantity' : this.structure.quantity
    };

    this.structureForm.setValue(values);
  }

  public buildForm(): void {

    this.structureForm = this._fb.group({
      '_id' : [this.structure._id, []],
      'parent': [this.structure.parent, [
        Validators.required
        ]
      ],
      'child': [this.structure.child, [
        Validators.required
        ]
      ],
      'quantity': [this.structure.quantity, [
        Validators.required
        ]
      ]
    });

    this.structureForm.valueChanges
      .subscribe(data => this.onValueChanged(data));
    this.onValueChanged();
  }

  public onValueChanged(data?: any): void {

    if (!this.structureForm) { return; }
    const form = this.structureForm;

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

  public addStructure() {

    switch (this.operation) {
      case 'add':
        this.saveStructure();
        break;
      case 'edit':
        this.updateStructure();
        break;
      case 'delete' :
        this.deleteStructure();
      default:
        break;
    }
  }

  public updateStructure() {

    this.loading = true;

    this.structure = this.structureForm.value;

    if(this.isValid()){
      this._structureService.updateStructure(this.structure).subscribe(
        result => {
          if (!result.structure) {
            this.loading = false;
            if (result.message && result.message !== '') { this.showMessage(result.message, 'info', true); }
          } else {
            this.loading = false;
            this.showMessage('La estructura se ha actualizado con éxito.', 'success', false);
          }
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          this.loading = false;
        }
      );
    } else {
      this.loading = false;
    }
  }

  public saveStructure() {

    this.loading = true;

    this.structure = this.structureForm.value;

    if(this.isValid()){
      this._structureService.saveStructure(this.structure).subscribe(
        result => {
          if (!result.structure) {
            this.loading = false;
            if (result.message && result.message !== '') { this.showMessage(result.message, 'info', true); }
          } else {
              this.loading = false;
              this.showMessage('La estructura se ha añadido con éxito.', 'success', false);
              this.structure = new Structure();
              this.structure.parent = this.structureForm.value.parent;
              this.buildForm();
              this.focusEvent.emit(true);
          }
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          this.loading = false;
        }
      );
    } else {
      this.loading = false;
    }
  }

  public deleteStructure() {

    this.loading = true;

    this._structureService.deleteStructure(this.structure._id).subscribe(
      result => {
        this.loading = false;
        if (!result.structure) {
          if (result.message && result.message !== '') { this.showMessage(result.message, 'info', true); }
        } else {
            this.activeModal.close();
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public isValid() : boolean {

    let valid = true;

    if(this.structure.child._id === this.structure.parent._id){
      this.showMessage("Un producto no puede ser estructura de si mismo.", "info", true);
      valid = false;
    }

    if(this.structure.quantity === 0 || this.structure.quantity < 0 || this.structure.quantity === null){
      this.showMessage("La cantidad tiene que ser mayor a 0.", "info", true);
      valid = false;
    }
    
    return valid;
  }

  private getArticles(query): Promise<Article[]> {

    return new Promise((resolve, reject) => {
      
      this._articleService.getArticles(query).subscribe(
          result => {
            if (!result.articles) {
              resolve(null);
            } else {
              resolve(result.articles);
            }
          },
          error => {
            resolve(null);
          }
        );
    });
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