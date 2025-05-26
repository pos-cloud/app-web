// ANGULAR
import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Event as NavigationEvent, NavigationStart, Router } from '@angular/router';
import { fromEvent, map, merge, Observable, of } from 'rxjs';

// DE TERCEROS
import { NgbDropdown, NgbModal } from '@ng-bootstrap/ng-bootstrap';

// MODELS
import { User } from '../../components/user/user';

// SERVICES
import { TranslateService } from '@ngx-translate/core';
import { ChangePasswordComponent } from 'app/auth/change-password/change-password.component';
import { AuthService } from 'app/core/services/auth.service';
import { PushNotificationsService } from 'app/core/services/notification.service';
import { ToastService } from 'app/shared/components/toast/toast.service';

interface NestedMenuNode {
  label: string;
  icon?: string;
  link?: string;
  isDivider?: boolean;
  children?: NestedMenuNode[];
}
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  @ViewChildren('dd') dds: QueryList<NgbDropdown>;

  menu: NestedMenuNode[] = [
    {
      label: 'Ventas',
      icon: 'fa fa-fax',
      children: [
        { label: 'Resto', link: 'pos/resto' },
        { label: 'Mostrador', link: 'pos/mostrador/venta' },
        { label: 'Delivery', link: 'pos/delivery' },
        { label: 'Lector de Vouchers', link: 'pos/lector-de-vouchers' },
        { label: 'Tienda Nube', link: 'modules/sales/tienda-nube' },
      ],
    },
    {
      label: 'Compras',
      icon: 'fa fa-clipboard',
      link: 'pos/mostrador/compra',
    },
    {
      label: 'Fondos',
      icon: 'fa fa-money',
      children: [
        { label: 'Movimientos', link: 'pos/mostrador/fondo' },
        { label: 'Cajas', link: 'admin/cajas' },
      ],
    },
    {
      label: 'Producción',
      icon: 'fa fa-paste',
      link: 'pos/mostrador/production',
    },
    {
      label: 'Stock',
      icon: 'fa fa-dropbox',
      link: 'pos/mostrador/stock',
    },
    {
      label: 'Productos',
      icon: 'fa fa-shopping-basket',
      children: [
        { label: 'Productos', link: 'admin/articles' },
        { label: 'Variantes', link: 'admin/variants' },
        { label: 'Marcas', link: 'entities/makes' },
        { label: 'Categoria', link: 'admin/categories' },
        { label: '', isDivider: true },
        { label: 'Tipos de Variantes', link: 'admin/tipos-de-variantes' },
        { label: 'Valores de Variantes', link: 'variant-values' },
        { label: '', isDivider: true },
        { label: 'Depositos', link: 'entities/deposit' },
        { label: 'Ubicaciones', link: 'entities/location' },
        { label: '', isDivider: true },
        { label: 'Estructura', link: 'admin/structures' },
        { label: 'Clasificaciones', link: 'entities/classification' },
        { label: 'Unidad de medida', link: 'entities/unit-of-measurements' },
      ],
    },
    {
      label: 'Empresas',
      icon: 'fa fa-male',
      children: [
        { label: 'Clientes', link: 'entities/companies/client' },
        { label: 'Proveedores', link: 'entities/companies/provider' },
        { label: '', isDivider: true },
        { label: 'Grupo de empresas', link: 'company-groups' },
      ],
    },
    {
      label: 'Resto',
      icon: 'fa fa-cutlery',
      children: [
        { label: 'Mesas', link: 'entities/tables' },
        { label: 'Salones', link: 'entities/rooms' },
      ],
    },
    {
      label: 'Contenido',
      icon: 'fa fa-image',
      children: [
        { label: 'Recursos', link: 'entities/resources' },
        { label: 'Galerías', link: 'entities/galleries' },
      ],
    },
    {
      label: 'Reportes',
      icon: 'fa fa-bar-chart',
      children: [
        {
          label: 'Ventas',
          children: [
            {
              label: 'Listados',
              children: [
                { label: 'Transacciones', link: 'admin/ventas' },
                { label: 'Movimientos de Productos', link: 'admin/venta/movimientos-de-productos' },
                { label: 'Movimientos de Medios', link: 'admin/venta/movimientos-de-medios' },
                { label: 'Cancelaciones', link: 'admin/venta/movimientos-de-cancellaciones' },
              ],
            },
            {
              label: 'Reportes',
              children: [
                { label: 'Estadísticas Generales', link: 'admin/venta/statistics' },
                { label: 'Productos más vendidos', link: 'admin/venta/productos-mas-vendidos' },
                { label: 'Ventas por medio de pago', link: 'admin/venta/ventas-por-metodo-de-pago' },
                { label: 'Marcas más vendidas', link: 'admin/venta/marcas-mas-vendidas' },
                { label: 'Categorias más vendidos', link: 'admin/venta/rubros-mas-vendidos' },
                { label: 'Ventas por cliente', link: 'admin/venta/ventas-por-cliente' },
                { label: 'Ventas por empleado', link: 'admin/venta/ventas-por-empleado' },
                { label: 'Ventas por tipo de transacciones', link: 'report/venta/ventas-por-tipo-de-transacción' },
              ],
            },
          ],
        },
        {
          label: 'Compras',
          children: [
            {
              label: 'Listados',
              children: [
                { label: 'Transacciones', link: 'admin/compra' },
                { label: 'Movimientos de Productos', link: 'admin/compra/movimientos-de-productos' },
                { label: 'Movimientos de Medios', link: 'admin/compra/movimientos-de-medios' },
                { label: 'Cancelaciones', link: 'admin/compra/movimientos-de-cancellaciones' },
              ],
            },
            {
              label: 'Reportes',
              children: [
                { label: 'Estadísticas Generales', link: 'admin/compra/statistics' },
                { label: 'Productos más comprados', link: 'admin/compra/productos-mas-comprados' },
                { label: 'Compras por medio de pago', link: 'admin/compras/compras-por-metodo-de-pago' },
                { label: 'Marcas', link: 'admin/compra/marcas-mas-compradas' },
                { label: 'Categorias más vendidos', link: 'admin/compra/rubros-mas-comprados' },
                { label: 'Compras por proveedor', link: 'admin/compra/compras-por-proveedor' },
                { label: 'Compras por empleado', link: 'admin/compra/compras-por-empleado' },
                { label: 'Compras por tipo de transacciones', link: 'report/compra/compras-por-tipo-de-transacción' },
              ],
            },
          ],
        },
        {
          label: 'Stock',
          children: [
            {
              label: 'Listados',
              children: [
                { label: 'Transacciones', link: 'admin/stock' },
                { label: 'Movimientos de Productos', link: 'admin/stock/movimientos-de-productos' },
                { label: 'Movimientos de Medios', link: 'admin/stock/movimientos-de-medios' },
              ],
            },
            {
              label: 'Reportes',
              children: [{ label: 'Inventario', link: 'admin/stock-de-productos' }],
            },
          ],
        },
        {
          label: 'Producción',
          children: [
            {
              label: 'Listados',
              children: [
                { label: 'Transacciones', link: 'admin/production' },
                { label: 'Movimientos de Productos', link: 'admin/production/movimientos-de-productos' },
                { label: 'Movimientos de Medios', link: 'admin/production/movimientos-de-medios' },
              ],
            },
            {
              label: 'Reportes',
              children: [{ label: 'Requerimientos de producción', link: 'reports/production/requierements' }],
            },
          ],
        },
        {
          label: 'Fondos',
          children: [
            {
              label: 'Listados',
              children: [
                { label: 'Transacciones', link: 'admin/fondos' },
                { label: 'Movimientos de Productos', link: 'admin/fondos/movimientos-de-productos' },
                { label: 'Movimientos de Medios', link: 'admin/fondos/movimientos-de-medios' },
              ],
            },
            {
              label: 'Reportes',
              children: [
                { label: 'Cartera de cheques', link: 'report/cartera-de-cheques' },
                { label: 'Kardex de cheques', link: 'cheque' },
              ],
            },
          ],
        },
        { label: 'Contable', children: [{ label: 'Suma de Saldos por Cuenta', link: 'admin/accountant/ledger' }] },
        {
          label: 'Otros',
          children: [{ label: 'Cumpleaños', link: 'admin/cumpleaños' }],
        },
      ],
    },
    {
      label: 'Configuraciones',
      icon: 'fa fa-gears',
      children: [
        {
          label: 'General',
          children: [
            { label: 'Mi negocio', link: 'admin/configuraciones' },
            { label: 'Aplicaciones', link: 'applications' },
            { label: 'Tipos de Transacciones', link: 'transaction-types' },
            { label: 'Tipos de Cancelaciones', link: 'admin/tipos-de-cancelaciones' },
            { label: 'Reglas de negocio', link: 'business-rules' },
            { label: 'Tipos de Relaciones', link: 'entities/relation-type' },
            { label: 'Tipos de Identificación', link: 'entities/identification-type' },
            { label: 'Condiciones de IVA', link: 'admin/condiciones-de-iva' },
            { label: 'Métodos de pago', link: 'admin/metodos-de-pago' },
            { label: 'Métodos de entrega', link: 'entities/shipment-methods' },
            { label: 'Lista de Precios', link: 'admin/price-list' },
            { label: 'Feriados', link: 'holidays' },
            { label: 'Reports', link: 'reports' },
            { label: 'Historial', link: 'histories' },
          ],
        },
        {
          label: 'Gestión de Usuarios',
          children: [
            { label: 'Usuarios Sistema', link: 'admin/usuarios' },
            { label: 'Usuarios Web', link: 'admin/usuarios-web' },
            { label: 'Empleados', link: 'entities/employees' },
            { label: 'Tipos de Empleado', link: 'entities/employee-types' },
            { label: 'Permisos', link: 'permissions' },
          ],
        },
        {
          label: 'Contabilidad',
          children: [
            { label: 'Cuenta contable', link: 'accounts' },
            { label: 'Periodos contable', link: 'account-periods' },
            { label: 'Asientos contable', link: 'account-seats' },
            { label: 'Impuestos', link: 'admin/impuestos' },
            { label: 'Tipos de cajas', link: 'cash-box-types' },
            { label: 'Usos de CFDI', link: 'admin/usos-de-cfdi' },
          ],
        },
        {
          label: 'Sucursales y Puntos de Venta',
          children: [
            { label: 'Sucursales', link: 'admin/sucursales' },
            { label: 'Puntos de venta', link: 'admin/puntos-de-venta' },
            { label: 'Transportes', link: 'admin/transports' },
          ],
        },
        {
          label: 'Monedas y Bancos',
          children: [
            { label: 'Bancos', link: 'entities/banks' },
            { label: 'Monedas', link: 'entities/currencies' },
            { label: 'Tipos de Monedas', link: 'entities/currency-values' },
            { label: 'Provincias', link: 'admin/states' },
            { label: 'Países', link: 'admin/countries' },
          ],
        },
        {
          label: 'Impresoras y Plantillas',
          children: [
            { label: 'Impresoras', link: 'admin/impresoras' },
            { label: 'Plantillas para correo', link: 'admin/template-emails' },
          ],
        },
      ],
    },
  ];

  public toggleNavbar = true;
  public img = 'assets/img/logo.png';
  public config$: any;
  public identity$: Observable<User>;
  public online$: Observable<boolean>;
  public online: boolean = true;
  public hideMenu: boolean = true;
  public languages = ['en', 'es', 'it'];
  public currentLanguage = 'es';

  public user: User;

  constructor(
    private _authService: AuthService,
    private _router: Router,
    private _toastService: ToastService,
    private _modalService: NgbModal,
    private translate: TranslateService,
    private _notificationService: PushNotificationsService
  ) {
    //pedimos permiso
    this._notificationService.requestPermission();
    // REVISAR INTERNET
    this.online$ = merge(
      of(navigator.onLine),
      fromEvent(window, 'online').pipe(map(() => true)),
      fromEvent(window, 'offline').pipe(map(() => false))
    );

    this.online$.subscribe((result) => {
      if (!this.online && result) {
        this._toastService.showToast({
          message: 'Conexión a internet restablecida',
          type: 'success',
        });
      }
      if (!result) {
        this._toastService.showToast({
          message: 'Se ha perdido la conexión a internet, por favor verifique su red',
          type: 'warning',
        });
      }
      this.online = result;
    });

    this.identity$ = this._authService.getIdentity;

    this._router.events.forEach((event: NavigationEvent) => {
      if (event instanceof NavigationStart) {
        const pathLocation: string[] = event.url.split('?')[0].split('/');
        if (
          pathLocation[1] === 'login' ||
          pathLocation[1] === 'registrar' ||
          pathLocation[2] === 'retiro-de-pedidos' ||
          pathLocation[2] === 'armado-de-pedidos' ||
          pathLocation[2] === 'cocina' ||
          pathLocation[3] === 'agregar-transaccion' ||
          pathLocation[3] === 'editar-transaccion' ||
          pathLocation[7] === 'agregar-transaccion' ||
          pathLocation[7] === 'editar-transaccion' ||
          pathLocation[8] === 'agregar-transaccion' ||
          pathLocation[2] === 'ver-galeria'
        ) {
          this.hideMenu = true;
        } else {
          this.hideMenu = false;
        }
      }
    });
  }

  ngOnInit(): void {
    this._authService.getIdentity.subscribe((identity) => {
      if (identity) {
        this.buildMenu(identity);
      }
    });
  }

  public actionClick() {
    this.dds.forEach((dd) => {
      dd.close();
      this.toggleMenu();
    });
  }

  public openModal(op: string): void {
    let modalRef;
    switch (op) {
      case 'soporte':
        window.open('https://api.whatsapp.com/send/?phone=5493564368535', '_blank');
        break;
      case 'changelogs':
        window.open('https://docs.poscloud.ar/books/actualizaciones', '_blank');
        break;
      case 'documentation':
        window.open('https://docs.poscloud.ar', '_blank');
        break;
      case 'change-password':
        modalRef = this._modalService.open(ChangePasswordComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.model = 'articles';
        modalRef.componentInstance.title = 'Importar artículos';
        modalRef.result.then(
          (result) => {
            if (result === 'save_close') {
              //this.refresh();
            }
          },
          (reason) => {}
        );

        break;
      default:
        break;
    }
  }

  public logout(): void {
    this._authService.logoutStorage();
  }

  public reload() {
    window.location.reload();
  }

  public toggleMenu() {
    this.toggleNavbar = !this.toggleNavbar;
  }

  public changeLanguage(lang: string): void {
    this.currentLanguage = lang;
    this.translate.use(lang).subscribe(() => {
      this.translate.reloadLang(lang);
    });
    localStorage.setItem('lang', lang);
  }

  private buildMenu(user: User) {
    if (user.permission) {
      this.menu = [];

      if (user?.permission?.menu?.sales) {
        let child = [];

        if (user?.permission?.menu?.sales?.counter) {
          child.push({ label: 'Mostrador', link: 'pos/mostrador/venta' });
        }

        if (user?.permission?.menu?.sales?.resto) {
          child.push({ label: 'Resto', link: 'pos/resto' });
        }

        if (user?.permission?.menu?.sales?.delivery) {
          child.push({ label: 'Delivery', link: 'pos/delivery' });
        }

        if (user?.permission?.menu?.sales?.voucherReader) {
          child.push({ label: 'Lector de Vouchers', link: 'pos/lector-de-vouchers' });
        }

        if (user?.permission?.menu?.sales?.tiendaNube) {
          child.push({ label: 'Tienda Nube', link: 'pos/tienda-nube' });
        }

        if (user?.permission?.menu?.sales?.wooCommerce) {
          child.push({ label: 'Woo Commerce', link: 'pos/woo-commerce' });
        }

        this.menu.push({
          label: 'Ventas',
          icon: 'fa fa-fax',
          children: child,
        });
      }

      if (user?.permission?.menu?.purchases) {
        this.menu.push({
          label: 'Compras',
          icon: 'fa fa-clipboard',
          link: 'pos/mostrador/compra',
        });
      }

      if (user?.permission?.menu?.stock) {
        this.menu.push({
          label: 'Stock',
          icon: 'fa fa-dropbox',
          link: 'pos/mostrador/stock',
        });
      }

      if (user?.permission?.menu?.money) {
        this.menu.push({
          label: 'Fondos',
          icon: 'fa fa-money',
          link: 'pos/mostrador/fondo',
        });
      }

      if (user?.permission?.menu?.production) {
        this.menu.push({
          label: 'Producción',
          icon: 'fa fa-paste',
          link: 'pos/mostrador/production',
          // children: [
          //   { label: 'Cocina', link: 'pos/cocina' },
          //   { label: 'Planta', link: 'pos/mostrador/production' },
          // ],
        });
      }

      if (user?.permission?.menu?.articles) {
        this.menu.push({
          label: 'Productos',
          icon: 'fa fa-shopping-basket',
          children: [
            { label: 'Productos', link: 'admin/articles' },
            { label: 'Variantes', link: 'admin/variants' },
            { label: 'Marcas', link: 'entities/makes' },
            { label: 'Categoria', link: 'entities/categories' },
            { label: '', isDivider: true },
            { label: 'Tipos de Variantes', link: 'entities/variant-types' },
            { label: 'Valores de Variantes', link: 'entities/variant-values' },
            { label: '', isDivider: true },
            { label: 'Depositos', link: 'entities/deposit' },
            { label: 'Ubicaciones', link: 'entities/location' },
            { label: '', isDivider: true },
            { label: 'Estructura', link: 'admin/structures' },
            { label: 'Clasificaciones', link: 'entities/classification' },
            { label: 'Unidad de medida', link: 'entities/unit-of-measurements' },
          ],
        });
      }

      if (user?.permission?.menu?.companies?.client || user?.permission?.menu?.companies?.provider) {
        let companies = [];

        if (user.permission.menu.companies.client) {
          companies.push({ label: 'Clientes', link: 'entities/companies/client' });
        }

        if (user.permission.menu.companies.provider) {
          companies.push({ label: 'Proveedores', link: 'entities/companies/provider' });
        }

        companies.push({ label: '', isDivider: true }, { label: 'Grupo de empresa', link: 'company-groups' });

        this.menu.push({
          label: 'Empresas',
          icon: 'fa fa-male',
          children: companies,
        });
      }

      if (user.permission.menu.resto) {
        this.menu.push({
          label: 'Resto',
          icon: 'fa fa-cutlery',
          children: [
            { label: 'Mesas', link: 'entities/tables' },
            { label: 'Salones', link: 'entities/rooms' },
          ],
        });
      }

      if (user.permission.menu.gallery) {
        this.menu.push({
          label: 'Contenido',
          icon: 'fa fa-image',
          children: [
            { label: 'Recursos', link: 'entities/resources' },
            { label: 'Galerías', link: 'entities/galleries' },
          ],
        });
      }

      if (user.permission.menu.report) {
        this.menu.push({
          label: 'Reportes',
          icon: 'fa fa-bar-chart',
          children: [
            {
              label: 'Ventas',
              children: [
                {
                  label: 'Listados',
                  children: [
                    { label: 'Transacciones', link: 'admin/ventas' },
                    { label: 'Movimientos de Productos', link: 'admin/venta/movimientos-de-productos' },
                    { label: 'Movimientos de Medios', link: 'admin/venta/movimientos-de-medios' },
                    { label: 'Cancelaciones', link: 'admin/venta/movimientos-de-cancellaciones' },
                  ],
                },
                {
                  label: 'Reportes',
                  children: [
                    { label: 'Estadísticas Generales', link: 'admin/venta/statistics' },
                    { label: 'Por productos', link: 'reports/mov-art-by-article/venta' },
                    { label: 'Por marcas', link: 'reports/mov-art-by-make/venta' },
                    { label: 'Por categorias', link: 'reports/mov-art-by-category/venta' },
                    { label: 'Por método de pago', link: 'reports/mov-cash-by-type/venta' },
                    { label: 'Por cliente', link: 'reports/transactions-by-company/cliente' },
                    { label: 'Por empleado', link: 'reports/transactions-by-employee/venta' },
                    { label: 'Por tipo de transacción', link: 'reports/transactions-by-type/venta' },
                    { label: 'Cuentas Corrientes', link: 'reports/account-receivables/cliente' },
                  ],
                },
              ],
            },
            {
              label: 'Compras',
              children: [
                {
                  label: 'Listados',
                  children: [
                    { label: 'Transacciones', link: 'admin/compras' },
                    { label: 'Movimientos de Productos', link: 'admin/compra/movimientos-de-productos' },
                    { label: 'Movimientos de Medios', link: 'admin/compra/movimientos-de-medios' },
                    { label: 'Cancelaciones', link: 'report/compra/movimientos-de-cancellaciones' },
                  ],
                },
                {
                  label: 'Reportes',
                  children: [
                    { label: 'Estadísticas Generales', link: 'admin/compra/statistics' },
                    { label: 'Por productos', link: 'reports/mov-art-by-article/compra' },
                    { label: 'Por marcas', link: 'reports/mov-art-by-make/compra' },
                    { label: 'Por categorias', link: 'reports/mov-art-by-category/compra' },
                    { label: 'Por método de pago', link: 'reports/mov-cash-by-type/compra' },
                    { label: 'Por proveedor', link: 'reports/transactions-by-company/proveedor' },
                    { label: 'Por empleado', link: 'reports/transactions-by-employee/compra' },
                    { label: 'Por tipo de transacción', link: 'reports/transactions-by-type/compra' },
                    { label: 'Cuentas Corrientes', link: 'reports/account-receivables/proveedor' },
                  ],
                },
              ],
            },
            {
              label: 'Stock',
              children: [
                {
                  label: 'Listados',
                  children: [
                    { label: 'Transacciones', link: 'admin/stock' },
                    { label: 'Movimientos de Productos', link: 'admin/stock/movimientos-de-productos' },
                  ],
                },
                {
                  label: 'Reportes',
                  children: [
                    { label: 'Inventario', link: 'admin/stock-de-productos' },
                    { label: 'Kardex de producto', link: 'reports/article-ledger' },
                    { label: 'Stock Valorizado', link: 'reports/inventory-valued' },
                    { label: 'Inventario por fecha', link: 'reports/inventory-for-date' },
                  ],
                },
              ],
            },
            {
              label: 'Producción',
              children: [
                {
                  label: 'Listados',
                  children: [
                    { label: 'Transacciones', link: 'admin/production' },
                    { label: 'Movimientos de Productos', link: 'admin/production/movimientos-de-productos' },
                    { label: 'Movimientos de Medios', link: 'admin/production/movimientos-de-medios' },
                  ],
                },
                {
                  label: 'Reportes',
                  children: [
                    { label: 'Por productos', link: 'reports/mov-art-by-article/produccion' },
                    { label: 'Por marcas', link: 'reports/mov-art-by-make/produccion' },
                    { label: 'Por categorias', link: 'reports/mov-art-by-category/produccion' },
                    { label: 'Por empleado', link: 'reports/transactions-by-employee/produccion' },
                    { label: 'Por tipo de transacción', link: 'reports/transactions-by-type/produccion' },
                  ],
                },
              ],
            },
            {
              label: 'Fondos',
              children: [
                {
                  label: 'Listados',
                  children: [
                    { label: 'Transacciones', link: 'admin/fondos' },
                    { label: 'Movimientos de Medios', link: 'admin/fondos/movimientos-de-medios' },
                    { label: 'Cajas', link: 'admin/cajas' },
                  ],
                },
                {
                  label: 'Reportes',
                  children: [
                    { label: 'Cartera de cheques', link: 'report/cartera-de-cheques' },
                    { label: 'Kardex de cheques', link: 'cheque' },
                  ],
                },
              ],
            },
            {
              label: 'Otros',
              children: [
                { label: 'Cumpleaños', link: 'reports/birthday' },
                { label: 'Dashboard', link: 'reports/dashboard' },
              ],
            },
          ],
        });
      }

      if (user.permission.menu.config) {
        this.menu.push({
          label: 'Configuraciones',
          icon: 'fa fa-gears',
          children: [
            {
              label: 'General',
              children: [
                { label: 'Mi empresa', link: 'admin/configuraciones' },
                { label: 'Aplicaciones', link: 'applications' },
                { label: 'Tipos de Transacciones', link: 'transaction-types' },
                { label: 'Tipos de Cancelaciones', link: 'admin/tipos-de-cancelaciones' },
                { label: 'Reglas de negocio', link: 'business-rules' },
                { label: 'Tipos de Relaciones', link: 'entities/relation-type' },
                { label: 'Tipos de Identificación', link: 'entities/identification-type' },
                { label: 'Condiciones de IVA', link: 'admin/condiciones-de-iva' },
                { label: 'Métodos de pago', link: 'admin/metodos-de-pago' },
                { label: 'Métodos de entrega', link: 'entities/shipment-methods' },
                { label: 'Lista de Precios', link: 'admin/price-list' },
                { label: 'Reports', link: 'reports' },
                { label: 'Historial', link: 'histories' },
              ],
            },
            {
              label: 'Gestión de Usuarios',
              children: [
                { label: 'Usuarios Sistema', link: 'admin/usuarios' },
                { label: 'Usuarios Web', link: 'admin/usuarios-web' },
                { label: 'Empleados', link: 'entities/employees' },
                { label: 'Tipos de Empleado', link: 'entities/employee-types' },
                { label: 'Permisos', link: 'permissions' },
              ],
            },
            {
              label: 'Contabilidad',
              children: [
                { label: 'Cuenta contable', link: 'accounts' },
                { label: 'Periodos contable', link: 'entities/account-periods' },
                { label: 'Asientos contable', link: 'account-seats' },
                { label: 'Impuestos', link: 'admin/impuestos' },
                { label: 'Tipos de cajas', link: 'cash-box-types' },
                { label: 'Usos de CFDI', link: 'admin/usos-de-cfdi' },
                { label: 'Feriados', link: 'holidays' },
              ],
            },
            {
              label: 'Sucursales y Puntos de Venta',
              children: [
                { label: 'Sucursales', link: 'entities/branches' },
                { label: 'Puntos de venta', link: 'admin/puntos-de-venta' },
                { label: 'Transportes', link: 'admin/transports' },
              ],
            },
            {
              label: 'Monedas y Bancos',
              children: [
                { label: 'Bancos', link: 'entities/banks' },
                { label: 'Monedas', link: 'entities/currencies' },
                { label: 'Tipos de Monedas', link: 'entities/currency-values' },
                { label: 'Provincias', link: 'admin/states' },
                { label: 'Países', link: 'admin/countries' },
              ],
            },
            {
              label: 'Impresoras y Plantillas',
              children: [
                { label: 'Impresoras', link: 'admin/impresoras' },
                { label: 'Plantillas para correo', link: 'admin/template-emails' },
              ],
            },
          ],
        });
      }
    }
  }
}
