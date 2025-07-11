import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { User } from 'app/components/user/user';
import { filter } from 'rxjs/operators';
import { AuthService } from './auth.service';

declare global {
  interface Window {
    plausible: any;
  }
}

@Injectable({
  providedIn: 'root',
})
export class PlausibleService {
  private currentUser: User | null = null;
  private currentCompany: string | null = null;

  constructor(private authService: AuthService, private router: Router) {
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

      // Debug: mostrar en consola para verificar que se está enviando
      console.log('Plausible props enviadas:', props);
    }
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
      }, 500);
    }
  }
}
