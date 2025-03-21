import { Component, OnInit, AfterViewChecked, ViewChild, ElementRef } from "@angular/core";
import { ConfigService } from 'app/core/services/config.service';
import { Config } from "app/app.config";
import { CommonModule } from "@angular/common";
import { MercadoPagoService } from "@core/services/license.service";

@Component({
    selector: 'app-license',
    templateUrl: './license.component.html',
    styleUrls: ['./license.component.scss'],
    standalone: true,
    imports: [CommonModule]
})
export class LicenseComponent implements OnInit {
    config: Config;
    licensePaymentDueDate: String;
    expirationLicenseDate: String;
    licenseType: Number;
    payer: { // Preguntar de donde sacamos concretamente la data del payer, e investigar si tiene que coincidir de alguna forma con los datos que pueda llegar a tener Mercado libre
        firstName: "Matias",
        lastName: "Olmos",
        email: "matiasolmosrivero@gmail.com",
    };

    @ViewChild('mercadoPagoContainer', { static: true }) containerRef?: ElementRef;

    constructor(
        private _configService: ConfigService,
        private _mercadoPagoService: MercadoPagoService,
    ) {
    }

    async ngOnInit(): Promise<void> {
        this._configService.getConfig.subscribe((config) => {
            this.config = config;
            this.expirationLicenseDate = config.expirationLicenseDate; //preguntar por que no funciona con this ni fuera del subscribe.
            this.licensePaymentDueDate = config.licensePaymentDueDate; //preguntar por que no funciona con this ni fuera del subscribe.
        });
        this.licenseType = 1

        this.loadPaymentBrick();

    }

    ngAfterViewChecked(): void {
    }

    private loadPaymentBrick() {
        if (this.containerRef && this.containerRef.nativeElement) {
            const container = this.containerRef.nativeElement;
            container.innerHTML = '';
            this._mercadoPagoService.createPaymentBrick(container.id, this.payer);
        }
    }

}