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
  private externalReference: string | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
  }

  prepareLicenseData() {
    let licenseData = {
      items:{
        id: "1",
        title: "Plan Basico",
        quantity: 1,
        currency_id: "ARS",
        unit_price: 100,
      },
    };
    return licenseData;
  }

  async getPublicKey() {
    try {
      const response = await firstValueFrom(
        this.http.get<any>(`${environment.apiLicense}/key/get-public-key`)
      );
      return response;
    } catch (error) {
      console.error("Error al obtener la clave pública:", error);
      throw error;
    }
  }

  getLicenseStatus(
    fechaReferencia: Date,
    licensePaymentDueDate: Date,
    expirationLicenseDate: Date
  ): {
    status: string,
    alertType: 'success' | 'warning' | 'danger'
  } {
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
    const publicKey = await this.getPublicKey();
    this.mp = new window.MercadoPago(publicKey.publicKey, {
      locale: "es-AR",
    });
  }

  async createPreference(): Promise<any> {
    try {
      const preferenceData = {
        ...this.prepareLicenseData(),
        external_reference: this.externalReference
      };
      const response = await firstValueFrom(
        this.http.post<any>(`${environment.apiLicense}/preferences/create-preference`, preferenceData)
      );
      return response;
    } catch (error) {
      console.error("Error al crear la preferencia:", error);
      throw error;
    }
  }

  async createPaymentBrick(containerId: string, payer: object, external_reference: string) {
    await this.initializeMercadoPago();

    this.externalReference = external_reference;

    if (!this.mp) {
      console.error('MercadoPago no inicializado');
      return;
    }

    const licenseData = this.prepareLicenseData();
    const amount = licenseData.items.unit_price;
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
              if (!formData || Object.keys(formData).length === 0) {
                const container = document.getElementById(containerId); // Usar el ID del contenedor
                if (container) {
                  container.innerHTML = `
                    <div class="alert alert-info">
                      <h4>El proceso de pago continuará en la plataforma de mercado Pago.</h4>
                      <p>Por favor espere hasta que el pago se complete.</p>
                    </div>
                  `;
                  return; 
                }
              }
              formData.external_reference = this.externalReference;

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
