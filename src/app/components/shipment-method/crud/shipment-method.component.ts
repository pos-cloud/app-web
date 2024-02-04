import {Component, OnInit, EventEmitter, Input} from '@angular/core';
import {UntypedFormGroup, UntypedFormBuilder, Validators, UntypedFormControl, UntypedFormArray} from '@angular/forms';
import 'moment/locale/es';

import {Title} from '@angular/platform-browser';
import {NgbAlertConfig, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {TranslatePipe} from '@ngx-translate/core';
import {Application} from 'app/components/application/application.model';
import {ApplicationService} from 'app/components/application/application.service';
import {Article} from 'app/components/article/article';
import {ArticleService} from 'app/components/article/article.service';
import {CapitalizePipe} from 'app/main/pipes/capitalize';
import {TranslateMePipe} from 'app/main/pipes/translate-me';
import {FormField} from 'app/util/formField.interface';
import Resulteable from 'app/util/Resulteable';
import * as moment from 'moment';
import {ToastrService} from 'ngx-toastr';
import {Subscription, Subject, Observable, merge} from 'rxjs';
import {debounceTime, distinctUntilChanged, switchMap, tap} from 'rxjs/operators';

import {ShipmentMethod, ZoneType} from '../shipment-method.model';
import {ShipmentMethodService} from '../shipment-method.service';
declare const google: any;

@Component({
  selector: 'app-shipment-method',
  templateUrl: './shipment-method.component.html',
  styleUrls: ['./shipment-method.component.scss'],
  providers: [NgbAlertConfig, TranslateMePipe, TranslatePipe],
})
export class ShipmentMethodComponent implements OnInit {
  @Input() objId: string;
  @Input() readonly: boolean;
  @Input() operation: string;
  public obj: ShipmentMethod;
  public objForm: UntypedFormGroup;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public title: string = 'shipment-method';
  private subscription: Subscription = new Subscription();
  private capitalizePipe: CapitalizePipe = new CapitalizePipe();
  public focus$: Subject<string>[] = new Array();
  public stateId: number;
  public filesToUpload: Array<File>;
  public selectedFile: File = null;
  public filename: string;
  public src: any;
  public imageURL: string;
  public applications: Application[];

  public searchArticles = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
    const inputFocus$ = this.focus$['article'];

    return merge(debouncedText$, inputFocus$).pipe(
      tap(() => (this.loading = true)),
      switchMap(async (term) => {
        let match: {} =
          term && term !== '' ? {description: {$regex: term, $options: 'i'}} : {};

        match['operationType'] = {$ne: 'D'};
        match['type'] = 'Final';

        return await this.getArticles(match).then((result) => {
          return result;
        });
      }),
      tap(() => (this.loading = false)),
    );
  };

  public formatterArticles = (x: {description: string}) => x.description;

  public formFields: FormField[] = [
    {
      name: 'name',
      tag: 'input',
      tagType: 'text',
      validators: [Validators.required],
      focus: true,
      class: 'form-group col-md-12',
    },
    {
      name: 'requireAddress',
      tag: 'select',
      tagType: 'boolean',
      values: ['true', 'false'],
      class: 'form-group col-md-12',
    },
    {
      name: 'requireTable',
      tag: 'select',
      tagType: 'boolean',
      values: ['true', 'false'],
      class: 'form-group col-md-12',
    },
    {
      name: 'article',
      tag: 'autocomplete',
      tagType: 'text',
      search: this.searchArticles,
      format: this.formatterArticles,
      values: null,
      focus: false,
      class: 'form-group col-md-12',
    },
  ];
  public formErrors: {} = {};
  public validationMessages = {
    required: 'Este campo es requerido.',
  };

  constructor(
    private _objService: ShipmentMethodService,
    private _articleService: ArticleService,
    private _toastr: ToastrService,
    private _title: Title,
    public _fb: UntypedFormBuilder,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public translatePipe: TranslateMePipe,
    private _applicationService: ApplicationService,
  ) {
    this.obj = new ShipmentMethod();
    for (let field of this.formFields) {
      this.formErrors[field.name] = '';
      if (field.tag === 'autocomplete') {
        this.focus$[field.name] = new Subject<string>();
      }
    }
  }

  public async ngOnInit() {
    this.title =
      this.translatePipe.transform(this.operation) +
      ' ' +
      this.translatePipe.transform(this.title);
    this.title = this.capitalizePipe.transform(this.title);
    this._title.setTitle(this.title);
    this.buildForm();
    if (this.objId && this.objId !== '') {
      this.subscription.add(
        await this._objService
          .getAll({
            project: {
              name: 1,
              'applications._id': 1,
              'applications.name': 1,
              'article._id': 1,
              'article.description': 1,
              requireTable: 1,
              requireAddress: 1,
              zones: 1,
            },
            match: {_id: {$oid: this.objId}},
          })
          .subscribe(
            (result) => {
              this.loading = false;
              if (result.status === 200) {
                this.obj = result.result[0];
                this.setValuesForm();
              } else this.showToast(result);
            },
            (error) => this.showToast(error),
          ),
      );
    } else {
      if (this.operation !== 'add')
        this.showToast(null, 'danger', 'Debe ingresar un identificador válido');
    }
    await this.getAllApplications({})
      .then((result: Application[]) => {
        this.applications = result;
        this.setValuesForm();
      })
      .catch((error: Resulteable) => this.showToast(error));
  }

  public ngAfterViewInit(): void {
    this.focusEvent.emit(true);
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public buildForm(): void {
    let fields: {} = {
      _id: [this.obj._id],
      applications: this._fb.array([]),
    };

    for (let field of this.formFields) {
      fields[field.name] = [this.obj[field.name], field.validators];
    }
    this.objForm = this._fb.group(fields);

    this.objForm.valueChanges.subscribe((data) => this.onValueChanged(data));
    this.focusEvent.emit(true);
  }

  public onValueChanged(fieldID?: any): void {
    if (!this.objForm) {
      return;
    }
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

  public validateAutocomplete(c: UntypedFormControl) {
    let result =
      c.value && Object.keys(c.value)[0] === '0'
        ? {
            validateAutocomplete: {
              valid: false,
            },
          }
        : null;

    return result;
  }

  public setValuesForm(): void {
    let values: {} = {
      _id: this.obj._id,
    };

    for (let field of this.formFields) {
      switch (field.tagType) {
        case 'date':
          values[field.name] =
            this.obj[field.name] !== undefined
              ? moment(this.obj[field.name]).format('YYYY-MM-DD')
              : null;
          break;
        default:
          values[field.name] =
            this.obj[field.name] !== undefined ? this.obj[field.name] : null;
          break;
      }
    }
    if (this.applications && this.applications.length > 0) {
      this.applications.forEach((x) => {
        let exists: boolean = false;

        if (this.obj && this.obj.applications && this.obj.applications.length > 0) {
          this.obj.applications.forEach((y) => {
            if (x._id === y._id) {
              exists = true;
              const control = new UntypedFormControl(y);

              (this.objForm.controls.applications as UntypedFormArray).push(control);
            }
          });
        }
        if (!exists) {
          const control = new UntypedFormControl(false);

          (this.objForm.controls.applications as UntypedFormArray).push(control);
        }
      });
    }
    this.objForm.patchValue(values);
  }

  public getAllApplications(match: {}): Promise<Application[]> {
    return new Promise<Application[]>((resolve, reject) => {
      this.subscription.add(
        this._applicationService
          .getAll({
            match,
            sort: {name: 1},
          })
          .subscribe(
            (result) => {
              this.loading = false;
              result.status === 200 ? resolve(result.result) : reject(result);
            },
            (error) => reject(error),
          ),
      );
    });
  }

  public async addObj() {
    let isValid: boolean = true;

    isValid = this.operation === 'delete' ? true : this.objForm.valid;

    if (isValid) {
      this.obj = Object.assign(this.obj, this.objForm.value);
      const selectedOrderIds = this.objForm.value.applications
        .map((v, i) => (v ? this.applications[i] : null))
        .filter((v) => v !== null);

      this.obj.applications = selectedOrderIds;
    } else {
      this.onValueChanged();
    }

    if (isValid) {
      for (let field of this.formFields) {
        switch (field.tagType) {
          case 'date':
            this.obj[field.name] =
              moment(this.obj[field.name]).format('YYYY-MM-DD') +
              moment().format('THH:mm:ssZ');
            break;
          case 'number':
            this.obj[field.name] = parseFloat(this.obj[field.name]);
            break;
          case 'boolean':
            this.obj[field.name] =
              this.obj[field.name] == 'true' || this.obj[field.name] == true;
            break;
          case 'text':
            if (
              field.tag === 'autocomplete' &&
              (this.obj[field.name] == '' ||
                (this.obj[field.name] && !this.obj[field.name]['_id']))
            ) {
              this.obj[field.name] = null;
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

  public saveObj() {
    this.loading = true;
    this.subscription.add(
      this._objService.save(this.obj).subscribe(
        (result) => {
          this.showToast(result);
          if (result.status === 200) this.activeModal.close({obj: this.obj});
        },
        (error) => this.showToast(error),
      ),
    );
  }

  public updateObj() {
    this.loading = true;
    this.subscription.add(
      this._objService.update(this.obj).subscribe(
        (result) => {
          this.showToast(result);
          if (result.status === 200) this.activeModal.close({obj: this.obj});
        },
        (error) => this.showToast(error),
      ),
    );
  }

  public deleteObj() {
    this.loading = true;
    this.subscription.add(
      this._objService.delete(this.obj._id).subscribe(
        async (result) => {
          this.showToast(result);
          if (result.status === 200) this.activeModal.close({obj: this.obj});
        },
        (error) => this.showToast(error),
      ),
    );
  }

  public showToast(result, type?: string, title?: string, message?: string): void {
    if (result) {
      if (result.status === 200) {
        type = 'success';
        title = result.message;
      } else if (result.status >= 400) {
        type = 'danger';
        title =
          result.error && result.error.message ? result.error.message : result.message;
      } else {
        type = 'info';
        title = result.message;
      }
    }
    switch (type) {
      case 'success':
        this._toastr.success(
          this.translatePipe.translateMe(message),
          this.translatePipe.translateMe(title),
        );
        break;
      case 'danger':
        this._toastr.error(
          this.translatePipe.translateMe(message),
          this.translatePipe.translateMe(title),
        );
        break;
      default:
        this._toastr.info(
          this.translatePipe.translateMe(message),
          this.translatePipe.translateMe(title),
        );
        break;
    }
    this.loading = false;
  }


  public getArticles(match: {}): Promise<Article[]> {
    return new Promise<Article[]>((resolve, reject) => {
      this.subscription.add(
        this._articleService
          .getAll({
            project: {
              name: '$description',
              description: 1,
              type: 1,
              operationType: 1,
            },
            match,
            sort: {description: 1},
            limit: 10,
          })
          .subscribe(
            (result) => {
              this.loading = false;
              result.status === 200 ? resolve(result.result) : reject(result);
            },
            (error) => reject(error),
          ),
      );
    });
  }
}
