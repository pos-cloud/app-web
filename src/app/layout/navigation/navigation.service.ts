import { Injectable } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { User } from '@types';
import { BehaviorSubject, Observable } from 'rxjs';
import { AnalyticsService } from 'app/core/services/analytics.service';
import { AuthService } from 'app/core/services/auth.service';
import { NavLayout, NavNode } from './navigation.types';

const SIDEBAR_COLLAPSED_KEY = 'nav.sidebarCollapsed';
const NAV_LAYOUT_KEY = 'nav.layout';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  private readonly menuSubject = new BehaviorSubject<NavNode[]>([]);
  private readonly collapsedSubject = new BehaviorSubject<boolean>(
    localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true'
  );
  private readonly mobileOpenSubject = new BehaviorSubject<boolean>(false);
  private readonly hideMenuSubject = new BehaviorSubject<boolean>(true);
  private readonly peekOpenSubject = new BehaviorSubject<boolean>(false);
  private readonly layoutSubject = new BehaviorSubject<NavLayout>(this.readLayout());

  readonly menu$: Observable<NavNode[]> = this.menuSubject.asObservable();
  readonly collapsed$: Observable<boolean> = this.collapsedSubject.asObservable();
  readonly mobileOpen$: Observable<boolean> = this.mobileOpenSubject.asObservable();
  readonly hideMenu$: Observable<boolean> = this.hideMenuSubject.asObservable();
  readonly peekOpen$: Observable<boolean> = this.peekOpenSubject.asObservable();
  readonly layout$: Observable<NavLayout> = this.layoutSubject.asObservable();

  constructor(
    private _authService: AuthService,
    private _router: Router,
    private _analyticsService: AnalyticsService
  ) {
    this.hideMenuSubject.next(this.shouldHideMenu(this._router.url || '/'));

    this._authService.getIdentity.subscribe((identity) => {
      if (identity) {
        this.menuSubject.next(this.buildMenu(identity));
        this.hideMenuSubject.next(this.shouldHideMenu(this._router.url || '/'));
      } else {
        this.menuSubject.next([]);
        this.hideMenuSubject.next(true);
      }
      this.applyBodyClasses();
    });

    this._router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.hideMenuSubject.next(this.shouldHideMenu(event.url));
        this.mobileOpenSubject.next(false);
        this.clearPeekTimer();
        this.peekOpenSubject.next(false);
      }
    });

    this.applyBodyClasses();
    this.collapsed$.subscribe(() => this.applyBodyClasses());
    this.hideMenu$.subscribe(() => this.applyBodyClasses());
    this.mobileOpen$.subscribe(() => this.applyBodyClasses());
    this.peekOpen$.subscribe(() => this.applyBodyClasses());
    this.layout$.subscribe(() => this.applyBodyClasses());
  }

  get collapsed(): boolean {
    return this.collapsedSubject.value;
  }

  get mobileOpen(): boolean {
    return this.mobileOpenSubject.value;
  }

  get hideMenu(): boolean {
    return this.hideMenuSubject.value;
  }

  get peekOpen(): boolean {
    return this.peekOpenSubject.value;
  }

  get layout(): NavLayout {
    return this.layoutSubject.value;
  }

  get isSidebarLayout(): boolean {
    return this.layout === 'sidebar';
  }

  get isHorizontalLayout(): boolean {
    return this.layout === 'horizontal';
  }

  /** Guarda preferencia y recarga para aplicar el layout limpio. */
  switchLayoutAndReload(layout: NavLayout): void {
    if (layout === this.layout) {
      return;
    }
    localStorage.setItem(NAV_LAYOUT_KEY, layout);
    this._analyticsService.trackNavLayout(layout, 'switch');
    window.location.reload();
  }

  toggleLayoutAndReload(): void {
    this.switchLayoutAndReload(this.isSidebarLayout ? 'horizontal' : 'sidebar');
  }

  toggleCollapsed(): void {
    const next = !this.collapsedSubject.value;
    this.collapsedSubject.next(next);
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
    if (!next) {
      this.peekOpenSubject.next(false);
    }
  }

  collapse(): void {
    if (!this.collapsedSubject.value) {
      this.collapsedSubject.next(true);
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, 'true');
    }
    this.clearPeekTimer();
    this.peekOpenSubject.next(false);
  }

  setPeekOpen(open: boolean): void {
    if (!this.collapsedSubject.value) {
      this.clearPeekTimer();
      this.peekOpenSubject.next(false);
      return;
    }

    if (open) {
      this.clearPeekTimer();
      this.peekOpenSubject.next(true);
      return;
    }

    this.requestPeekClose();
  }

  closePeek(): void {
    this.clearPeekTimer();
    this.peekOpenSubject.next(false);
  }

  private peekCloseTimer: ReturnType<typeof setTimeout> | null = null;

  private requestPeekClose(): void {
    this.clearPeekTimer();
    this.peekCloseTimer = setTimeout(() => {
      this.peekOpenSubject.next(false);
      this.peekCloseTimer = null;
    }, 180);
  }

  private clearPeekTimer(): void {
    if (this.peekCloseTimer) {
      clearTimeout(this.peekCloseTimer);
      this.peekCloseTimer = null;
    }
  }

  setMobileOpen(open: boolean): void {
    this.mobileOpenSubject.next(open);
  }

  toggleMobileOpen(): void {
    this.mobileOpenSubject.next(!this.mobileOpenSubject.value);
  }

  closeMobile(): void {
    this.mobileOpenSubject.next(false);
  }

  private readLayout(): NavLayout {
    const saved = localStorage.getItem(NAV_LAYOUT_KEY);
    return saved === 'horizontal' ? 'horizontal' : 'sidebar';
  }

  private applyBodyClasses(): void {
    const body = document.body;
    const navVisible = !this.hideMenuSubject.value;
    const isSidebar = this.layoutSubject.value === 'sidebar';
    const collapsed = this.collapsedSubject.value;
    const peek = this.peekOpenSubject.value;

    body.classList.toggle('nav-layout-sidebar', isSidebar);
    body.classList.toggle('nav-layout-horizontal', !isSidebar);
    body.classList.toggle('nav-sidebar-visible', navVisible && isSidebar);
    body.classList.toggle('nav-horizontal-visible', navVisible && !isSidebar);
    body.classList.toggle('nav-sidebar-collapsed', navVisible && isSidebar && collapsed);
    body.classList.toggle('nav-sidebar-expanded', navVisible && isSidebar && !collapsed);
    body.classList.toggle('nav-sidebar-peek', navVisible && isSidebar && collapsed && peek);
    body.classList.toggle('nav-sidebar-mobile-open', navVisible && isSidebar && this.mobileOpenSubject.value);
  }

  private shouldHideMenu(url: string): boolean {
    const pathLocation: string[] = url.split('?')[0].split('/');
    const fullPath = url.split('?')[0];

    if (
      fullPath.includes('/menu') ||
      fullPath.includes('galleries/view') ||
      fullPath.includes('politicas-de-privacidad')
    ) {
      return true;
    }

    return (
      pathLocation[1] === 'login' ||
      pathLocation[1] === 'registrar' ||
      pathLocation[1] === 'politicas-de-privacidad' ||
      pathLocation[2] === 'retiro-de-pedidos' ||
      pathLocation[2] === 'armado-de-pedidos' ||
      pathLocation[2] === 'cocina' ||
      pathLocation[3] === 'agregar-transaccion' ||
      pathLocation[3] === 'editar-transaccion' ||
      pathLocation[7] === 'agregar-transaccion' ||
      pathLocation[7] === 'editar-transaccion' ||
      pathLocation[8] === 'agregar-transaccion' ||
      pathLocation[2] === 'ver-galeria' ||
      (pathLocation[1] === 'transaction' && pathLocation[2] === 'view' && pathLocation[3] === 'formal')
    );
  }

  buildMenu(user: User): NavNode[] {
    if (!user?.permission) {
      return [];
    }

    const menu: NavNode[] = [];

    if (user?.permission?.menu?.sales) {
      const child: NavNode[] = [];

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

      if (user?.permission?.menu?.sales?.app) {
        child.push({ label: 'App', link: 'pos/app' });
      }

      if (child.length) {
        menu.push({
          label: 'Ventas',
          icon: 'fa fa-fax',
          children: child,
        });
      }
    }

    if (user?.permission?.menu?.purchases) {
      menu.push({
        label: 'Compras',
        icon: 'fa fa-clipboard',
        link: 'pos/mostrador/compra',
      });
    }

    if (user?.permission?.menu?.appointments) {
      menu.push({
        label: 'Turnos',
        icon: 'fa fa-calendar',
        link: 'pos/appointments',
      });
    }

    if (user?.permission?.menu?.subscription) {
      menu.push({
        label: 'Suscripciones',
        icon: 'fa fa-refresh',
        link: 'pos/subscription',
      });
    }

    if (user?.permission?.menu?.stock) {
      menu.push({
        label: 'Stock',
        icon: 'fa fa-dropbox',
        link: 'pos/mostrador/stock',
      });
    }

    if (user?.permission?.menu?.money) {
      menu.push({
        label: 'Fondos',
        icon: 'fa fa-money',
        link: 'pos/mostrador/fondo',
      });
    }

    if (user?.permission?.menu?.production) {
      menu.push({
        label: 'Producción',
        icon: 'fa fa-paste',
        link: 'pos/mostrador/production',
      });
    }

    if (user?.permission?.menu?.articles) {
      menu.push({
        label: 'Productos',
        icon: 'fa fa-shopping-basket',
        children: [
          { label: 'Productos', link: 'entities/articles' },
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
          { label: 'Estructura', link: 'entities/structures' },
          { label: 'Clasificaciones', link: 'entities/classification' },
          { label: 'Unidad de medida', link: 'entities/unit-of-measurements' },
        ],
      });
    }

    if (user?.permission?.menu?.companies?.client || user?.permission?.menu?.companies?.provider) {
      const companies: NavNode[] = [];

      if (user.permission.menu.companies.client) {
        companies.push({ label: 'Clientes', link: 'entities/companies/client' });
      }

      if (user.permission.menu.companies.provider) {
        companies.push({ label: 'Proveedores', link: 'entities/companies/provider' });
      }

      companies.push({ label: '', isDivider: true }, { label: 'Grupo de empresa', link: 'entities/company-groups' });

      menu.push({
        label: 'Empresas',
        icon: 'fa fa-male',
        children: companies,
      });
    }

    if (user.permission.menu.resto) {
      menu.push({
        label: 'Resto',
        icon: 'fa fa-cutlery',
        children: [
          { label: 'Mesas', link: 'entities/tables' },
          { label: 'Salones', link: 'entities/rooms' },
        ],
      });
    }

    if (user.permission.menu.gallery) {
      menu.push({
        label: 'Contenido',
        icon: 'fa fa-image',
        children: [
          { label: 'Recursos', link: 'entities/resources' },
          { label: 'Galerías', link: 'entities/galleries' },
        ],
      });
    }

    if (user.permission.menu.report) {
      menu.push({
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
                  { label: 'Movimientos de Productos', link: 'entities/movements-of-articles/venta' },
                  { label: 'Movimientos de Caja', link: 'entities/movements-of-cashes/venta' },
                  { label: 'Cancelaciones', link: 'entities/movements-of-cancellation/venta' },
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
                  { label: 'Por hora', link: 'reports/transactions-by-hour/venta' },
                  { label: 'Cuentas Corrientes', link: 'reports/account-receivables/cliente' },
                  { label: 'Cuentas Corrientes a fecha', link: 'reports/account-receivables-by-date/cliente' },
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
                  { label: 'Movimientos de Productos', link: 'entities/movements-of-articles/compra' },
                  { label: 'Movimientos de Caja', link: 'entities/movements-of-cashes/compra' },
                  { label: 'Cancelaciones', link: 'entities/movements-of-cancellation/compra' },
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
                  { label: 'Por hora', link: 'reports/transactions-by-hour/compra' },
                  { label: 'Cuentas Corrientes', link: 'reports/account-receivables/proveedor' },
                  { label: 'Cuentas Corrientes a fecha', link: 'reports/account-receivables-by-date/proveedor' },
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
                  { label: 'Movimientos de Productos', link: 'entities/movements-of-articles/stock' },
                ],
              },
              {
                label: 'Reportes',
                children: [
                  { label: 'Inventario', link: 'entities/article-stock' },
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
                  { label: 'Movimientos de Productos', link: 'entities/movements-of-articles/production' },
                  { label: 'Cancelaciones', link: 'entities/movements-of-cancellation/production' },
                ],
              },
              {
                label: 'Reportes',
                children: [
                  { label: 'Por productos', link: 'reports/mov-art-by-article/producción' },
                  { label: 'Por marcas', link: 'reports/mov-art-by-make/producción' },
                  { label: 'Por categorias', link: 'reports/mov-art-by-category/producción' },
                  { label: 'Por empleado', link: 'reports/transactions-by-employee/producción' },
                  { label: 'Por tipo de transacción', link: 'reports/transactions-by-type/producción' },
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
                  { label: 'Movimientos de Caja', link: 'entities/movements-of-cashes/fondos' },
                  { label: 'Cajas', link: 'entities/cash-boxes' },
                ],
              },
              {
                label: 'Reportes',
                children: [
                  { label: 'Cartera de cheques', link: 'reports/check-wallet' },
                  { label: 'Kardex de cheques', link: 'reports/check-ledger' },
                ],
              },
            ],
          },
          {
            label: 'Suscripción',
            children: [
              { label: 'Dashboard', link: 'reports/subscription' },
              { label: 'Socios activos', link: 'reports/active-members' },
            ],
          },
          {
            label: 'Otros',
            children: [
              { label: 'Dashboard', link: 'reports/dashboard' },
              { label: 'Cumpleaños', link: 'reports/birthday' },
              { label: 'Kardex de método de pago', link: 'reports/payment-methods' },
              { label: 'Historial por cliente', link: 'reports/mov-art-by-company' },
            ],
          },
        ],
      });
    }

    if (user.permission.menu.config) {
      menu.push({
        label: 'Configuraciones',
        icon: 'fa fa-gears',
        children: [
          {
            label: 'General',
            children: [
              { label: 'Aplicaciones', link: 'entities/applications' },
              { label: 'Tipos de Transacciones', link: 'entities/transaction-types' },
              { label: 'Tipos de Cancelaciones', link: 'entities/cancellation-types' },
              { label: 'Promociones', link: 'entities/business-rules' },
              { label: 'Tipos de Relaciones', link: 'entities/relation-type' },
              { label: 'Tipos de Identificación', link: 'entities/identification-type' },
              { label: 'Condiciones de IVA', link: 'entities/vat-condition' },
              { label: 'Métodos de pago', link: 'entities/payment-methods' },
              { label: 'Métodos de entrega', link: 'entities/shipment-methods' },
              { label: 'Lista de Precios', link: 'entities/price-list' },
              { label: 'Reports', link: 'reports' },
              { label: 'Historial', link: 'histories' },
              { label: 'Sistema', link: 'admin/configuraciones' },
            ],
          },
          {
            label: 'Gestión de Usuarios',
            children: [
              { label: 'Usuarios Sistema', link: 'entities/users' },
              { label: 'Empleados', link: 'entities/employees' },
              { label: 'Tipos de Empleado', link: 'entities/employee-types' },
              { label: 'Permisos', link: 'entities/permissions' },
            ],
          },
          {
            label: 'Contabilidad',
            children: [
              { label: 'Cuenta contable', link: 'entities/accounts' },
              { label: 'Periodos contable', link: 'entities/account-periods' },
              { label: 'Asientos contable', link: 'entities/account-seat' },
              { label: 'Impuestos', link: 'entities/taxes' },
              { label: 'Tipos de cajas', link: 'entities/cash-box-types' },
              { label: 'Usos de CFDI', link: 'admin/usos-de-cfdi' },
              { label: 'Feriados', link: 'entities/holidays' },
            ],
          },
          {
            label: 'Sucursales y Puntos de Venta',
            children: [
              { label: 'Sucursales', link: 'entities/branches' },
              { label: 'Puntos de venta', link: 'entities/origins' },
              { label: 'Transportes', link: 'entities/transports' },
            ],
          },
          {
            label: 'Monedas y Bancos',
            children: [
              { label: 'Bancos', link: 'entities/banks' },
              { label: 'Monedas', link: 'entities/currencies' },
              { label: 'Tipos de Monedas', link: 'entities/currency-values' },
              { label: 'Provincias', link: 'entities/states' },
              { label: 'Países', link: 'entities/countries' },
            ],
          },
          {
            label: 'Impresoras y Plantillas',
            children: [
              { label: 'Impresoras', link: 'entities/printers' },
              { label: 'Plantillas para correo', link: 'entities/email-templates' },
            ],
          },
        ],
      });
    }

    return menu;
  }
}
