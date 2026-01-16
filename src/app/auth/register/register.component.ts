import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { FocusDirective } from '../../shared/directives/focus.directive';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FocusDirective],
})
export class RegisterComponent implements OnInit {
  public registerForm: UntypedFormGroup;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();

  public countries = [
    { code: 'AR', name: 'Argentina' },
    { code: 'BO', name: 'Bolivia' },
    { code: 'BR', name: 'Brasil' },
    { code: 'CL', name: 'Chile' },
    { code: 'CO', name: 'Colombia' },
    { code: 'CR', name: 'Costa Rica' },
    { code: 'CU', name: 'Cuba' },
    { code: 'DO', name: 'República Dominicana' },
    { code: 'EC', name: 'Ecuador' },
    { code: 'SV', name: 'El Salvador' },
    { code: 'GT', name: 'Guatemala' },
    { code: 'GY', name: 'Guyana' },
    { code: 'HT', name: 'Haití' },
    { code: 'HN', name: 'Honduras' },
    { code: 'MX', name: 'México' },
    { code: 'NI', name: 'Nicaragua' },
    { code: 'PA', name: 'Panamá' },
    { code: 'PY', name: 'Paraguay' },
    { code: 'PE', name: 'Perú' },
    { code: 'SR', name: 'Surinam' },
    { code: 'UY', name: 'Uruguay' },
    { code: 'VE', name: 'Venezuela' },
  ];

  public businessModels = [
    {
      key: 'kiosco',
      name: 'Kiosco',
      description: 'Pequeño negocio de venta al por menor',
    },
    {
      key: 'supermercado',
      name: 'Supermercado',
      description: 'Gran superficie de venta al público',
    },
    {
      key: 'restaurante',
      name: 'Restaurante',
      description: 'Negocio de comida y bebidas',
    },
    {
      key: 'mayorista',
      name: 'Mayorista',
      description: 'Venta al por mayor',
    },
    {
      key: 'minorista',
      name: 'Minorista',
      description: 'Tienda minorista general',
    },
    {
      key: 'panaderia',
      name: 'Panadería',
      description: 'Elaboración y venta de panadería',
    },
    {
      key: 'tiendaRopa',
      name: 'Tienda de Ropa',
      description: 'Venta de prendas y accesorios de vestir',
    },
    {
      key: 'bar',
      name: 'Bar',
      description: 'Negocio de bebidas y aperitivos',
    },
    {
      key: 'otros',
      name: 'Otro tipo de negocio',
      description: 'Selecciona si tu negocio no encaja en las categorías anteriores',
    },
  ];

  public integrations = [
    { key: 'tiendaNube', name: 'Tienda Nube' },
    { key: 'wooCommerce', name: 'WooCommerce' },
    { key: 'facturacionElectronica', name: 'Facturación Electrónica' },
    { key: 'mercadoLibre', name: 'Mercado Libre' },
  ];

  constructor(
    public _authService: AuthService,
    public _fb: UntypedFormBuilder,
    public _router: Router,
    private _toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.buildForm();
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {
    // Crear FormControls para cada integración
    const integrationControls: any = {};
    this.integrations.forEach((integration) => {
      integrationControls[integration.key] = [false];
    });

    this.registerForm = this._fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      companyName: ['', [Validators.required, Validators.minLength(2), Validators.pattern('^[a-zA-Z0-9]+$')]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      country: ['', [Validators.required]],
      businessModel: ['', [Validators.required]],
      integrations: this._fb.group(integrationControls),
    });

    this.focusEvent.emit(true);
  }

  public getSelectedBusinessModel() {
    const selectedKey = this.registerForm.get('businessModel')?.value;
    return this.businessModels.find((model) => model.key === selectedKey);
  }

  public register(): void {
    this.registerForm.markAllAsTouched();

    if (!this.registerForm.valid) {
      this._toastService.showToast({
        message: 'Por favor complete todos los campos correctamente.',
        type: 'warning',
      });
      return;
    }

    this.loading = true;

    // Obtener el modelo de negocio seleccionado
    const selectedBusinessModel = this.getSelectedBusinessModel();

    if (!selectedBusinessModel) {
      this._toastService.showToast({
        message: 'Por favor seleccione un modelo de negocio.',
        type: 'warning',
      });
      this.loading = false;
      return;
    }

    // Obtener integraciones seleccionadas
    const selectedIntegrations = this.integrations
      .filter((integration) => this.registerForm.get(`integrations.${integration.key}`)?.value)
      .map((integration) => integration.key);

    const registerData = {
      fullName: this.registerForm.value.fullName,
      companyName: this.registerForm.value.companyName,
      email: this.registerForm.value.email,
      phone: this.registerForm.value.phone,
      country: this.registerForm.value.country,
      businessModel: selectedBusinessModel.name,
      integrations: selectedIntegrations,
    };

    this._authService.register(registerData).subscribe({
      next: (result) => {
        this._toastService.showToast(result);
        this.loading = false;
      },
      error: (error) => {
        this._toastService.showToast(error);
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }
}
