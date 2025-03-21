import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from 'environments/environment';
import { loadMercadoPago } from "@mercadopago/sdk-js";


declare global {
  interface Window {
    MercadoPago: any;
    deviceId?: string;
  }
}

@Injectable({
  providedIn: 'root',
})
export class MercadoPagoService {
  private mp: any;

  constructor(
    private http: HttpClient
  ) {
  }

  async initializeMercadoPago() {
    await loadMercadoPago();

    //preguntar por el .ENV para las keys de MercadoPago
    this.mp = new window.MercadoPago("aca va la MercadoPagoPublicKey ", {
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

  prepareLicenseData() {
    //acá llamaría a api license para traer los datos actualizados de la licencia, por ahora hardcodeo unos datos
    let licenseData = {
      id: "1",
      title: "Plan Basico",
      quantity: 1,
      currency_id: "ARS",
      unit_price: 100,
    };
    return licenseData;
  }

  async createPaymentBrick(containerId: string, payer: object) {
    await this.initializeMercadoPago();

    if (!this.mp) {
      console.error('MercadoPago no inicializado');
      return;
    }

    const licenseData = this.prepareLicenseData();
    const amount = licenseData.unit_price;
    const bricksBuilder = this.mp.bricks();
    const preferenceId = await this.createPreference();
    console.log(licenseData);
    try {
      await bricksBuilder.create("payment", containerId, {
        initialization: {
          amount,
          preferenceId,
          payer,
          capture: true,
        },
        customization: {
          visual: {
            style: { theme: "default" },
          },
          paymentMethods: {
            creditCard: "all",
            debitCard: "all",
            ticket: "all",
            bankTransfer: "all",
            atm: "all",
            onboarding_credits: "all",
            wallet_purchase: "all",
            maxInstallments: 1,
          },
        },
        callbacks: {
          onReady: () => console.log("Payment Brick listo."),
          onSubmit: async ({ formData }: { formData: any }) => {
            console.log(formData);

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
