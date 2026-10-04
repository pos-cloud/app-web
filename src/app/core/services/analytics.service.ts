import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

declare global {
  interface Window {
    plausible: any;
  }
}

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private currentCompany: string | null = null;

  constructor(private router: Router) {
    this.currentCompany = localStorage.getItem('company');
    this.setupAutomaticTracking();
  }

  private setupAutomaticTracking() {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      if (this.currentCompany) {
        setTimeout(() => this.sendPageviewWithCompany(), 100);
      }
    });
  }

  private sendPageviewWithCompany() {
    if (typeof window !== 'undefined' && window.plausible && this.currentCompany) {
      window.plausible('pageview', { props: { company: this.currentCompany } });
    }
  }

  trackEvent(eventName: string, extraProps: Record<string, string | number | boolean> = {}): void {
    if (typeof window === 'undefined' || !window.plausible) {
      return;
    }

    const props: Record<string, string | number | boolean> = { ...extraProps };

    if (this.currentCompany) {
      props.company = this.currentCompany;
    }

    window.plausible(eventName, { props });
  }

  /** Uso de un módulo del menú. En Plausible: goal "Modulo" + property "modulo". */
  trackModule(modulo: string): void {
    this.trackEvent('Modulo', { modulo });
  }

  updateClient(companyName: string) {
    this.currentCompany = companyName;
    localStorage.setItem('company', companyName);
    setTimeout(() => this.sendPageviewWithCompany(), 200);
  }

  initializeTracking() {
    if (this.currentCompany) {
      setTimeout(() => this.sendPageviewWithCompany(), 500);
    }
  }
}
