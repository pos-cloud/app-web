import { Component, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import 'moment/locale/es';

import { NgbAlertConfig, NgbDropdownModule, NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { Router } from '@angular/router';

import { CommonModule } from '@angular/common';
import { AccountService } from '@core/services/account.service';
import { ConfigService } from '@core/services/config.service';
import { UserService } from '@core/services/user.service';
import { VATConditionService } from '@core/services/vat-condition.service';
import { TranslateModule } from '@ngx-translate/core';
import { ProgressbarModule } from '@shared/components/progressbar/progressbar.module';
import { TypeaheadDropdownComponent } from '@shared/components/typehead-dropdown/typeahead-dropdown.component';
import { UploadFileComponent } from '@shared/components/upload-file/upload-file.component';
import { FocusDirective } from '@shared/directives/focus.directive';
import { DateFormatPipe } from '@shared/pipes/date-format.pipe';
import { PipesModule } from '@shared/pipes/pipes.module';
import { TranslateMePipe } from '@shared/pipes/translate-me';
import { Account, ApiResponse, Config, Currency, IdentificationType, VATCondition } from '@types';
import { CurrencyService } from 'app/core/services/currency.service';
import { FileService } from 'app/core/services/file.service';
import { IdentificationTypeService } from 'app/core/services/identification-type.service';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { combineLatest, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  providers: [NgbAlertConfig, DateFormatPipe, TranslateMePipe],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    FocusDirective,
    ProgressbarModule,
    PipesModule,
    TranslateModule,
    NgbModule,
    CommonModule,
    NgbDropdownModule,
    TypeaheadDropdownComponent,
    UploadFileComponent,
  ],
})
export class ConfigsComponent implements OnInit {
  @ViewChild(UploadFileComponent) uploadFileComponent: UploadFileComponent;

  public identificationTypes: IdentificationType[];
  public vatConditions: VATCondition[];
  public currencies: Currency[];
  public accounts: Account[];
  public countries: any;
  public config: Config;
  public loading: boolean = false;
  public configForm: UntypedFormGroup;
  public focusEvent = new EventEmitter<boolean>();

  public timezones: string;
  private destroy$ = new Subject<void>();

  constructor(
    public _router: Router,
    public _configService: ConfigService,
    public _vatCondition: VATConditionService,
    public _identificationTypeService: IdentificationTypeService,
    public _currencyService: CurrencyService,
    public _accountService: AccountService,
    public _userService: UserService,
    public _fb: UntypedFormBuilder,
    public _toastService: ToastService,
    public alertConfig: NgbAlertConfig,
    public _modalService: NgbModal,
    public _fileService: FileService
  ) {
    this.configForm = this._fb.group({
      _id: [''],
      companyPicture: [''],
      companyName: ['', [Validators.required]],
      companyFantasyName: [''],
      companyIdentificationType: [''],
      companyIdentificationValue: [''],
      companyVatCondition: [''],
      companyStartOfActivity: ['', [this.validateDate()]],
      companyGrossIncome: [''],
      companyAddress: [''],
      companyPhone: [''],
      companyPostalCode: [''],
      footerInvoice: [''],
      country: [null],
      latitude: [''],
      longitude: [''],
      timezone: [''],
      emailAccount: [''],
      emailPassword: [''],
      emailHost: [''],
      emailPort: [''],

      article: this._fb.group({
        code: this._fb.group({
          validators: this._fb.group({
            maxLength: [''],
          }),
        }),
        salesAccount: this._fb.group({
          default: [null],
        }),
        purchaseAccount: this._fb.group({
          default: [false],
        }),
        isWeigth: this._fb.group({
          default: [false],
        }),
        allowSaleWithoutStock: this._fb.group({
          default: [false],
        }),
      }),

      company: this._fb.group({
        vatCondition: this._fb.group({
          default: [null],
        }),
        allowCurrentAccountProvider: this._fb.group({
          default: [false],
        }),
        allowCurrentAccountClient: this._fb.group({
          default: [false],
        }),
        accountClient: this._fb.group({
          default: [null],
        }),
        accountProvider: this._fb.group({
          default: [null],
        }),
      }),

      cashBox: this._fb.group({
        perUser: [''],
      }),

      reports: this._fb.group({
        summaryOfAccounts: this._fb.group({
          detailsPaymentMethod: [''],
          invertedViewClient: [false],
          invertedViewProvider: [false],
        }),
      }),

      tradeBalance: this._fb.group({
        codePrefix: [''],
        numberOfCode: [''],
        numberOfQuantity: [''],
        numberOfIntegers: [''],
        numberOfDecimals: [''],
      }),

      voucher: this._fb.group({
        readingLimit: [''],
        minutesOfExpiration: [''],
      }),
    });
  }

