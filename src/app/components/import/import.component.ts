import { Component, OnInit, EventEmitter, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
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

  public filePath: string = ''; //Ruta de archivo a importar
  public modelToImport: Array<String>; //El arreglo donde se guardarán la ruta, el modelo, y las propiedades a importar
  @Input() model: Array<String>; //Recibimos el objeto a importar, con su clave primaria
  @Input() transaction : string;
  public properties: Array<String>; //Donde guardaremos las propiedades del objeto a importar
  public newProperties: Array<String>; //Donde guardaremos las propiedades del objeto a importar modificando las propiedades delas relaciones
  public importForm: FormGroup;
  public alertMessage: string = '';
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public filesToUpload: Array <File>;

  public formErrors = {
    'filePath': ''
  };

  public validationMessages = {
    'filePath': {
      'required':       'Este campo es requerido.',
    }
  };

  constructor(
    public _importService: ImportService,
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
  ) { }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.properties = Object.keys(this.model);
    this.modelToImport = new Array();
    this.newProperties = new Array();
    this.buildForm();
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {

    this.importForm = this._fb.group({
      'filePath': [this.filePath, [
          Validators.required,
        ]
      ]
    });

    for(let property of this.properties) {

      let newProperty = property.toString();

      if (property !== "model" && property !== "primaryKey" && property !== "relations") {
        this.importForm.addControl(newProperty, new FormControl(''));
        this.newProperties[newProperty] = newProperty;
      } else if (property !== "relations") {
        this.importForm.addControl(newProperty, new FormControl(this.model[newProperty]));
      }
    }

    if (this.model["relations"]) {
      for (let relation of this.model["relations"]) {

        let property = relation.toString();

        this.importForm.addControl(property, new FormControl(''));


        let newProperty = property.split('_');
        this.properties.push(newProperty[0]);
        this.newProperties[newProperty[0]] = property;
      }
    }

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

    if(!this.transaction) {
      this.loading = true;
      this.modelToImport = this.importForm.value;
      this._importService.import(this.modelToImport).subscribe(
        result => {
          if (result.message) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          } else {
            var message = '';
            if (result.records === 0) {
              message = "No se encontraron registros para importar.";
            } else if (result.records === 1) {
              message = "Se procesó " + result.records + " registro.";
              if (result.recordSaved === 1) {
                message += "Se creó " + result.recordSaved + " nuevo registro.";
              } else if (result.recordSaved > 1) {
                message += "Se crearon " + result.recordSaved + " nuevos registros.";
              }
              if (result.recordUpdated === 1) {
                message += "Se actualizó " + result.recordUpdated + " registro.";
              } else if (result.recordUpdated > 1) {
                message += "Se actualizaron " + result.recordUpdated + " registros.";
              }
            } else {
              this.showMessage("Se han importado con éxito " + result.records + " registros.", 'success', true);
              message = "Se procesó " + result.records + " registro.";
              if (result.recordSaved === 1) {
                message += "Se creó " + result.recordSaved + " nuevo registro.";
              } else if (result.recordSaved > 1) {
                message += "Se crearon " + result.recordSaved + " nuevos registros.";
              }
              if (result.recordUpdated === 1) {
                message += "Se actualizó " + result.recordUpdated + " registro.";
              } else if (result.recordUpdated > 1) {
                message += "Se actualizaron " + result.recordUpdated + " registros.";
              }
            }
            this.showMessage(message, 'success', true);
            this.activeModal.close({ message: "ok" });
          }
          this.loading = false;
        },
        error => {
          this.showMessage(error._body, 'danger', true);
          this.loading = false;
        }
      );
    } else {
      this.loading = true;
      this.modelToImport = this.importForm.value;
      this._importService.importMovement(this.modelToImport, this.transaction).subscribe(
          result => {
            if (result.message) {
              if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            } else {
              var message = '';
              if (result.records === 0) {
                message = "No se encontraron registros para importar.";
              } else if (result.records === 1) {
                message = "Se procesó " + result.records + " registro.";
                if (result.recordSaved === 1) {
                  message += "Se creó " + result.recordSaved + " nuevo registro.";
                } else if (result.recordSaved > 1) {
                  message += "Se crearon " + result.recordSaved + " nuevos registros.";
                }
                if (result.recordUpdated === 1) {
                  message += "Se actualizó " + result.recordUpdated + " registro.";
                } else if (result.recordUpdated > 1) {
                  message += "Se actualizaron " + result.recordUpdated + " registros.";
                }
              } else {
                this.showMessage("Se han importado con éxito " + result.records + " registros.", 'success', true);
                message = "Se procesó " + result.records + " registro.";
                if (result.recordSaved === 1) {
                  message += "Se creó " + result.recordSaved + " nuevo registro.";
                } else if (result.recordSaved > 1) {
                  message += "Se crearon " + result.recordSaved + " nuevos registros.";
                }
                if (result.recordUpdated === 1) {
                  message += "Se actualizó " + result.recordUpdated + " registro.";
                } else if (result.recordUpdated > 1) {
                  message += "Se actualizaron " + result.recordUpdated + " registros.";
                }
              }
              this.showMessage(message, 'success', true);
            }
            this.loading = false;
          },
          error => {
            this.showMessage(error._body, 'danger', true);
            this.loading = false;
          }
        );
      }

    
  }

  public handleFileInput(files: File) {
    
    console.log(files);
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
