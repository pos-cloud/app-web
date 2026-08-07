import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { User } from '@types';
import { filter } from 'rxjs/operators';
import { AuthService } from './auth.service';

declare global {
  interface Window {
    plausible: any;
  }
}

const NAV_LAYOUT_KEY = 'nav.layout';

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private currentUser: User | null = null;
  private currentCompany: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    // Obtener información del usuario actual
    this.authService.getIdentity.subscribe((identity) => {
      this.currentUser = identity;
      // Actualizar cuando cambie el usuario
      if (identity && this.currentCompany) {
        this.sendPageviewWithCompany();
      }
    });

    // Obtener información de la compañía
    this.currentCompany = localStorage.getItem('company');

    // Automáticamente enviar la company en cada navegación
    this.setupAutomaticTracking();
  }

  /**
   * Configura el tracking automático para que siempre envíe la company
   */
  private setupAutomaticTracking() {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
      if (this.currentCompany) {
        // Pequeño delay para asegurar que Plausible esté listo
        setTimeout(() => {
          this.sendPageviewWithCompany();
        }, 100);
      }
    });
  }

  /**
   * Envía automáticamente la company a Plausible
   */
  private sendPageviewWithCompany() {
    if (typeof window !== 'undefined' && window.plausible && this.currentCompany) {
      // Crear las propiedades que se enviarán a Plausible
      const props: any = {
        company: this.currentCompany, // Esta es la propiedad principal que verás en Plausible
        nav_layout: this.getNavLayout(),
      };

      // Agregar info adicional si está disponible
      if (this.currentUser) {
        props.user_level = this.currentUser.level || 99;
        if (this.currentUser.employee?.type?.description) {
          props.user_type = this.currentUser.employee.type.description;
        }
      }

      // Enviar a Plausible
      window.plausible('pageview', { props });
    }
  }

  /**
   * Evento custom de Plausible (requiere goal configurado en el dashboard).
   */
  trackEvent(eventName: string, extraProps: Record<string, string | number | boolean> = {}): void {
    if (typeof window === 'undefined' || !window.plausible) {
      return;
    }

    const props: Record<string, string | number | boolean> = {
      ...extraProps,
      nav_layout: this.getNavLayout(),
    };

    if (this.currentCompany) {
      props.company = this.currentCompany;
    }

    window.plausible(eventName, { props });
  }

  trackNavLayout(layout: 'sidebar' | 'horizontal', source: 'session' | 'switch' = 'session'): void {
    this.trackEvent('Nav Layout', {
      layout,
      source,
    });
  }

  private getNavLayout(): 'sidebar' | 'horizontal' {
    return localStorage.getItem(NAV_LAYOUT_KEY) === 'horizontal' ? 'horizontal' : 'sidebar';
  }

  /**
   * Actualiza la información del cliente cuando cambia (solo para login)
   */
  updateClient(companyName: string) {
    this.currentCompany = companyName;
    localStorage.setItem('company', companyName);
    // Enviar inmediatamente después de login
    setTimeout(() => {
      this.sendPageviewWithCompany();
      this.trackNavLayout(this.getNavLayout(), 'session');
    }, 200);
  }

  /**
   * Inicializa el tracking (se llama una sola vez al cargar la app)
   */
  initializeTracking() {
    if (this.currentCompany) {
      // Delay inicial para asegurar que Plausible esté cargado
      setTimeout(() => {
        this.sendPageviewWithCompany();
        this.trackNavLayout(this.getNavLayout(), 'session');
      }, 500);
    }
  }
}
