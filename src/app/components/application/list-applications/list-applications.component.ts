import { Component, OnInit, EventEmitter } from '@angular/core';
import { Application, ApplicationType } from '../application.model';
import { ApplicationService } from '../application.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateMePipe } from '../../../main/pipes/translate-me';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { TransactionTypeService } from '../../transaction-type/transaction-type.service';
import { TransactionType } from '../../transaction-type/transaction-type';
import { ShipmentMethodService } from '../../shipment-method/shipment-method.service';
import { PaymentMethodService } from '../../payment-method/payment-method.service';
import { PaymentMethod } from '../../payment-method/payment-method'
import { ShipmentMethod } from '../../shipment-method/shipment-method.model'
import Resulteable from './../../../util/Resulteable';
import { CompanyService } from 'app/components/company/company.service';
import { Company } from '../../company/company'

@Component({
  selector: 'app-list-applications',
  templateUrl: './list-applications.component.html',
  styleUrls: ['./list-applications.component.scss'],
  providers: [TranslateMePipe]
})

export class ListApplicationsComponent implements OnInit {

  private subscription: Subscription = new Subscription();
  public title: string = 'Listado de Aplicaciones';
  public applications: Application[];
  tiendaNubeForm: FormGroup;
  cartaDigitalForm: FormGroup;
  loading: boolean = false;
  transactionTypes: TransactionType[]
  shipmentMethods: ShipmentMethod[]
  paymentMethods: PaymentMethod[]
  companies: Company[]
  focusEvent = new EventEmitter<boolean>();
  formErrors = {
    userId: 'Este campo es requerido.',
    token: 'Este campo es requerido.',
    transactionType: 'Este campo es requerido.',
    shipmentMethod: 'Este campo es requerido.',
    paymentMethod: 'Este campo es requerido.',
    company: 'Este campo es requerido.',
  };

  constructor(
    private fb: FormBuilder,
    public _service: ApplicationService,
    private _toastr: ToastrService,
    public translatePipe: TranslateMePipe,
    public _transactionTypeService: TransactionTypeService,
    public _shipmentMethodService: ShipmentMethodService,
    public _paymentMethodService: PaymentMethodService,
    public _companyService: CompanyService
  ) { }

