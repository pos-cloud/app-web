import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { User } from '@types';
import { filter } from 'rxjs/operators';
import { AuthService } from './auth.service';

declare global {
  interface Window {
    plausible: any;
    umami?: {
      identify: (uniqueIdOrData: string | Record<string, any>, data?: Record<string, any>) => void | Promise<any>;
    };
  }
}

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private currentUser: User | null = null;
  private currentCompany: string | null = null;

  constructor(private authService: AuthService, private router: Router) {
    // Obtener información del usuario actual
    this.authService.getIdentity.subscribe((identity) => {
      this.currentUser = identity;
      // Actualizar cuando cambie el usuario
      if (identity && this.currentCompany) {
        this.sendPageviewWithCompany();
        this.syncUmamiSessionData();
      }
    });

    // Obtener información de la compañía
    this.currentCompany = localStorage.getItem('company');

    // Automáticamente enviar la company en cada navegación
    this.setupAutomaticTracking();
  }

  /**
   * Sincroniza datos de sesión en Umami (1 vez por sesión/actualización de identity).
   * Esto permite segmentar "uso por company" sin instrumentar cada pantalla.
   */
  private syncUmamiSessionData() {
    if (typeof window === 'undefined' || !window.umami?.identify || !this.currentCompany) {
      return;
    }

    try {
      window.umami.identify({ company: this.currentCompany });
    } catch {
      // noop: analytics nunca debe romper flujo de la app
    }
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
   * Actualiza la información del cliente cuando cambia (solo para login)
   */
  updateClient(companyName: string) {
    this.currentCompany = companyName;
    localStorage.setItem('company', companyName);
    this.syncUmamiSessionData();
    // Enviar inmediatamente después de login
    setTimeout(() => {
      this.sendPageviewWithCompany();
    }, 200);
  }

  /**
   * Inicializa el tracking (se llama una sola vez al cargar la app)
   */
  initializeTracking() {
    if (this.currentCompany) {
      this.syncUmamiSessionData();
      // Delay inicial para asegurar que Plausible esté cargado
      setTimeout(() => {
        this.sendPageviewWithCompany();
      }, 500);
    }
  }
}

