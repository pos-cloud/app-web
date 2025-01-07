import { Component, EventEmitter, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiResponse } from '@types';
import { CompanyService } from 'app/core/services/company.service';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { Observable, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { ApplicationService } from '../../../core/services/application.service';
import { ArticleService } from '../../../core/services/article.service';
import { PaymentMethodService } from '../../../core/services/payment-method.service';
import { ShipmentMethodService } from '../../../core/services/shipment-method.service';
import { TransactionTypeService } from '../../../core/services/transaction-type.service';
import { TranslateMePipe } from '../../../shared/pipes/translate-me';
import { Article, Type } from '../../article/article';
import { Company, CompanyType } from '../../company/company';
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
  formErrors = {
    userId: 'Este campo es requerido.',
    token: 'Este campo es requerido.',
    transactionType: 'Este campo es requerido.',
    shipmentMethod: 'Este campo es requerido.',
    paymentMethod: 'Este campo es requerido.',
    company: 'Este campo es requerido.',
    article: 'Este campo es requerido.',
  };

  searchArticle = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => null),
      switchMap((term) =>
        this.getArticle(
          `where="description": { "$regex": "${term}", "$options": "i" },"type":"${Type.Final}"&sort="description":1&limit=10`
        ).then((articles) => {
          return articles;
        })
      ),
      tap(() => null)
    );

  formatterArticles = (x: Article) => {
    return x.description;
  };

  searchCompany = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => null),
      switchMap((term) =>
        this.getCompany(
          `where="name": { "$regex": "${term}", "$options": "i" },"type":"${CompanyType.Client}"&sort="name":1&limit=10`
        ).then((articles) => {
          return articles;
        })
      ),
      tap(() => null)
    );

  formatterCompany = (x: Company) => {
    return x.name;
  };

  searchTransactionType = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => null),
      switchMap((term) =>
        this.getTransactionTypes(`where="name": { "$regex": "${term}", "$options": "i" }&sort="name":1&limit=10`).then(
          (transactionTypes) => {
            return transactionTypes;
          }
        )
      ),
      tap(() => null)
    );

  formatterTransactionType = (x: TransactionType) => {
    return x.name;
  };

  searchPaymentMethod = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => null),
      switchMap((term) =>
        this.getPaymentMethod(`where="name": { "$regex": "${term}", "$options": "i" }&sort="name":1&limit=10`).then(
          (paymentMethod) => {
            return paymentMethod;
          }
        )
      ),
      tap(() => null)
    );

  formatterPaymentMethod = (x: PaymentMethod) => {
    return x.name;
  };

  searchpShipmentMethod = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => null),
      switchMap((term) =>
        this.getShipmentMethod(`where="name": { "$regex": "${term}", "$options": "i" }&sort="name":1&limit=10`).then(
          (shipmentMethods) => {
            return shipmentMethods;
          }
        )
      ),
      tap(() => null)
    );

  formatterShipmentMethod = (x: ShipmentMethod) => {
    return x.name;
  };

  constructor(
    private fb: FormBuilder,
    public _service: ApplicationService,
    private _toastService: ToastService,
    public translatePipe: TranslateMePipe,
    public _transactionTypeService: TransactionTypeService,
    public _shipmentMethodService: ShipmentMethodService,
    public _paymentMethodService: PaymentMethodService,
    public _companyService: CompanyService,
    private _articleService: ArticleService
  ) {}

  async ngOnInit() {
    this.buildForm();

    this.getAllApplication();
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  buildForm(): void {
    this.tiendaNubeForm = this.fb.group({
      userId: [0, [Validators.required]],
      token: ['', [Validators.required]],
      transactionType: ['', [Validators.required]],
      shipmentMethod: ['', [Validators.required]],
      paymentMethod: ['', [Validators.required]],
      company: ['', [Validators.required]],
      article: ['', [Validators.required]],
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
      key: [0, [Validators.required]],
      secret: ['', [Validators.required]],
      transactionType: ['', [Validators.required]],
      shipmentMethod: ['', [Validators.required]],
      paymentMethod: ['', [Validators.required]],
      company: ['', [Validators.required]],
      article: ['', [Validators.required]],
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

            console.log(wooCommerce);

            this.setValuesForm(tiendaNubeApplications, cartaDigitalApplications, wooCommerce.wooCommerce);
          }
        })
    );
  }

  public getTransactionTypes(query): Promise<TransactionType[]> {
    return new Promise<TransactionType[]>((resolve, reject) => {
      this._transactionTypeService.getTrasactionTypes(query).subscribe(
        (result) => {
          if (!result.transactionTypes) {
            resolve(null);
          } else {
            resolve(result.transactionTypes);
          }
        },
        (error) => this._toastService.showToast(error)
      );
    });
  }

  public getShipmentMethod(query): Promise<ShipmentMethod[]> {
    return new Promise<ShipmentMethod[]>((resolve, reject) => {
      this._shipmentMethodService.getShipmentMethods(query).subscribe(
        (result) => {
          if (!result.result) {
            resolve(null);
          } else {
            resolve(result.result);
          }
        },
        (error) => this._toastService.showToast(error)
      );
    });
  }

  public getPaymentMethod(query): Promise<PaymentMethod[]> {
    return new Promise<PaymentMethod[]>((resolve, reject) => {
      this._paymentMethodService.getPaymentMethods(query).subscribe(
        (result) => {
          if (!result.paymentMethods) {
            resolve(null);
          } else {
            resolve(result.paymentMethods);
          }
        },
        (error) => this._toastService.showToast(error)
      );
    });
  }

  public getCompany(query): Promise<Company[]> {
    return new Promise<Company[]>((resolve, reject) => {
      this._companyService.getCompanies(query).subscribe(
        (result) => {
          if (!result.companies) {
            resolve(null);
          } else {
            resolve(result.companies);
          }
        },
        (error) => this._toastService.showToast(error)
      );
    });
  }

  public getArticle(query): Promise<Article[]> {
    return new Promise<Article[]>((resolve, reject) => {
      this._articleService.getArticles(query).subscribe(
        (result) => {
          if (!result.articles) {
            resolve(null);
          } else {
            resolve(result.articles);
          }
        },
        (error) => this._toastService.showToast(error)
      );
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
      key: wooCommerce?.key,
      secret: wooCommerce?.secret,
      transactionType: wooCommerce?.transactionType,
      shipmentMethod: wooCommerce?.shipmentMethod,
      paymentMethod: wooCommerce?.paymentMethod,
      company: wooCommerce?.company,
      article: wooCommerce?.article,
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

  updateApplication(type) {
    this.loading = true;
    let application = this.applications.find((app) => app.type === type);
    let formData = {};

    if (type === ApplicationType.TiendaNube) {
      formData = this.tiendaNubeForm.value;
      application.tiendaNube = { ...application.tiendaNube, ...formData };
    } else if (type === ApplicationType.Menu) {
      formData = this.cartaDigitalForm.value;
      application.menu = { ...application.menu, ...formData };
    } else if (type === ApplicationType.WooCommerce) {
      formData = this.wooCommerceForm.value;
      application.wooCommerce = { ...application.wooCommerce, ...formData };
    }

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
}
