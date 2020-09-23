import { Component, OnInit, EventEmitter, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import * as moment from 'moment';
import 'moment/locale/es';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Application, ApplicationType } from '../application.model';
import { ApplicationService } from '../application.service';
import { ToastrService } from 'ngx-toastr';
import { Title } from '@angular/platform-browser';
import { CapitalizePipe } from 'app/main/pipes/capitalize';
import { Subscription, Subject } from 'rxjs';
import { TranslateMePipe } from 'app/main/pipes/translate-me';
import { TranslatePipe } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { FormField } from 'app/util/formField.interface';
import * as $ from 'jquery';
import { Config } from 'app/app.config';

@Component({
  selector: 'app-application',
  templateUrl: './application.component.html',
  styleUrls: ['./application.component.scss'],
  providers: [NgbAlertConfig, TranslateMePipe, TranslatePipe],
  encapsulation: ViewEncapsulation.None
})

export class ApplicationComponent implements OnInit {

  public objId: string;
  public readonly: boolean;
  public operation: string;
  public obj: Application;
  public objForm: FormGroup;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public title: string = 'application';
  private subscription: Subscription = new Subscription();
  private capitalizePipe: CapitalizePipe = new CapitalizePipe();
  public focus$: Subject<string>[] = new Array();
  public stateId: number;
  public filesToUpload: any[] = new Array();
  public filename: any[] = new Array();
  public typeFile: any[] = new Array();
  public oldFiles: any[];
  public apiURL: string = Config.apiV8URL;
  public database: string = Config.database;

  public formFields: FormField[] = [{
    name: 'Datos de la aplicación',
    tag: 'separator',
    tagType: null,
    class: 'form-group col-md-12'
  }, {
    name: 'order',
    tag: 'input',
    tagType: 'number',
    validators: [Validators.required],
    focus: true,
    class: 'form-group col-md-2'
  }, {
    name: 'type',
    tag: 'select',
    tagType: 'text',
    values: [ApplicationType.Web, ApplicationType.App],
    validators: [Validators.required],
    class: 'form-group col-md-2'
  }, {
    name: 'name',
    tag: 'input',
    tagType: 'text',
    validators: [Validators.required],
    class: 'form-group col-md-4'
  }, {
    name: 'url',
    tag: 'input',
    tagType: 'text',
    validators: [Validators.required],
    class: 'form-group col-md-4'
  }, {
    name: 'Datos de contacto',
    tag: 'separator',
    tagType: null,
    class: 'form-group col-md-12'
  }, {
    name: 'contact.phone',
    tag: 'input',
    tagType: 'number',
    class: 'form-group col-md-4'
  }, {
    name: 'contact.whatsapp',
    tag: 'input',
    tagType: 'number',
    class: 'form-group col-md-4'
  }, {
    name: 'contact.claim',
    tag: 'input',
    tagType: 'number',
    class: 'form-group col-md-4'
  }, {
    name: 'Redes sociales',
    tag: 'separator',
    tagType: null,
    class: 'form-group col-md-12'
  }, {
    name: 'socialNetworks.facebook',
    tag: 'input',
    tagType: 'text',
    class: 'form-group col-md-4'
  }, {
    name: 'socialNetworks.instagram',
    tag: 'input',
    tagType: 'text',
    class: 'form-group col-md-4'
  }, {
    name: 'socialNetworks.twitter',
    tag: 'input',
    tagType: 'text',
    class: 'form-group col-md-4'
  }, {
    name: 'Diseño',
    tag: 'separator',
    tagType: null,
    class: 'form-group col-md-12'
  }, {
    name: 'design.resources.logo',
    tag: 'input',
    tagType: 'file',
    search: null,
    format: 'image',
    class: 'form-group col-md-12'
  }, {
    name: 'design.categoryTitle',
    tag: 'input',
    tagType: 'text',
    default: 'Categorías',
    class: 'form-group col-md-6'
  }, {
    name: 'design.categoriesByLine',
    tag: 'select',
    tagType: null,
    values: ['1', '2', '3', '4'],
    default: '3',
    class: 'form-group col-md-6'
  }, {
    name: 'design.showSearchBar',
    tag: 'select',
    tagType: null,
    values: ['true', 'false'],
    default: 'true',
    class: 'form-group col-md-12'
  }, {
    name: 'design.resources.banners',
    tag: 'input',
    tagType: 'file',
    search: null,
    format: 'image',
    multiple: true,
    class: 'form-group col-md-12'
  }, {
    name: 'design.about',
    tag: 'html',
    tagType: null,
    class: 'form-group col-md-12'
  }, {
    name: 'Avisos',
    tag: 'separator',
    tagType: null,
    class: 'form-group col-md-12'
  }, {
    name: 'notifications.app.checkout',
    tag: 'input',
    tagType: 'text',
    default: 'Le notificaremos todos los detalles por correo electrónico. ¡Muchas Gracias por su compra!',
    multiple: true,
    class: 'form-group col-md-12'
  }, {
    name: 'Autentificación',
    tag: 'separator',
    tagType: null,
    class: 'form-group col-md-12'
  }, {
    name: 'auth.requireOPT',
    tag: 'select',
    tagType: null,
    values: ['true', 'false'],
    class: 'form-group col-md-12'
  }];
  public formErrors: {} = {};
  public validationMessages = {
    'required': 'Este campo es requerido.',
  };

