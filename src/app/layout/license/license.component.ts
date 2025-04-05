import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { ConfigService } from 'app/core/services/config.service';
import { Config } from "app/app.config";
import { CommonModule } from "@angular/common";
import { LicenseService } from "@core/services/license.service";

@Component({
    selector: 'app-license',
    templateUrl: './license.component.html',
    styleUrls: ['./license.component.scss'],
    standalone: true,
    imports: [CommonModule]
})
export class LicenseComponent implements OnInit {
    config: Config;
    licensePaymentDueDate: Date | null = null;
    expirationLicenseDate: Date | null = null;
    licenseType: number = 1;

    payer = {
        firstName: "",
        email: "",
    };

    @ViewChild('mercadoPagoContainer', { static: true }) containerRef?: ElementRef;

    constructor(
        private _configService: ConfigService,
        private _licenseService: LicenseService
    ) {}

    ngOnInit(): void {
        this._configService.getConfig.subscribe((config) => {
            this.config = config;
            this.expirationLicenseDate = new Date(config.expirationLicenseDate);
            this.licensePaymentDueDate = new Date(config.licensePaymentDueDate);
            console.log(this.config);
            this.payer = {
                firstName: config.companyName,
                email: config.emailAccount,
            };
        });

        this.loadPaymentBrick();
    }

    private loadPaymentBrick() {
        if (this.containerRef?.nativeElement) {
            const container = this.containerRef.nativeElement;
            container.innerHTML = '';
            this._licenseService.createPaymentBrick(container.id, this.payer);
        }
    }
}
