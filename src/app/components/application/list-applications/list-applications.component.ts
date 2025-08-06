import { Component, EventEmitter, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PrintService } from '@core/services/print.service';
import { ApiResponse, Company, PrintType } from '@types';
import { CompanyService } from 'app/core/services/company.service';
import { WooCommerceService } from 'app/core/services/woocommerce.service';
import { ToastService } from 'app/shared/components/toast/toast.service';
import * as printJS from 'print-js';
import { combineLatest, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApplicationService } from '../../../core/services/application.service';
import { ArticleService } from '../../../core/services/article.service';
import { PaymentMethodService } from '../../../core/services/payment-method.service';
import { ShipmentMethodService } from '../../../core/services/shipment-method.service';
import { TransactionTypeService } from '../../../core/services/transaction-type.service';
import { TranslateMePipe } from '../../../shared/pipes/translate-me';
import { Article } from '../../article/article';
import { PaymentMethod } from '../../payment-method/payment-method';
import { ShipmentMethod } from '../../shipment-method/shipment-method.model';
import { TransactionType } from '../../transaction-type/transaction-type';
import { Application, ApplicationType } from '../application.model';

@Component({
  selector: 'app-list-applications',
  templateUrl: './list-applications.component.html',
  styleUrls: ['./list-applications.component.scss'],
  providers: [TranslateMePipe],
  encapsulation: ViewEncapsulation.None,
})
export class ListApplicationsComponent implements OnInit {
  private subscription: Subscription = new Subscription();
  public title: string = 'Listado de Aplicaciones';
  public applications: Application[];
  tiendaNubeForm: FormGroup;
  cartaDigitalForm: FormGroup;
  wooCommerceForm: FormGroup;
  loading: boolean = false;
  transactionTypes: TransactionType[];
  shipmentMethods: ShipmentMethod[];
  paymentMethods: PaymentMethod[];
  companies: Company[];
  articles: Article[];
  focusEvent = new EventEmitter<boolean>();

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    public _service: ApplicationService,
    private _toastService: ToastService,
    public translatePipe: TranslateMePipe,
    public _transactionTypeService: TransactionTypeService,
    public _shipmentMethodService: ShipmentMethodService,
    public _paymentMethodService: PaymentMethodService,
    public _companyService: CompanyService,
    private _articleService: ArticleService,
    private _wooCommerceService: WooCommerceService,
    public _printService: PrintService
  ) {}

  async ngOnInit() {
    this.buildForm();
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

  buildForm(): void {
    this.tiendaNubeForm = this.fb.group({
      userId: [0, []],
      token: ['', []],
      transactionType: ['', []],
      shipmentMethod: ['', []],
      paymentMethod: ['', []],
      company: ['', []],
      article: ['', []],
    });

    this.cartaDigitalForm = this.fb.group({
      portain: [''],
      background: [''],
      article: this.fb.group({
        font: [''],
        size: 0,
        color: [''],
        style: [''],
        weight: [''],
      }),
      category: this.fb.group({
        font: [''],
        size: 0,
        color: [''],
        style: [''],
        weight: [''],
      }),
      price: this.fb.group({
        font: [''],
        size: 0,
        color: [''],
        style: [''],
        weight: [''],
      }),
      observation: this.fb.group({
        font: [''],
        size: 0,
        color: [''],
        style: [''],
        weight: [''],
      }),
    });

    this.wooCommerceForm = this.fb.group({
      key: ['', []],
      secret: ['', []],
      url: ['', []],
      transactionType: [null, []],
      shipmentMethod: [null, []],
      paymentMethod: [null, []],
      company: [null, []],
      article: [null, []],
    });
  }

  public getAllApplication() {
    let project = {
      order: { $toString: '$order' },
      name: 1,
      url: 1,
      type: 1,
      operationType: 1,
      'tiendaNube.userId': 1,
      'tiendaNube.token': 1,
      'tiendaNube.transactionType._id': 1,
      'tiendaNube.transactionType.name': 1,
      'tiendaNube.shipmentMethod.name': 1,
      'tiendaNube.shipmentMethod._id': 1,
      'tiendaNube.paymentMethod.name': 1,
      'tiendaNube.paymentMethod._id': 1,
      'tiendaNube.company._id': 1,
      'tiendaNube.company.name': 1,
      'tiendaNube.article._id': 1,
      'tiendaNube.article.description': 1,
      'wooCommerce.key': 1,
      'wooCommerce.secret': 1,
      'wooCommerce.transactionType._id': 1,
      'wooCommerce.transactionType.name': 1,
      'wooCommerce.shipmentMethod.name': 1,
      'wooCommerce.shipmentMethod._id': 1,
      'wooCommerce.paymentMethod.name': 1,
      'wooCommerce.paymentMethod._id': 1,
      'wooCommerce.company._id': 1,
      'wooCommerce.company.name': 1,
      'wooCommerce.article._id': 1,
      'wooCommerce.article.description': 1,
      'wooCommerce.url': 1,
      'menu.portain': 1,
      'menu.background': 1,
      'menu.article.font': 1,
      'menu.article.size': 1,
      'menu.article.color': 1,
      'menu.article.style': 1,
      'menu.article.weight': 1,
      'menu.category.font': 1,
      'menu.category.size': 1,
      'menu.category.color': 1,
      'menu.category.style': 1,
      'menu.category.weight': 1,
      'menu.price.font': 1,
      'menu.price.size': 1,
      'menu.price.color': 1,
      'menu.price.style': 1,
      'menu.price.weight': 1,
      'menu.observation.font': 1,
      'menu.observation.size': 1,
      'menu.observation.color': 1,
      'menu.observation.style': 1,
      'menu.observation.weight': 1,
    };
    this.subscription.add(
      this._service
        .getAll({
          project,
        })
        .subscribe((result) => {
          if (result.status === 200) {
            this.applications = result.result;
            const tiendaNubeApplications = this.applications.find((app) => app.type === ApplicationType.TiendaNube);
            const cartaDigitalApplications = this.applications.find((app) => app.type === ApplicationType.Menu);
            const wooCommerce = this.applications.find((app) => app.type === ApplicationType.WooCommerce);

            this.setValuesForm(tiendaNubeApplications, cartaDigitalApplications, wooCommerce?.wooCommerce ?? null);
          }
        })
    );
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

  setValuesForm(tiendaNube, cartaDigital, wooCommerce) {
    let tn = tiendaNube.tiendaNube;
    let menu = cartaDigital.menu;

    this.tiendaNubeForm.patchValue({
      userId: tn?.userId,
      token: tn?.token,
      transactionType: tn?.transactionType,
      shipmentMethod: tn?.shipmentMethod,
      paymentMethod: tn?.paymentMethod,
      company: tn?.company,
      article: tn?.article,
    });

    this.cartaDigitalForm.patchValue({
      portain: menu?.portain,
      background: menu?.background,
      article: menu?.article
        ? {
            font: menu?.article.font,
            size: menu?.article.size,
            color: menu?.article.color,
            style: menu?.article.style,
            weight: menu?.article.weight,
          }
        : {},
      category: menu?.category
        ? {
            font: menu?.category.font,
            size: menu?.category.size,
            color: menu?.category.color,
            style: menu?.category.style,
            weight: menu?.category.weight,
          }
        : {},
      price: menu?.price
        ? {
            font: menu?.price.font,
            size: menu?.price.size,
            color: menu?.price.color,
            style: menu?.price.style,
            weight: menu?.price.weight,
          }
        : {},
      observation: menu?.observation
        ? {
            font: menu?.observation.font,
            size: menu?.observation.size,
            color: menu?.observation.color,
            style: menu?.observation.style,
            weight: menu?.observation.weight,
          }
        : {},
    });

    this.wooCommerceForm.patchValue({
      key: wooCommerce?.key ?? '',
      secret: wooCommerce?.secret ?? '',
      url: wooCommerce?.url ?? '',
      transactionType: wooCommerce?.transactionType ?? null,
      shipmentMethod: wooCommerce?.shipmentMethod ?? null,
      paymentMethod: wooCommerce?.paymentMethod ?? null,
      company: wooCommerce?.company ?? null,
      article: wooCommerce?.article ?? null,
    });
  }

  generateWebhook() {
    this.loading = true;

    if (this.tiendaNubeForm.value.userId && this.tiendaNubeForm.value.token) {
      this._service.createWebhookTn(this.tiendaNubeForm.value.userId, this.tiendaNubeForm.value.token).subscribe(
        (result: ApiResponse) => {
          if (result.status == 200) {
            this._toastService.showToast({
              type: 'success',
              message: 'Los webhooks se han creado con éxito.',
            });
            this.loading = false;
          } else {
            this._toastService.showToast({
              type: 'danger',
              message: result.result,
            });
            this.loading = false;
          }
        },
        (error) => {
          this._toastService.showToast({
            type: 'danger',
            message: 'Error al crear los webhooks.',
          });
        }
      );
    } else {
      this._toastService.showToast({
        type: 'info',
        message: 'Completa el UserId y el Token para generar los webhooks.',
      });
    }
  }

  upsertApplication(type) {
    this.loading = true;
    let application = this.applications.find((app) => app.type === type);
    let formData = {};

    switch (type) {
      case ApplicationType.TiendaNube:
        if (application) {
          formData = this.tiendaNubeForm.value;
          application.tiendaNube = { ...application.tiendaNube, ...formData };
          this.updateApplication(application);
        } else {
          let application = {
            type: 'TiendaNube',
            name: 'TiendaNube',
            tiendaNube: formData,
          };
          this.createApplication(application);
        }
        break;
      case ApplicationType.Menu:
        if (application) {
          formData = this.cartaDigitalForm.value;
          application.menu = { ...application.menu, ...formData };
          this.updateApplication(application);
        } else {
          let application = {
            type: 'Carta digital',
            name: 'Carta digital',
            menu: formData,
          };
          this.createApplication(application);
        }
        break;

      case ApplicationType.WooCommerce:
        if (application) {
          formData = this.wooCommerceForm.value;

          console.log(formData);
          application.wooCommerce = { ...application.wooCommerce, ...formData };
          this.updateApplication(application);
        } else {
          let application = {
            type: ApplicationType.WooCommerce,
            name: 'WooCommerce',
            wooCommerce: formData,
          };
          this.createApplication(application);
        }
        break;
      default:
        break;
    }
  }

  updateApplication(application) {
    this.subscription.add(
      this._service.update(application).subscribe((result) => {
        if (result.status === 200) {
          this._toastService.showToast({
            type: 'success',
            message: 'La aplicación se ha actualizado con éxito.',
          });
          this.loading = false;
        } else {
          this._toastService.showToast({
            type: 'danger',
            message: 'Error al actualizar la Aplicación.',
          });
          this.loading = false;
        }
      })
    );
  }

  createApplication(application) {
    this.subscription.add(
      this._service.save(application).subscribe((result) => {
        if (result.status === 200) {
          this._toastService.showToast({
            type: 'success',
            message: 'La aplicación se ha actualizado con éxito.',
          });
          this.loading = false;
        } else {
          this._toastService.showToast({
            type: 'danger',
            message: 'Error al actualizar la Aplicación.',
          });
          this.loading = false;
        }
      })
    );
  }

  public getAllArticlesTn(): Promise<any> {
    this.loading = true;
    return new Promise<any>((resolve, reject) => {
      this._articleService.getAllArticlesTiendaNube().subscribe(
        (result) => {
          if (!result.result) {
            if (result.message && result.message !== '')
              this._toastService.showToast(null, 'denger', 'Error al sincronizar los artículos.');
            this.loading = false;
            resolve(null);
          } else {
            this._toastService.showToast({
              type: 'success',
              message: 'Los artículos se sincronizaron correctamente',
            });
            resolve(result);
            this.loading = false;
          }
        },
        (error) => {
          this._toastService.showToast({
            type: 'danger',
            message: 'Error al sincronizar los artículos.',
          });
          resolve(null);
        }
      );
    });
  }

  public syncWooCommerce() {
    this._wooCommerceService.syncWoo().subscribe({
      next: (result) => {
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
