import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from 'environments/environment';
import { loadMercadoPago } from "@mercadopago/sdk-js";
import { Router } from '@angular/router';


declare global {
  interface Window {
    MercadoPago: any;
  }
}

@Injectable({
  providedIn: 'root',
})
export class LicenseService {
  private mp: any;

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
  }

  prepareLicenseData() {
    let licenseData = {
      id: "1",
      title: "Plan Basico",
      quantity: 1,
      currency_id: "ARS",
      unit_price: 100,
    };
    return licenseData;
  }

  getLicenseStatus(
    fechaReferencia: Date,
    licensePaymentDueDate: Date,
    expirationLicenseDate: Date
  ): {
    status: string,
    alertType: 'success' | 'warning' | 'danger'
  } {
    console.log(fechaReferencia, licensePaymentDueDate, expirationLicenseDate);
    if (fechaReferencia < licensePaymentDueDate) {
      return { status: 'Activa', alertType: 'success' };
    } else if (fechaReferencia < expirationLicenseDate) {
      return { status: 'Con recargo', alertType: 'warning' };
    } else {
      return { status: 'Vencida', alertType: 'danger' };
    }
  }
  
  getLicenseTypeLabel(type: number): string {
    //este dato debería traerse desde la api license cuando se puedan traer los datos de licencia
    switch (type) {
      case 1:
        return 'Básico';
      case 2:
        return 'Standard';
      case 3:
        return 'Premium';
      default:
        return 'Desconocido';
    }
  }

  async initializeMercadoPago() {
    await loadMercadoPago();

    this.mp = new window.MercadoPago("APP_USR-3e6fe769-4628-4c46-b2f8-7a472fc09e70", {
      locale: "es-AR",
    });
  }

  async createPreference(): Promise<any> {
    try {
      let preferenceData = this.prepareLicenseData();
      const response = await firstValueFrom(
        this.http.post<any>(`${environment.apiLicense}/preferences/create-preference`, preferenceData)
      );
      return response;
    } catch (error) {
      console.error("Error al crear la preferencia:", error);
      throw error;
    }
  }

  async createPaymentBrick(containerId: string, payer: object) {
    await this.initializeMercadoPago();


    if (!this.mp) {
      console.error('MercadoPago no inicializado');
      return;
    }

    const licenseData = this.prepareLicenseData();
    const amount = licenseData.unit_price;
    const bricksBuilder = await this.mp.bricks();
    const preference = await this.createPreference();
    const preferenceId = preference.preferenceId;
    try {
      await bricksBuilder.create("payment", containerId, {
        initialization: {
          amount,
          preferenceId,
          payer,
        },
        customization: {
          visual: {
            style: { theme: "default" },
          },
          paymentMethods: {
            creditCard: "all",
            debitCard: "all",
            mercadoPago: "all",
            maxInstallments: 1,
          },
        },
        callbacks: {
          onReady: () => console.log("Payment Brick listo."),
          onSubmit: async ({ formData }: { formData: any }) => {
            try {
              console.log(formData);
              const headers = new HttpHeaders({
                "Content-Type": "application/json",
              });

              const data = await firstValueFrom(
                this.http.post(
                  `${environment.apiLicense}/payments/create-payment`,
                  formData,
                  { headers }
                )
              );
              console.log("Pago procesado:", data);
              this.router.navigate(['/'])
            } catch (error: any) {
              console.error("Error en el pago:", error?.error || error?.message);
            }
          },
          onError: (error: any) =>
            console.error("Error en Payment Brick:", error),
        },
      });
    } catch (error) {
      console.error("Error al crear el Payment Brick:", error);
    }
  }
}
