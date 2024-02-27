import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { Application, ApplicationType } from '../application.model';
import { ApplicationService } from '../application.service';
import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateMePipe } from '../../../main/pipes/translate-me';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

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

  constructor(
    private fb: FormBuilder,
    public _service: ApplicationService,
    private _toastr: ToastrService,
    public translatePipe: TranslateMePipe,
  ) { }

  async ngOnInit() {
    this.buildForm();

    await this.getAllApplication()
  }

  buildForm(): void {
    this.tiendaNubeForm = this.fb.group({
      userId: [0],
      token: [''],
    });

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

  getAllApplication() {
    let project = {
      "order": { "$toString": "$order" },
      "name": 1,
      "url": 1,
      "type": 1,
      "operationType": 1,
      "tiendaNube.userId": 1,
      "tiendaNube.token": 1,
      "menu.portain": 1,
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
      "menu.observation.weight": 1,
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

  setValuesForm(tiendaNube, cartaDigital) {
    let tn = tiendaNube.tiendaNube
    let menu = cartaDigital.menu

    const formDataTn = {
      userId: tn?.userId,
      token: tn?.token
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

  updateApplication(type) {
    let application = this.applications.find(app => app.type === type)

    let formData = {};
    if (type === ApplicationType.TiendaNube) {
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
          }else{
            this.showToast(null, 'danger', 'Error al actualizar la Aplicación')
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