  public tinyMCEConfigBody = {
    selector: "textarea",
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
    height: 150,
    file_picker_types: 'file image media',
    images_dataimg_filter: function (img) {
      return img.hasAttribute('internal-blob');
    },
    file_picker_callback: function (callback, value, meta) {
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
    },
  }

  constructor(
    private _objService: ApplicationService,
    private _toastr: ToastrService,
    private _title: Title,
    public _fb: FormBuilder,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public translatePipe: TranslateMePipe,
    private _router: Router,
  ) {
    this.obj = new Application();
    for (let field of this.formFields) {
      if (field.tag !== 'separator') {
        this.formErrors[field.name] = '';
        if (field.tag === 'autocomplete') {
          this.focus$[field.name] = new Subject<string>();
        }
        if (field.default) {
          this.obj[field.name] = field.default;
        }
      }
    }
  }

  public async ngOnInit() {
    let pathUrl: string[] = this._router.url.split('/');
    this.operation = pathUrl[2];
    if (this.operation !== 'add' && this.operation !== 'update') this.readonly = false;
    this.title = this.translatePipe.transform(this.operation) + " " + this.translatePipe.transform(this.title);
    this.title = this.capitalizePipe.transform(this.title);
    this._title.setTitle(this.title);
    this.buildForm();
    this.objId = pathUrl[3];
    if (this.objId && this.objId !== '') {
      this.subscription.add(this._objService.getById(this.objId).subscribe(
        result => {
          this.loading = false;
          if (result.status === 200) {
            this.obj = result.result;
            this.setValuesForm();
          }
          else this.showToast(result);
        },
        error => this.showToast(error)
      ));
    }
  }

