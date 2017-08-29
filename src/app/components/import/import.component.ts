import { Component, OnInit, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { ImportService } from './../../services/import.service';

@Component({
  selector: 'add-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.css'],
  providers: [NgbAlertConfig]
})

export class ImportComponent  implements OnInit {

  public objectToImport: Array<String>;
  public filePath: string = '';
  public model: string = '';
  public importForm: FormGroup;
  public alertMessage: string = "";
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public filesToUpload: Array <File>;

  public formErrors = {
    'filePath': '',
    'code': '',
    'description': '',
    'salePrice': 0.00,
  };

  public validationMessages = {
    'filePath': {
      'required':       'Este campo es requerido.',
    },
    'code': {
      'required':       'Este campo es requerido.',
    },
    'description': {
      'required':       'Este campo es requerido.'
    },
    'salePrice': {
      'required':       'Este campo es requerido.'
    },
  };

  constructor(
    public _importService: ImportService,
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
  ) { 
    alertConfig.type = 'danger';
    alertConfig.dismissible = true;
  }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.objectToImport = new Array();
    this.model = 'article';
    this.buildForm();
    this.importForm.setValue({
      "filePath":'c:\\temp\\articulos.xlsx',
      "code":"code",
      "description":"desc",
      "salePrice":"precio",
      "observation":"",
      "make_relation_description":"marca",
      "category_relation_description":"rubro",
      "barcode":""
    });
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {

    this.importForm = this._fb.group({
      'filePath': [this.filePath, [
          Validators.required,
        ]
      ],
      'code': [this.objectToImport['code'], [
          Validators.required,
        ]
      ],
      'make_relation_description': [this.objectToImport['make_relation_description'], [
        ]
      ],
      'description': [this.objectToImport['description'], [
          Validators.required
        ]
      ],
      'salePrice': [this.objectToImport['salePrice'], [
          Validators.required
        ]
      ],
      'category_relation_description': [this.objectToImport['category'], [
        ]
      ],
      'observation': [this.objectToImport['observation'], [
        ]
      ],
      'barcode': [this.objectToImport['barcode'], [
        ]
      ]
    });

    this.importForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
    this.focusEvent.emit(true);
  }

  public onValueChanged(data?: any): void {

    if (!this.importForm) { return; }
    const form = this.importForm;

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

  public import(): void {
    
    this.loading = true;
    this.objectToImport = this.importForm.value;
    this.objectToImport['model'] = 'article';
    this._importService.import(this.objectToImport).subscribe(
      result => {
        if (result.message !== 'ok') {
          this.showMessage(result.message, "info", true); 
          this.loading = false;
        } else {
          this.showMessage("Se ha importado con éxito.", "success", false);
          this.activeModal.close("import_close");
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

  public hideMessage():void {
    this.alertMessage = "";
  }
}