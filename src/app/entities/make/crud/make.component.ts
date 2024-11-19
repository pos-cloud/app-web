import { Component, EventEmitter, OnInit } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import { Make } from '../make.model';

import { TranslateMePipe } from 'app/core/pipes/translate-me';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { Subscription } from 'rxjs';
import { MakeService } from '../make.service';

@Component({
  selector: 'app-make',
  templateUrl: './make.component.html',
  providers: [TranslateMePipe],
})
export class MakeComponent implements OnInit {
  public makeId: string;
  public operation: string;
  public readonly: boolean;
  public make: Make;
  public makeForm: UntypedFormGroup;
  public alertMessage: string = '';
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  private subscription: Subscription = new Subscription();
  public formErrors = {
    description: '',
  };

  public validationMessages = {
    description: {
      required: 'Este campo es requerido.',
    },
  };
  public pathUrl: string[];

  constructor(
    public _makeService: MakeService,
    public _fb: UntypedFormBuilder,
    public _router: Router,
    public translatePipe: TranslateMePipe,
    private _toastService: ToastService,
  ) {
    this.make = new Make();
  }

  async ngOnInit() {
    this.buildForm();

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.pathUrl = this._router.url.split('/');
    this.operation = this.pathUrl[3];
    this.makeId = this.pathUrl[4];
    if (this.pathUrl[3] === 'view') {
      this.readonly = true;
    }
    if (this.makeId) {
      this.getMake();
    }
  }

  public getMake(): void {
    this._makeService.getById(this.makeId).subscribe(
      (result) => {
        if (!result.result) {
          this._toastService.showToast(result)
        } else {
          this.make = result.result;
          this.setValueForm();
        }
        this.loading = false;
      },
      (error) => {
        this._toastService.showToast(error)
        this.loading = false;
      }
    );
  }

  public setValueForm(): void {
    this.makeForm.patchValue({
      _id: this.make._id ?? '',
      description: this.make.description ?? null,
      visibleSale: this.make.visibleSale ?? false,
    });
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {
    this.makeForm = this._fb.group({
      _id: [this.make._id, []],
      description: [this.make.description, [Validators.required]],
      visibleSale: [this.make.visibleSale, []],
    });
  }

  onValueChanged(fieldID?: any): void {
    if (!this.makeForm) {
      return;
    }
    const form = this.makeForm;

    if (!fieldID || typeof fieldID === 'string') {
      for (const field in this.formErrors) {
        if (!fieldID || field === fieldID) {
          this.formErrors[field] = '';
          const control = form.get(field);

          if (control && !control.valid) {
            for (const key in control.errors) {
              if (
                this.validationMessages[field][key] &&
                this.validationMessages[field][key] != 'undefined'
              ) {
                this.formErrors[field] +=
                  this.validationMessages[field][key] + ' ';
              }
            }
          }
        }
      }
    }
  }

  retrunTo() {
    return this._router.navigate(['/entities/makes']);
  }

  public addMake(): void {
    this.loading = true;
    this.make = this.makeForm.value;
    if (this.makeForm.valid) {
      switch (this.operation) {
        case 'add':
          this.saveMake();
          break;
        case 'update':
          this.updateMake();
          break;
        case 'delete':
          this.deleteObj();
        default:
          break;
      }
    } else {
      this._toastService.showToast({
        message: 'Por favor, revisa los campos en rojo para continuar.',
      })
      this.onValueChanged();
    }
  }

  public saveMake(): void {
    this.loading = true;

    this._makeService.save(this.make).subscribe(
      (result) => {
        if (!result.result) {
          this._toastService.showToast(result)
          this.loading = false;
        } else {
          this.make = result.result;
         
            this.make = new Make();
            this._toastService.showToast(result)
            this.buildForm();
            return this.retrunTo();
          
        }
        this.loading = false;
      },
      (error) => {
        this._toastService.showToast(error)
        this.loading = false;
      }
    );
  }

  public updateMake(): void {
    this.loading = true;

    this._makeService.update(this.make).subscribe(
      (result) => {
        if (!result.result) {
          this._toastService.showToast(result)
          this.loading = false;
        } else {
          this.make = result.result; 
          this._toastService.showToast(result)
            return this.retrunTo();
      
        }
        this.loading = false;
      },
      (error) => {
        this._toastService.showToast(error)
        this.loading = false;
      }
    );
  }

  public deleteObj() {
    this.loading = true;
    this.subscription.add(
      this._makeService.delete(this.make._id).subscribe(
        async (result) => {
          this._toastService.showToast(result);
          if (result.status === 200) {
            return this.retrunTo();
          }
        },
        (error) => this._toastService.showToast(error)
      )
    );
  }
}