  public ngAfterViewInit(): void {
    this.focusEvent.emit(true);
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public getFiles(fieldName) {
    return eval('this.obj?.' + fieldName.split('.').join('?.'));
  }

  public onFileSelected(event, model: string) {
    this.filesToUpload[model] = event.target.files;
    this.filename[model] = '';
    let i: number = 0;
    for (let file of this.filesToUpload[model]) {
      if (i != 0) this.filename[model] += ', ';
      this.filename[model] += file.name;
      i++;
    }
    this.typeFile[model] = this.filesToUpload[model][0].type.split("/")[0];
  }

  public buildForm(): void {

    let fields: {} = {
      _id: [this.obj._id]
    };
    for (let field of this.formFields) {
      if (field.tag !== 'separator') fields[field.name] = [this.obj[field.name], field.validators]
    }
    this.objForm = this._fb.group(fields);
    this.objForm.valueChanges
      .subscribe(data => this.onValueChanged(data));
    this.focusEvent.emit(true);
  }

  public onValueChanged(fieldID?: any): void {
    if (!this.objForm) { return; }
    const form = this.objForm;
    for (const field in this.formErrors) {
      if (!fieldID || field === fieldID) {
        this.formErrors[field] = '';
        const control = form.get(field);
        if (control && !control.valid) {
          const messages = this.validationMessages;
          for (const key in control.errors) {
            this.formErrors[field] += messages[key] + ' ';
          }
        }
      }
    }
  }

  public validateAutocomplete(c: FormControl) {
    let result = (c.value && Object.keys(c.value)[0] === '0') ? {
      validateAutocomplete: {
        valid: false
      }
    } : null;
    return result;
  }

  public setValuesForm(): void {
    let values: {} = {
      _id: this.obj._id
    }
    for (let field of this.formFields) {
      if (field.tag !== 'separator') {
        if (field.name.split('.').length > 1) {
          let sumF: string = '';
          let entro: boolean = false;
          for (let f of field.name.split('.')) {
            sumF += `['${f}']`;
            if (eval(`this.obj${sumF}`) == null || eval(`this.obj${sumF}`) == undefined) {
              entro = true;
              eval(`this.obj${sumF} = {}`);
            }
          }
          if (entro) eval(`this.obj${sumF} = null`);
        }
        switch (field.tagType) {
          case 'date':
            values[field.name] = (eval("this.obj." + field.name) !== undefined) ? moment(eval("this.obj." + field.name)).format('YYYY-MM-DD') : null
            break;
          case 'file':
            if (!this.oldFiles || !this.oldFiles[field.name]) {
              this.oldFiles = new Array();
              this.oldFiles[field.name] = eval("this.obj?." + field.name);
            }
            break;
          default:
            if (field.tag !== 'separator') values[field.name] = (eval("this.obj." + field.name) !== undefined) ? eval("this.obj." + field.name) : null
            break;
        }
      }
    }
    this.objForm.patchValue(values);
  }

  public async addObj() {

    let isValid: boolean = true;

    isValid = (this.operation === 'delete') ? true : this.objForm.valid;

    if (isValid) {
      this.obj = this.objForm.value;
    } else {
      this.onValueChanged();
    }

    if (isValid) {
      for (let field of this.formFields) {
        switch (field.tagType) {
          case 'date':
            this.obj[field.name] = moment(this.obj[field.name]).format('YYYY-MM-DD') + moment().format('THH:mm:ssZ');
            break;
          case 'number':
            this.obj[field.name] = parseFloat(this.obj[field.name]);
            break;
          case 'file':
            if (this.filesToUpload && this.filesToUpload[field.name] && this.filesToUpload[field.name].length > 0) {
              this.loading = true;
              this._objService.deleteFile(this.typeFile[field.name], field.name.split('.')[field.name.split('.').length - 1], this.obj[field.name]);
              if (this.filesToUpload[field.name] && this.filesToUpload[field.name].length > 0) {
                this.obj[field.name] = this.oldFiles[field.name];
                if (field.multiple && (!this.obj || !this.obj[field.name] || this.obj[field.name].length === 0)) {
                  this.obj[field.name] = new Array();
                }
                for (let file of this.filesToUpload[field.name]) {
                  await this._objService.uploadFile(this.typeFile[field.name], field.name.split('.')[field.name.split('.').length - 1], file)
                    .then(result => {
                      this.loading = false;
                      if (result['result']) {
                        if (!field.multiple) {
                          this.obj[field.name] = result['result'];
                        } else {
                          this.obj[field.name].push(result['result']);
                        }
                      } else {
                        this.showToast(result['error'].message, 'info');
                        isValid = false;
                      }
                    })
                    .catch(error => { this.loading = false; isValid = false; this.showToast(error.message, 'danger'); });
                }
              }
              this.loading = false;
            } else {
              this.obj[field.name] = this.oldFiles[field.name];
            }
            break;
          default:
            break;
        }
      }
    }

    if (isValid) {
      switch (this.operation) {
        case 'add':
          this.saveObj();
          break;
        case 'update':
          this.updateObj();
          break;
        case 'delete':
          this.deleteObj();
          break;
      }
    }
  }

  public deleteFile(typeFile: string, fieldName: string, filename: string) {
    this._objService.deleteFile(typeFile, fieldName.split('.')[fieldName.split('.').length - 1], filename).subscribe(
      result => {
        if (result.status === 200) {
          try {
            eval('this.obj.' + fieldName + ' = this.obj.' + fieldName + '.filter(item => item !== filename)');
          } catch (error) {
            eval('this.obj.' + fieldName + ' = null');
          }
          this.loading = true;
          this.subscription.add(
            this._objService.update(this.obj).subscribe(
              result => {
                this.showToast(result);
                this.setValuesForm();
              },
              error => this.showToast(error)
            )
          );
        } else {
          this.showToast(result);
        }
      },
      error => this.showToast(error)
    )
  }

  public saveObj() {
    this.loading = true;
    this.subscription.add(
      this._objService.save(this.obj).subscribe(
        result => {
          this.showToast(result);
          if (result.status === 200) this._router.navigate(['/applications']);
        },
        error => this.showToast(error)
      )
    );
  }

  public updateObj() {
    this.loading = true;
    this.subscription.add(
      this._objService.update(this.obj).subscribe(
        result => {
          this.showToast(result);
          if (result.status === 200) this._router.navigate(['/applications']);
        },
        error => this.showToast(error)
      )
    );
  }

  public deleteObj() {
    this.loading = true;
    this.subscription.add(
      this._objService.delete(this.obj._id).subscribe(
        async result => {
          this.showToast(result);
          if (result.status === 200) {
            this._router.navigate(['/applications']);
          }
        },
        error => this.showToast(error)
      )
    );
  }

  public showToast(result, type?: string, title?: string, message?: string): void {
    if (result) {
      if (result.status === 200) {
        type = 'success';
        title = result.message;
      } else if (result.status >= 400) {
        type = 'danger';
        title = (result.error && result.error.message) ? result.error.message : result.message;
      } else {
        type = 'info';
        title = result.message;
      }
    }
    switch (type) {
      case 'success':
        this._toastr.success(this.translatePipe.translateMe(message), this.translatePipe.translateMe(title));
        break;
      case 'danger':
        this._toastr.error(this.translatePipe.translateMe(message), this.translatePipe.translateMe(title));
        break;
      default:
        this._toastr.info(this.translatePipe.translateMe(message), this.translatePipe.translateMe(title));
        break;
    }
    this.loading = false;
  }
}
