import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApplicationService } from '@core/services/application.service';
import { AuthService } from '@core/services/auth.service';
import { ConfigService } from '@core/services/config.service';
import { FeArService } from '@core/services/fe-ar.service';
import { PrintService } from '@core/services/print.service';
import { TiendaNubeService } from '@core/services/tienda-nube.service';
import { NgbAccordionModule, NgbDropdownModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { ProgressbarModule } from '@shared/components/progressbar/progressbar.module';
import { TypeaheadDropdownComponent } from '@shared/components/typehead-dropdown/typeahead-dropdown.component';
import { FocusDirective } from '@shared/directives/focus.directive';
import { PipesModule } from '@shared/pipes/pipes.module';
import {
  ApiResponse,
  Application,
  Article,
  Company,
  FeArIntegrationEntry,
  PaymentMethod,
  PrintType,
  ShipmentMethod,
  TransactionType,
} from '@types';
import { CompanyService } from 'app/core/services/company.service';
import { ToastService } from 'app/shared/components/toast/toast.service';
import * as printJS from 'print-js';
import { combineLatest, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ArticleService } from '../../../core/services/article.service';
import { PaymentMethodService } from '../../../core/services/payment-method.service';
import { ShipmentMethodService } from '../../../core/services/shipment-method.service';
import { TransactionTypeService } from '../../../core/services/transaction-type.service';
import { TranslateMePipe } from '../../../shared/pipes/translate-me';

@Component({
  selector: 'app-applications',
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.scss'],
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    FocusDirective,
    ProgressbarModule,
    PipesModule,
    NgbAccordionModule,
    TranslateModule,
    NgbModule,
    CommonModule,
    NgbDropdownModule,
    TypeaheadDropdownComponent,
  ],
  providers: [TranslateMePipe],
})
export class ListApplicationsComponent implements OnInit {
  public title: string = 'Listado de Aplicaciones';
  public application: Application;
  public integracionesForm: FormGroup;
  public loading: boolean = false;
  public transactionTypes: TransactionType[];
  public shipmentMethods: ShipmentMethod[];
  public paymentMethods: PaymentMethod[];
  public companies: Company[];
  public articles: Article[];
  public focusEvent = new EventEmitter<boolean>();
  public feArPendingCrtFiles: File[][] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    public _tiendaNubeService: TiendaNubeService,
    public _applicationService: ApplicationService,
    private _toastService: ToastService,
    public translatePipe: TranslateMePipe,
    public _transactionTypeService: TransactionTypeService,
    public _shipmentMethodService: ShipmentMethodService,
    public _paymentMethodService: PaymentMethodService,
    public _companyService: CompanyService,
    private _articleService: ArticleService,
    public _configService: ConfigService,
    public _printService: PrintService,
    public _authService: AuthService,
    public _feArService: FeArService
  ) {
    this.integracionesForm = this.fb.group({
      _id: ['', []],
      tiendaNube: this.fb.group({
        userId: [0],
        token: [''],
        transactionType: [null],
        shipmentMethod: [null],
        paymentMethod: [null],
        company: [null],
        article: [null],
      }),
      wooCommerce: this.fb.group({
        key: [''],
        secret: [''],
        url: [''],
        transactionType: [null],
        shipmentMethod: [null],
        paymentMethod: [null],
        company: [null],
        article: [null],
      }),
      menu: this.fb.group({
        portain: [''],
        background: [''],
        article: this.fb.group({
          font: [''],
          size: [0],
          color: [''],
          style: [''],
          weight: [''],
        }),

        category: this.fb.group({
          font: [''],
          size: [0],
          color: [''],
          style: [''],
          weight: [''],
        }),

        price: this.fb.group({
          font: [''],
          size: [0],
          color: [''],
          style: [''],
          weight: [''],
        }),

        observation: this.fb.group({
          font: [''],
          size: [0],
          color: [''],
          style: [''],
          weight: [''],
        }),
      }),
      feAr: this.fb.array([
        this.fb.group({
          companyName: [''],
          identificationValue: [''],
        }),
      ]),
    });
  }

  get feArEntries(): FormArray {
    return this.integracionesForm.get('feAr') as FormArray;
  }

  private createFeArEntryGroup(initial?: Partial<FeArIntegrationEntry>): FormGroup {
    return this.fb.group({
      companyName: [initial?.companyName ?? ''],
      identificationValue: [initial?.identificationValue ?? ''],
    });
  }

  private normalizeFeArFromApplication(): FeArIntegrationEntry[] {
    const raw = this.application?.feAr as unknown;
    if (!raw) {
      return [];
    }
    if (Array.isArray(raw)) {
      return (raw as FeArIntegrationEntry[]).map((e) => ({
        companyName: (e?.companyName ?? '').toString(),
        identificationValue: (e?.identificationValue ?? '').toString(),
      }));
    }
    const legacy = raw as { companyName?: string; identificationValue?: string };
    if (legacy.companyName || legacy.identificationValue) {
      return [
        {
          companyName: legacy.companyName ?? '',
          identificationValue: legacy.identificationValue ?? '',
        },
      ];
    }
    return [];
  }

  public addFeArEntry(): void {
    this.feArEntries.push(this.createFeArEntryGroup());
    this.feArPendingCrtFiles.push([]);
  }

  public removeFeArEntry(index: number): void {
    this.feArEntries.removeAt(index);
    this.feArPendingCrtFiles.splice(index, 1);
  }

  async ngOnInit() {
    this.loading = true;
    combineLatest({
      transactionTypes: this._transactionTypeService.find({ query: { operationType: { $ne: 'D' } } }),
      shipmentMethods: this._shipmentMethodService.find({ query: { operationType: { $ne: 'D' } } }),
      paymentMethods: this._paymentMethodService.find({ query: { operationType: { $ne: 'D' } } }),
      companies: this._companyService.find({ query: { operationType: { $ne: 'D' } } }),
      articles: this._articleService.find({ query: { operationType: { $ne: 'D' } } }),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ transactionTypes, shipmentMethods, paymentMethods, companies, articles }) => {
          this.transactionTypes = transactionTypes ?? [];
          this.shipmentMethods = shipmentMethods ?? [];
          this.paymentMethods = paymentMethods ?? [];
          this.companies = companies ?? [];
          this.articles = articles ?? [];
          this.getAllApplication();
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

  public getAllApplication() {
    this._applicationService
      .find({})
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this.application = result[0];
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

  setValuesForm() {
    const companyTn = this.companies?.find((item) => item._id === this.application?.tiendaNube?.company?.toString());
    const companyWoo = this.companies?.find((item) => item._id === this.application?.wooCommerce?.company?.toString());

    const paymentMethodTn = this.paymentMethods?.find(
      (item) => item._id === this.application?.tiendaNube?.paymentMethod?.toString()
    );
    const paymentMethodWoo = this.paymentMethods?.find(
      (item) => item._id === this.application?.wooCommerce?.paymentMethod?.toString()
    );

    const shipmentMethodTn = this.shipmentMethods?.find(
      (item) => item._id === this.application?.tiendaNube?.shipmentMethod?.toString()
    );
    const shipmentMethodWoo = this.shipmentMethods?.find(
      (item) => item._id === this.application?.wooCommerce?.shipmentMethod?.toString()
    );
    const transactionTypeTn = this.transactionTypes?.find(
      (item) => item._id === this.application?.tiendaNube?.transactionType?.toString()
    );
    const transactionTypeWoo = this.transactionTypes?.find(
      (item) => item._id === this.application?.wooCommerce?.transactionType?.toString()
    );
    const articleTn = this.articles?.find((item) => item._id === this.application?.tiendaNube?.article?.toString());
    const articleWoo = this.articles?.find((item) => item._id === this.application?.wooCommerce?.article?.toString());

    let values = {
      _id: this.application?._id ?? '',
      tiendaNube: {
        userId: this.application?.tiendaNube?.userId ?? 0,
        token: this.application?.tiendaNube?.token ?? '',
        transactionType: transactionTypeTn ?? null,
        shipmentMethod: shipmentMethodTn ?? null,
        paymentMethod: paymentMethodTn ?? null,
        company: companyTn ?? null,
        article: articleTn ?? null,
      },

      wooCommerce: {
        key: this.application?.wooCommerce?.key ?? '',
        secret: this.application?.wooCommerce?.secret ?? '',
        url: this.application?.wooCommerce?.url ?? '',
        transactionType: transactionTypeWoo ?? null,
        shipmentMethod: shipmentMethodWoo ?? null,
        paymentMethod: paymentMethodWoo ?? null,
        company: companyWoo ?? null,
        article: articleWoo ?? null,
      },

      menu: {
        portain: this.application?.menu?.portain ?? '',
        background: this.application?.menu?.background ?? '',

        article: {
          font: this.application?.menu?.article?.font ?? '',
          size: this.application?.menu?.article?.size ?? 0,
          color: this.application?.menu?.article?.color ?? '',
          style: this.application?.menu?.article?.style ?? '',
          weight: this.application?.menu?.article?.weight ?? '',
        },
        category: {
          font: this.application?.menu?.category?.font ?? '',
          size: this.application?.menu?.category?.size ?? 0,
          color: this.application?.menu?.category?.color ?? '',
          style: this.application?.menu?.category?.style ?? '',
          weight: this.application?.menu?.category?.weight ?? '',
        },
        price: {
          font: this.application?.menu?.price?.font ?? '',
          size: this.application?.menu?.price?.size ?? 0,
          color: this.application?.menu?.price?.color ?? '',
          style: this.application?.menu?.price?.style ?? '',
          weight: this.application?.menu?.price?.weight ?? '',
        },
        observation: {
          font: this.application?.menu?.observation?.font ?? '',
          size: this.application?.menu?.observation?.size ?? 0,
          color: this.application?.menu?.observation?.color ?? '',
          style: this.application?.menu?.observation?.style ?? '',
          weight: this.application?.menu?.observation?.weight ?? '',
        },
      },
    };

    this.integracionesForm.patchValue(values);

    const feArArray = this.feArEntries;
    feArArray.clear();
    const feArItems = this.normalizeFeArFromApplication();
    if (feArItems.length === 0) {
      feArArray.push(this.createFeArEntryGroup());
    } else {
      feArItems.forEach((item) => feArArray.push(this.createFeArEntryGroup(item)));
    }
    this.feArPendingCrtFiles = feArArray.controls.map(() => []);
  }

  public printQr() {
    this.loading = true;

    this._printService
      .toPrint(PrintType.Qr, {})
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: Blob | ApiResponse) => {
          if (!result) {
            this._toastService.showToast({ message: 'Error al generar el PDF' });
            return;
          }
          if (result instanceof Blob) {
            try {
              const blobUrl = URL.createObjectURL(result);
              printJS(blobUrl);
            } catch (e) {
              this._toastService.showToast({ message: 'Error al generar el PDF' });
            }
          } else {
            this._toastService.showToast(result);
          }
        },
        error: (error) => {
          this._toastService.showToast({ message: 'Error al generar el PDF' });
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  public generateWebhook() {
    this.loading = true;
    this._tiendaNubeService
      .createWebhookTn()
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

  public generateCRS(index: number) {
    const group = this.feArEntries.at(index) as FormGroup;
    const companyName = (group.get('companyName')?.value ?? '').toString().trim();
    const identificationValue = (group.get('identificationValue')?.value ?? '').toString().trim();
    if (!companyName || !identificationValue) {
      this._toastService.showToast(null, 'warning', '', 'Ingrese nombre de empresa y valor de identificación.');
      return;
    }

    this.loading = true;
    this._feArService
      .generateCRS(companyName, identificationValue)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: Blob | unknown) => {
          if (result instanceof Blob) {
            const url = window.URL.createObjectURL(result);
            const a = document.createElement('a');
            a.href = url;
            const safeId = identificationValue.replace(/[^\dA-Za-z_-]/g, '') || 'solicitud';
            a.download = `poscloud-${safeId}.csr`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
          } else {
            this._toastService.showToast(null, 'danger', '', 'No se pudo generar el certificado.');
          }
          this.loading = false;
        },
        error: () => {
          this._toastService.showToast(null, 'danger', '', 'Error al generar el certificado.');
          this.loading = false;
        },
      });
  }

  public uploadFeArCrt(index: number) {
    const files = this.feArPendingCrtFiles[index];
    const group = this.feArEntries.at(index) as FormGroup;
    const companyCUIT = (group.get('identificationValue')?.value ?? '').toString().trim();
    if (!companyCUIT) {
      this._toastService.showToast(null, 'warning', '', 'Ingrese el CUIT para subir el certificado.');
      return;
    }
    if (!files?.length) {
      this._toastService.showToast(null, 'warning', '', 'Seleccione un archivo .crt.');
      return;
    }

    this._feArService.uploadCRT(files, companyCUIT).then(
      (result) => {
        if (result) {
          this._toastService.showToast({
            message: result.message,
            type: 'success',
          });
        }
      },
      (error) => {
        this._toastService.showToast({ message: error, type: 'warning' });
      }
    );
  }

  public feArCrtFileChange(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      while (this.feArPendingCrtFiles.length <= index) {
        this.feArPendingCrtFiles.push([]);
      }
      this.feArPendingCrtFiles[index] = Array.from(input.files);
    }
  }

  public handleApplicationOperation() {
    this.loading = true;

    this.application = this.integracionesForm.value;

    if (!this.application._id) {
      return this.saveApplication();
    }
    this.updateApplication();
  }

  saveApplication() {
    this._applicationService
      .save(this.application)
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

  updateApplication() {
    this.application = this.integracionesForm.value;

    this._applicationService
      .update(this.application)
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
}