  async ngOnInit() {
    this.loading = true;

    combineLatest({
      countries: this._configService.getCountry(),
      vatConditions: this._vatCondition.find({ query: { operationType: { $ne: 'D' } } }),
      currencies: this._currencyService.find({ query: { operationType: { $ne: 'D' } } }),
      identificationTypes: this._identificationTypeService.find({ query: { operationType: { $ne: 'D' } } }),
      accounts: this._accountService.find({
        query: {
          mode: 'Analitico',
          operationType: { $ne: 'D' },
        },
      }),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ countries, vatConditions, currencies, accounts, identificationTypes }) => {
          this.countries = countries ?? [];
          this.vatConditions = vatConditions ?? [];
          this.currencies = currencies ?? [];
          this.accounts = accounts ?? [];
          this.identificationTypes = identificationTypes ?? [];
          this.getConfig();
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

  public getConfig(): void {
    this._configService
      .find({})
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this.config = result[0];
          this.setValuesForm();
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  public setValuesForm(): void {
    let companyArticleSalesAccount = this.accounts?.find(
      (item) => item._id === this.config?.article?.salesAccount?.default?.toString()
    );
    let companyArticlePurchaseAccount = this.accounts?.find(
      (item) => item._id === this.config?.article?.purchaseAccount?.default?.toString()
    );

    let companyIdentificationTypeConfig = this.identificationTypes?.find(
      (item) => item._id === this.config?.companyIdentificationType?.toString()
    );
    let companyVatConditionConfig = this.vatConditions.find(
      (item) => item._id === this.config?.companyVatCondition?.toString()
    );

    let vatConditionDefaultConfig = this.vatConditions.find(
      (item) => item._id === this.config?.company?.vatCondition?.default?.toString()
    );

    let companyAccountClientDefault = this.accounts.find(
      (item) => item._id === this.config?.company?.accountClient?.default?.toString()
    );
    let companyAccountProviderDefault = this.accounts.find(
      (item) => item._id === this.config?.company?.accountProvider?.default?.toString()
    );

    this.configForm.setValue({
      _id: this.config._id,
      companyPicture: this.config?.companyPicture ?? '',
      companyName: this.config?.companyName ?? '',
      companyAddress: this.config?.companyAddress ?? '',
      companyFantasyName: this.config?.companyFantasyName ?? '',
      companyPhone: this.config?.companyPhone ?? '',
      companyIdentificationType: companyIdentificationTypeConfig ?? null,
      companyIdentificationValue: this.config?.companyIdentificationValue ?? '',
      companyVatCondition: companyVatConditionConfig ?? null,
      companyStartOfActivity: moment(this.config?.companyStartOfActivity, 'YYYY-MM-DDTHH:mm:ssZ').format('DD/MM/YYYY'),
      companyGrossIncome: this.config?.companyGrossIncome ?? '',
      companyPostalCode: this.config?.companyPostalCode ?? '',
      footerInvoice: this.config?.footerInvoice ?? '',
      country: this.config?.country ?? null,
      latitude: this.config?.latitude ?? '',
      longitude: this.config?.longitude ?? '',
      timezone: this.config?.timezone ?? '',
      // currency: currency,
      emailAccount: this.config?.emailAccount ?? '',
      emailPassword: this.config?.emailPassword ?? '',
      emailHost: this.config?.emailHost ?? '',
      emailPort: this.config?.emailPort ?? '',
      article: {
        code: { validators: { maxLength: this.config?.article?.code?.validators?.maxLength ?? 10 } },
        isWeigth: { default: this.config?.article?.isWeigth?.default ?? false },
        salesAccount: { default: companyArticleSalesAccount ?? null },
        purchaseAccount: { default: companyArticlePurchaseAccount ?? null },
        allowSaleWithoutStock: { default: this.config?.article?.allowSaleWithoutStock?.default ?? false },
      },
      company: {
        allowCurrentAccountProvider: { default: this.config?.company?.allowCurrentAccountProvider?.default ?? false },
        allowCurrentAccountClient: { default: this.config?.company?.allowCurrentAccountClient?.default ?? false },
        vatCondition: { default: vatConditionDefaultConfig ?? null },
        accountClient: { default: companyAccountClientDefault ?? null },
        accountProvider: { default: companyAccountProviderDefault ?? null },
      },
      cashBox: { perUser: this.config?.cashBox?.perUser ?? false },
      reports: {
        summaryOfAccounts: {
          detailsPaymentMethod: this.config?.reports?.summaryOfAccounts?.detailsPaymentMethod ?? false,
          invertedViewClient: this.config?.reports?.summaryOfAccounts?.invertedViewClient ?? false,
          invertedViewProvider: this.config?.reports?.summaryOfAccounts?.invertedViewProvider ?? false,
        },
      },
      tradeBalance: {
        codePrefix: this.config?.tradeBalance?.codePrefix ?? 0,
        numberOfCode: this.config?.tradeBalance?.numberOfCode ?? 4,
        numberOfQuantity: this.config?.tradeBalance?.numberOfQuantity ?? 2,
        numberOfIntegers: this.config?.tradeBalance?.numberOfIntegers ?? 3,
        numberOfDecimals: this.config?.tradeBalance?.numberOfDecimals ?? 2,
      },
      voucher: {
        readingLimit: this.config?.voucher?.readingLimit ?? 0,
        minutesOfExpiration: this.config?.voucher?.minutesOfExpiration ?? 720,
      },
    });
  }

  async handleApplicationOperation() {
    this.loading = true;

    await this.uploadFileComponent.uploadImages();

    this.config = this.configForm.value;

    this.updateConfig();
  }
  public validateDate() {
    return function (input) {
      let dateValid = false;
      let date;
      if (input.parent && input.parent.controls && input.parent.controls['companyStartOfActivity'].value) {
        date = input.parent.controls['companyStartOfActivity'].value;
        if (moment(date, 'DD/MM/YYYY', true).isValid()) {
          dateValid = true;
        } else {
          dateValid = false;
        }
      }
      return dateValid ? null : { dateValid: true };
    };
  }

  public getTimeZone(country: string) {
    this._configService.getTimeZone(country).subscribe((result: any) => {
      const data = result[0];
      this.timezones = data.timezones;

      const [lat, lng] = data.latlng?.length === 2 ? data.latlng : [0, 0];
      const currentLat = this.configForm.get('latitude')?.value;
      const currentLng = this.configForm.get('longitude')?.value;

      if (currentLat === '' || currentLng === '') {
        this.configForm.patchValue({
          latitude: String(lat),
          longitude: String(lng),
        });
      }
    });
  }

  public async downloadBackup() {
    this._configService.downloadBackup().subscribe((result) => {
      if (result) {
        const currentDate = new Date();
        const day = String(currentDate.getDate()).padStart(2, '0');
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const year = currentDate.getFullYear();

        const formattedDate = `${day}-${month}-${year}`;

        const dbName = localStorage.getItem('company');

        const fileName = `${dbName}-${formattedDate}.gz`;

        const blob = new Blob([result], { type: 'application/gzip' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        window.URL.revokeObjectURL(url);

        this._toastService.showToast({
          message: 'Backup descargado correctamente',
          type: 'success',
        });
      } else {
        this._toastService.showToast({
          message: 'Error al generar el respaldo',
          type: 'error',
        });
      }
    });
  }

  updateConfig() {
    this.config = this.configForm.value;

    this._configService
      .update(this.config)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this._toastService.showToast(result);
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
    this.configForm.get('companyPicture')?.setValue(urls.length > 0 ? urls[0] : '');
  }
}
