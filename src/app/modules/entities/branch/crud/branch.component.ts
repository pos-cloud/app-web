import { Component, EventEmitter, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Account, ApiResponse, Branch, Currency, IdentificationType, VATCondition } from '@types';
import { ToastService } from 'app/shared/components/toast/toast.service';

import { CommonModule } from '@angular/common';
import { BranchService } from '@core/services/branch.service';
import { ConfigService } from '@core/services/config.service';
import { IdentificationTypeService } from '@core/services/identification-type.service';
import { VATConditionService } from '@core/services/vat-condition.service';
import { TranslateModule } from '@ngx-translate/core';
import { TypeaheadDropdownComponent } from '@shared/components/typehead-dropdown/typeahead-dropdown.component';
import { UploadFileComponent } from 'app/shared/components/upload-file/upload-file.component';
import { FocusDirective } from 'app/shared/directives/focus.directive';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { combineLatest, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
@Component({
  selector: 'app-branch',
  templateUrl: './branch.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FocusDirective,
    PipesModule,
    TranslateModule,
    TypeaheadDropdownComponent,
    UploadFileComponent,
  ],
})
export class BranchComponent implements OnInit, OnDestroy {
  @ViewChild(UploadFileComponent) uploadFileComponent: UploadFileComponent;

  public operation: string;
  public branchForm: UntypedFormGroup;
  public loading: boolean = false;
  public identificationTypes: IdentificationType[];
  public vatConditions: VATCondition[];
  public currencies: Currency[];
  public accounts: Account[];
  public countries: any;
  public focusEvent = new EventEmitter<boolean>();
  public branch: Branch;
  public timezones: string;
  private destroy$ = new Subject<void>();

  constructor(
    private _branchService: BranchService,
    public _configService: ConfigService,
    public _vatCondition: VATConditionService,
    public _identificationTypeService: IdentificationTypeService,
    private _fb: UntypedFormBuilder,
    private _router: Router,

    private _toastService: ToastService
  ) {
    this.branchForm = this._fb.group({
      _id: ['', []],
      number: [0, [Validators.required]],
      name: ['', [Validators.required]],
      default: [false, []],
      image: ['', []],
      legalName: ['', []],
      fantasyName: ['', []],
      identificationType: [null, []],
      identificationValue: ['', []],
      vatCondition: [null, []],
      startOfActivity: ['', []],
      grossIncome: ['', []],
      address: ['', []],
      phone: ['', []],
      postalCode: ['', []],
      country: ['', []],
      latitude: ['', []],
      longitude: ['', []],
      timezone: ['', []],
    });
  }

  ngOnInit() {
    const pathUrl = this._router.url.split('/');
    this.operation = pathUrl[3];
    const branchId = pathUrl[4];

    combineLatest({
      countries: this._configService.getCountry(),
      vatConditions: this._vatCondition.find({ query: { operationType: { $ne: 'D' } } }),
      identificationTypes: this._identificationTypeService.find({ query: { operationType: { $ne: 'D' } } }),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ countries, vatConditions, identificationTypes }) => {
          this.countries = countries ?? [];
          this.vatConditions = vatConditions ?? [];
          this.identificationTypes = identificationTypes ?? [];
          if (branchId) {
            this.getBranch(branchId);
          } else {
            this.setValueForm();
          }
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.focusEvent.complete();
  }

  getBranch(id: string): void {
    this._branchService
      .getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this.branch = result.result;
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.setValueForm();
          this.loading = false;
        },
      });
  }

  public getTimeZone(country: string) {
    this._configService.getTimeZone(country).subscribe((result: any) => {
      const data = result[0];
      this.timezones = data.timezones;

      const [lat, lng] = data.latlng?.length === 2 ? data.latlng : [0, 0];
      // const currentLat = this.configForm.get('latitude')?.value;
      // const currentLng = this.configForm.get('longitude')?.value;

      // if (currentLat === '' || currentLng === '') {
      //   this.configForm.patchValue({
      //     latitude: String(lat),
      //     longitude: String(lng),
      //   });
      // }
    });
  }

  setValueForm(): void {
    const identificationType = this.identificationTypes.find(
      (item) => item._id === this.branch?.identificationType?.toString()
    );
    const vatCondition = this.vatConditions.find((item) => item._id === this.branch?.vatCondition?.toString());
    this.branchForm.patchValue({
      _id: this.branch?._id ?? '',
      number: this.branch?.number ?? 0,
      name: this.branch?.name ?? '',
      default: this.branch?.default ?? false,
      legalName: this.branch?.legalName ?? '',
      fantasyName: this.branch?.fantasyName ?? '',
      identificationType: identificationType ?? null,
      identificationValue: this.branch?.identificationValue ?? '',
      vatCondition: vatCondition ?? null,
      startOfActivity: this.branch?.startOfActivity
        ? new Date(this.branch.startOfActivity).toISOString().substring(0, 10)
        : '',
      image: this.branch?.image ?? '',
      grossIncome: this.branch?.grossIncome ?? '',
      address: this.branch?.address ?? '',
      phone: this.branch?.phone ?? '',
      postalCode: this.branch?.postalCode ?? '',
      country: this.branch?.country ?? '',
      latitude: this.branch?.latitude ?? '',
      longitude: this.branch?.longitude ?? '',
      timezone: this.branch?.timezone ?? '',
    });
  }

  returnTo() {
    return this._router.navigate(['/entities/branches']);
  }

  async handleBranchOperation() {
    this.loading = true;

    this.branchForm.markAllAsTouched();
    if (this.branchForm.invalid) {
      this.loading = false;
      return;
    }
    await this.uploadFileComponent.uploadImages();

    this.branch = this.branchForm.value;

    switch (this.operation) {
      case 'add':
        this.saveBranch();
        break;
      case 'update':
        this.updateBranch();
        break;
      case 'delete':
        this.deleteBranch();
        break;
    }
  }

  saveBranch(): void {
    this._branchService
      .save(this.branch)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this._toastService.showToast(result);
          if (result.status === 200) this.returnTo();
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  updateBranch(): void {
    this._branchService
      .update(this.branch)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this._toastService.showToast(result);
          if (result.status === 200) this.returnTo();
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  deleteBranch() {
    this._branchService
      .delete(this.branch._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this._toastService.showToast(result);
          if (result.status === 200) this.returnTo();
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  onImagesUploaded(urls: string[]): void {
    if (urls && urls.length > 0) {
      this.branchForm.get('image')?.setValue(urls[0]);
    }
  }
}
