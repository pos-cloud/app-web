import { Component, OnInit, EventEmitter, Input, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import * as moment from 'moment';
import 'moment/locale/es';
import { ApplicationService } from '../application.service';
import { Application, Type } from '../application.model';
import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { CapitalizePipe } from 'app/main/pipes/capitalize';
import { ToastrService } from 'ngx-toastr';
import { TranslateMePipe } from 'app/main/pipes/translate-me';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-application',
  templateUrl: './application.component.html',
  styleUrls: ['./application.component.scss'],
  providers: [
    NgbAlertConfig,
    TranslateMePipe,
    ApplicationService
  ],
  encapsulation: ViewEncapsulation.None
})
export class ApplicationComponent implements OnInit {

  @Input() objId: string;
  @Input() readonly: boolean;
  @Input() operation: string;
  public obj: Application;
  public objForm: FormGroup;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public title: string = 'training';
  private subscription: Subscription = new Subscription();
  private capitalizePipe: CapitalizePipe = new CapitalizePipe();
  public orientation: string = 'horizontal';
  public types: Type[] = [Type.Web, Type.App];

  public formErrors = {
    'order': '',
    'name': '',
    'url': '',
    'type': ''
  };

  public validationMessages = {
    'order': { 'required': 'Este campo es requerido.' },
    'name': { 'required': 'Este campo es requerido.' },
    'type': { 'required': 'Este campo es requerido.' },
    'url': { 'required': 'Este campo es requerido.' }
  };

  constructor(
    private _objService: ApplicationService,
    private _toastr: ToastrService,
    private _title: Title,
    public _fb: FormBuilder,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    private translatePipe: TranslateMePipe
  ) {
    if (window.screen.width < 1000) this.orientation = 'vertical';
    this.obj = new Application();
  }

  public async ngOnInit() {
    this.title = this.translatePipe.transform(this.operation) + " " + this.translatePipe.transform(this.title);
    this.title = this.capitalizePipe.transform(this.title);
    this._title.setTitle(this.title);
    this.buildForm();
    if (this.objId && this.objId !== '') {
      this.subscription.add(this._objService.getById(this.objId).subscribe(
        result => {
          this.loading = false;
          if (result.application) { this.obj = result.application; this.setValuesForm(); }
          else (result.error) ? this.showToast(result.error.message, 'info') : this.showToast(result.message, 'info');
        },
        error => { this.loading = false; this.showToast(error.error, 'danger') }
      ));
    } else {
      if (this.operation !== 'add') this.showToast('Debe ingresar un identificador válido', 'danger')
    }
  }

  public ngAfterViewInit(): void {
    this.focusEvent.emit(true);
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public buildForm(): void {

    this.objForm = this._fb.group({
      '_id': [this.obj._id, []],
      'order': [this.obj.order, [Validators.required]],
      'name': [this.obj.name, [Validators.required]],
      'url': [this.obj.url, [Validators.required]],
      'type': [this.obj.type, []]
    });

    this.objForm.valueChanges.subscribe(data => this.onValueChanged(data));
    this.onValueChanged();
  }

  public onValueChanged(data?: any): void {
    if (!this.objForm) { return; }
    const form = this.objForm;
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

  public setValuesForm(): void {
    if (!this.obj._id) { this.obj._id = ''; }
    if (this.obj.order === undefined) { this.obj.order = 0; }
    if (!this.obj.name) { this.obj.name = ''; }
    if (!this.obj.url) { this.obj.url = '0'; }
    if (!this.obj.type) { this.obj.type = null; }
    const values = {
      '_id': this.obj._id,
      'order': this.obj.order,
      'name': this.obj.name,
      'url': this.obj.url,
      'type': this.obj.type,
    };
    this.objForm.patchValue(values);
  }

  public async addObj() {

    let isValid: boolean = true;

    this.obj = this.objForm.value;

    if (isValid) {
      switch (this.operation) {
        case 'add':
          this.saveObj();
          break;
        case 'update':
          this.updateObj();
          break;
      }
    }
  }

  public saveObj() {
    this.obj.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
    this.obj.operationType = 'C';
    this.loading = true;
    this.subscription.add(
      this._objService.save(this.obj).subscribe(
        result => {
          this.loading = false;
          if (result.application) { this.showToast(result.message); this.activeModal.close({ obj: this.obj }); }
          else this.showToast(result.error.message, 'info');
        },
        err => { this.loading = false; this.showToast(err.error.message, 'danger') }
      )
    );
  }

  public updateObj() {
    this.obj.updateDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
    this.obj.operationType = 'U';
    this.loading = true;
    this.subscription.add(
      this._objService.update(this.obj).subscribe(
        result => {
          this.loading = false;
          if (result.application) { this.showToast(result.message); this.activeModal.close({ obj: this.obj }); }
          else this.showToast(result.error.message, 'info');
        },
        err => { this.loading = false; console.log(err); this.showToast(err, 'danger') }
      )
    );
  }

  public showToast(message: string, type: string = 'success'): void {
    switch (type) {
      case 'success':
        this._toastr.success('', this.translatePipe.translateMe(message));
        break;
      case 'info':
        this._toastr.info('', this.translatePipe.translateMe(message));
        break;
      case 'warning':
        this._toastr.warning('', this.translatePipe.translateMe(message));
        break;
      case 'danger':
        this._toastr.error('', this.translatePipe.translateMe(message));
        break;
      default:
        this._toastr.success('', this.translatePipe.translateMe(message));
        break;
    }
  }
}