  async ngOnInit() {
    this.buildForm();

    this.getAllApplication();
    this.getTransactionTypes();
    this.getShipmentMethod();
    this.getPaymentMethod();
    this.getCompany()
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
      company: ['', [Validators.required]]
    });

    this.focusEvent.emit(true)

    this.cartaDigitalForm = this.fb.group({
      portain: [''],
      background: [''],
      article: this.fb.group({
        font: [''],
        size: 0,
        color: [''],
        style: [''],
        weight: ['']
      }),
      category: this.fb.group({
        font: [''],
        size: 0,
        color: [''],
        style: [''],
        weight: ['']
      }),
      price: this.fb.group({
        font: [''],
        size: 0,
        color: [''],
        style: [''],
        weight: ['']
      }),
      observation: this.fb.group({
        font: [''],
        size: 0,
        color: [''],
        style: [''],
        weight: ['']
      })
    });
  }

  public getAllApplication() {
    let project = {
      "order": { "$toString": "$order" },
      "name": 1,
      "url": 1,
      "type": 1,
      "operationType": 1,
      "tiendaNube.userId": 1,
      "tiendaNube.token": 1,
      "tiendaNube.transactionType._id": 1,
      "tiendaNube.shipmentMethod._id": 1,
      "tiendaNube.paymentMethod._id": 1,
      "tiendaNube.company._id": 1, "menu.portain": 1,
      "menu.background": 1,
      "menu.article.font": 1,
      "menu.article.size": 1,
      "menu.article.color": 1,
      "menu.article.style": 1,
      "menu.article.weight": 1,
      "menu.category.font": 1,
      "menu.category.size": 1,
      "menu.category.color": 1,
      "menu.category.style": 1,
      "menu.category.weight": 1,
      "menu.price.font": 1,
      "menu.price.size": 1,
      "menu.price.color": 1,
      "menu.price.style": 1,
      "menu.price.weight": 1,
      "menu.observation.font": 1,
      "menu.observation.size": 1,
      "menu.observation.color": 1,
      "menu.observation.style": 1,
      "menu.observation.weight": 1
    }
    this.subscription.add(
      this._service.getAll({
        project,
      }).subscribe(
        (result) => {
          if (result.status === 200) {
            this.applications = result.result
            const tiendaNubeApplications = this.applications.find(app => app.type === ApplicationType.TiendaNube);
            const cartaDigitalApplications = this.applications.find(app => app.type === ApplicationType.Menu);

            this.setValuesForm(tiendaNubeApplications, cartaDigitalApplications)
          }
        }
      ),
    );
  }

  public getTransactionTypes(): Promise<TransactionType[]> {
    return new Promise<TransactionType[]>((resolve, reject) => {
      let match = {};

      match = {
        operationType: { $ne: 'D' },
      };

      this._transactionTypeService
        .getAll({
          project: {
            _id: 1,
            operationType: 1,
            name: 1,
          },
          match: match,
        })
        .subscribe(
          (result) => {
            if (result) {
              this.transactionTypes = result.result
              resolve(result.result);
            } else {
              this.transactionTypes = null
              resolve(null);
            }
          },
          (error) => {
            resolve(null);
          },
        );
    });
  }

  public getShipmentMethod() {
    this._shipmentMethodService.getAll({
      project: {
        _id: 1,
        name: 1,
        operationType: 1,
      },
      match: {
        operationType: { $ne: "D" }
      }
    }).subscribe(
      (result) => {
        if (result) {
          this.shipmentMethods = result.result
        } else {
          this.shipmentMethods = null
        }
      },
      error => this.showToast(error)
    )
  }

  public getPaymentMethod() {
    this._paymentMethodService.getAll({
      project: {
        _id: 1,
        name: 1,
        operationType: 1,
      },
      match: {
        operationType: { $ne: "D" }
      }
    }).subscribe(
      (result) => {
        if (result) {
          this.paymentMethods = result.result
        } else {
          this.paymentMethods = null
        }
      },
      error => this.showToast(error)
    )
  }

  public getCompany() {
    this._companyService.getAll({
      project: {
        _id: 1,
        name: 1,
        operationType: 1,
        type: 1
      },
      match: {
        type: 'Cliente',
        operationType: { $ne: "D" }
      }
    }).subscribe(
      (result) => {
        if (result) {
          this.companies = result.result
        } else {
          this.companies = null
        }
      },
      error => this.showToast(error)
    )
  }

  public getWebhook(userId, token): any {
    this._service.getWebhookTn(userId, token).subscribe(
      (result: Resulteable) => {
        if (result.status === 200) {
          return result.result
        } else {
          return []
        }
      }
    )
  }

  setValuesForm(tiendaNube, cartaDigital) {
    let tn = tiendaNube.tiendaNube
    let menu = cartaDigital.menu

    const formDataTn = {
      userId: tn?.userId,
      token: tn?.token,
      transactionType: tn?.transactionType?._id,
      shipmentMethod: tn?.shipmentMethod?._id,
      paymentMethod: tn?.paymentMethod?._id,
      company: tn?.company?._id
    };

    this.tiendaNubeForm.patchValue(formDataTn);

    const formData = {
      portain: menu?.portain,
      background: menu?.background,
      article: menu?.article ? {
        font: menu?.article.font,
        size: menu?.article.size,
        color: menu?.article.color,
        style: menu?.article.style,
        weight: menu?.article.weight
      } : {},
      category: menu?.category ? {
        font: menu?.category.font,
        size: menu?.category.size,
        color: menu?.category.color,
        style: menu?.category.style,
        weight: menu?.category.weight
      } : {},
      price: menu?.price ? {
        font: menu?.price.font,
        size: menu?.price.size,
        color: menu?.price.color,
        style: menu?.price.style,
        weight: menu?.price.weight
      } : {},
      observation: menu?.observation ? {
        font: menu?.observation.font,
        size: menu?.observation.size,
        color: menu?.observation.color,
        style: menu?.observation.style,
        weight: menu?.observation.weight
      } : {}
    };
    this.cartaDigitalForm.patchValue(formData);
  }

  generateWebhook() {
    if (this.tiendaNubeForm.value.userId && this.tiendaNubeForm.value.token) {
      this._service.createWebhookTn(this.tiendaNubeForm.value.userId, this.tiendaNubeForm.value.token).subscribe(
        (result: Resulteable) => {
          if (result.status == 201) {
            this.showToast(null, 'success', 'Los webhooks se han creado con éxito.');
          } else {
            this.showToast(null, 'danger', 'Error al crear los webhooks.');
          }
        },
        (error) => {
          this.showToast(null, 'danger', 'Error al crear los webhooks.');
        }
      );
    } else {
      this.showToast(null, 'info', 'Completa el UserId y el Token para generar los webhooks.');
    }
  }

  updateApplication(type) {
    let application = this.applications.find(app => app.type === type)
    let formData = {};

    if (type === ApplicationType.TiendaNube) {
      if (!this.tiendaNubeForm.valid) {
        return this.showToast({ message: 'Revisa los errores en el formulario.' });
      }

      let webhook = this.getWebhook(this.tiendaNubeForm.value.userId, this.tiendaNubeForm.value.token)

      if (webhook === undefined || !webhook.length) {
        return this.showToast({ message: 'No hay Webhook generados.' });
      }

      formData = this.tiendaNubeForm.value;
      application.tiendaNube = { ...application.tiendaNube, ...formData };
    } else if (type === ApplicationType.Menu) {
      formData = this.cartaDigitalForm.value;
      application.menu = { ...application.menu, ...formData };
    }


    this.subscription.add(
      this._service.update(application).subscribe(
        (result) => {
          if (result.status === 200) {
            this.showToast(null, 'success', 'La aplicación se ha actualizado con éxito.');
          } else {
            this.showToast(null, 'danger', 'Error al actualizar la Aplicación.')
          }
        }
      ),
    );
  }

  showToast(result, type?: string, title?: string, message?: string): void {
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
}
