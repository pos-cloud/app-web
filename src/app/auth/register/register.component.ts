import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { BusinessModel } from '../../core/enums/business-model.enum';
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
      key: BusinessModel.Kiosco,
      name: 'Kiosco',
    },
    {
      key: BusinessModel.Supermercado,
      name: 'Supermercado',
    },
    {
      key: BusinessModel.Restaurante,
      name: 'Restaurante',
    },
    {
      key: BusinessModel.Mayorista,
      name: 'Mayorista',
    },
    {
      key: BusinessModel.Minorista,
      name: 'Minorista',
    },
    {
      key: BusinessModel.Panaderia,
      name: 'Panadería',
    },
    {
      key: BusinessModel.TiendaRopa,
      name: 'Tienda de Ropa',
    },
    {
      key: BusinessModel.Bar,
      name: 'Bar',
    },
    {
      key: BusinessModel.Estetica,
      name: 'Estética',
    },
    {
      key: BusinessModel.Peluqueria,
      name: 'Peluquería',
    },
    {
      key: BusinessModel.SuscripcionesYMembresias,
      name: 'Suscripciones y membresías',
    },
    {
      key: BusinessModel.Asociacion,
      name: 'Asociación',
    },
    {
      key: BusinessModel.Otros,
      name: 'Otro tipo de negocio',
    },
  ];

  public integrations = [
    { key: 'tienda-nube', name: 'Tienda Nube' },
    { key: 'woo-commerce', name: 'WooCommerce' },
    { key: 'facturacion-electronica', name: 'Facturación Electrónica' },
    { key: 'mercado-libre', name: 'Mercado Libre' },
  ];

  public modules = [
    { key: 'ventas', name: 'Ventas' },
    { key: 'compras', name: 'Compras' },
    { key: 'stock', name: 'Stock' },
    { key: 'caja', name: 'Caja' },
    { key: 'produccion', name: 'Producción' },
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

    // Crear FormControls para cada módulo
    const moduleControls: any = {};
    this.modules.forEach((module) => {
      moduleControls[module.key] = [false];
    });

    this.registerForm = this._fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      companyName: ['', [Validators.required, Validators.minLength(2), Validators.pattern('^[a-zA-Z0-9]+$')]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      country: ['', [Validators.required]],
      businessModel: ['', [Validators.required]],
      integrations: this._fb.group(integrationControls),
      modules: this._fb.group(moduleControls),
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

    // Obtener módulos seleccionados
    const selectedModules = this.modules
      .filter((module) => this.registerForm.get(`modules.${module.key}`)?.value)
      .map((module) => module.key);

    const registerData = {
      fullName: this.registerForm.value.fullName,
      companyName: this.registerForm.value.companyName,
      email: this.registerForm.value.email,
      phone: this.registerForm.value.phone,
      country: this.registerForm.value.country,
      businessModel: selectedBusinessModel.key,
      integrations: selectedIntegrations,
      modules: selectedModules,
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
