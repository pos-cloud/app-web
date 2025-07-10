import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { loadMercadoPago } from '@mercadopago/sdk-js';
import { environment } from 'environments/environment';
import { firstValueFrom } from 'rxjs';

declare global {
  interface Window {
    MercadoPago: any;
  }
}

interface LicenseData {
  id: number;
  title: string;
  quantity: number;
  currency_id: string;
  unit_price: number;
}

@Injectable({
  providedIn: 'root',
})
export class LicenseService {
  private mp: any;
  private externalReference: string | null = null;

  constructor(private http: HttpClient, private router: Router) {}

  async getPublicKey() {
    try {
      const response = await firstValueFrom(
        this.http.get<{ publicKey: string }>(`${environment.apiLicense}/key/get-public-key`)
      );
      return response;
    } catch (error) {
      console.error('Error al obtener la clave pública:', error);
      throw error;
    }
  }

  async prepareLicenseData(licenseType: number): Promise<LicenseData> {
    try {
      const response = await firstValueFrom(
        this.http.get<LicenseData>(`${environment.apiLicense}/licenses/get-license-data/${licenseType}`)
      );
      return response;
    } catch (error) {
      console.error('Error al obtener los datos de la licencia:', error);
      throw error;
    }
  }

  getLicenseStatus(
    fechaReferencia: Date,
    licensePaymentDueDateString: string,
    expirationLicenseDateString: string
  ): { status: string; alertType: 'success' | 'warning' | 'danger' } {
    const licensePaymentDueDate = new Date(licensePaymentDueDateString);
    const expirationLicenseDate = new Date(expirationLicenseDateString);

    if (fechaReferencia < licensePaymentDueDate) {
      return { status: 'Activa', alertType: 'success' };
    } else if (fechaReferencia < expirationLicenseDate) {
      return { status: 'Por vencer', alertType: 'warning' };
    } else {
      return { status: 'Vencida', alertType: 'danger' };
    }
  }

  getLicenseTypeLabel(type: number): string {
    switch (type) {
      case 0:
        return 'Free';
      case 1:
        return 'Basic';
      case 2:
        return 'Pro';
      case 3:
        return 'Max';
      default:
        return 'Desconocido';
    }
  }

  async initializeMercadoPago(): Promise<void> {
    await loadMercadoPago();
    const publicKey = await this.getPublicKey();
    this.mp = new window.MercadoPago(publicKey.publicKey, {
      locale: 'es-AR',
    });
  }

  async createPreference(licenseData: LicenseData): Promise<any> {
    try {
      const preferenceData = {
        items: {
          id: licenseData.id.toString(),
          title: licenseData.title,
          quantity: 1,
          currency_id: licenseData.currency_id || 'ARS',
          unit_price: licenseData.unit_price,
        },
        external_reference: this.externalReference,
      };
      const response = await firstValueFrom(
        this.http.post<any>(`${environment.apiLicense}/preferences/create-preference`, preferenceData)
      );
      return response;
    } catch (error) {
      console.error('Error al crear la preferencia:', error);
      throw error;
    }
  }

  async createPaymentBrick(
    containerId: string,
    payer: object,
    external_reference: string,
    licenseType: number,
    callbacks?: { onReady?: () => void; onError?: (err: any) => void; onPayment?: () => void }
  ): Promise<void> {
    try {
      await this.initializeMercadoPago();
      this.externalReference = external_reference;

      if (!this.mp) {
        throw new Error('MercadoPago no inicializado');
      }

      const licenseData = await this.prepareLicenseData(licenseType);
      const preference = await this.createPreference(licenseData);
      const bricksBuilder = await this.mp.bricks();

      const amount = licenseData.unit_price;
      const preferenceId = preference.id;

      await bricksBuilder.create('payment', containerId, {
        initialization: {
          amount,
          preferenceId,
        },
        customization: {
          visual: { style: { theme: 'default' } },
          paymentMethods: {
            mercadoPago: 'all',
            wallet_purchase: 'all',
            maxInstallments: 1,
          },
        },
        callbacks: {
          onReady: () => {
            callbacks?.onReady?.();
          },
          onSubmit: async ({ formData }: { formData: any }) => {
            try {
              if (!formData || Object.keys(formData).length === 0) {
                const container = document.getElementById(containerId);
                if (container) container.innerHTML = '';
                callbacks?.onPayment?.();
                return;
              }

              formData.external_reference = this.externalReference;
              const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

              const data = await firstValueFrom(
                this.http.post(`${environment.apiLicense}/payments/create-payment`, formData, { headers })
              );

              this.router.navigate(['/']);
            } catch (error: any) {
              console.error('Error en el pago:', error?.error || error?.message);
            }
          },
          onError: (error: any) => {
            console.error('Error en Payment Brick:', error);
            callbacks?.onError?.(error);
          },
        },
      });
    } catch (error) {
      console.error('Error al crear el Payment Brick:', error);
      callbacks?.onError?.(error);
    }
  }
}
