import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { ConfigService } from 'app/core/services/config.service';
import { Config } from "app/app.config";
import { CommonModule } from "@angular/common";
import { LicenseService } from "app/core/services/license.service";
import { NgbAlertModule } from "@ng-bootstrap/ng-bootstrap";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute } from "@angular/router";
import { Router } from '@angular/router';

@Component({
    selector: 'app-license',
    templateUrl: './license.component.html',
    styleUrls: ['./license.component.scss'],
    standalone: true,
    imports: [CommonModule, NgbAlertModule]
})
export class LicenseComponent implements OnInit {
    config: Config;
    licensePaymentDueDate: any | null = null;
    expirationLicenseDate: any | null = null;
    licenseType: number = 0;

    licenseStatus: string = '';
    licenseAlertType: 'success' | 'warning' | 'danger' = 'success';
    licenseTypeLabel: string = '';

    payer = {
        firstName: "",
        email: "",
    };

    externalReference: string | null = null;

    @ViewChild('mercadoPagoContainer', { static: true }) containerRef?: ElementRef;

    constructor(
        private _configService: ConfigService,
        private _licenseService: LicenseService,
        private titleService: Title,
        private route: ActivatedRoute,
        private router: Router,
    ) { }

    ngOnInit(): void {
        this.titleService.setTitle('Licencia');

        this.route.queryParams.subscribe(params => {
            if (Object.keys(params).length > 0) {
                const paymentData = {
                    collection_id: params['collection_id'],
                    status: params['status'],
                    external_reference: params['external_reference'],
                    merchant_order_id: params['merchant_order_id']
                };

                console.log('Datos del pago:', paymentData);
                if (paymentData.status === 'approved') {
                    this.router.navigate(['/'])
                }
            }
        });

        this._configService.getConfig.subscribe((config) => {
            this.config = config;
            this.expirationLicenseDate = config.expirationLicenseDate;
            this.licensePaymentDueDate = config.licensePaymentDueDate;

            this.externalReference = localStorage.getItem('company');
            this.payer = {
                firstName: config.companyName,
                email: config.emailAccount,
            };

            const { status, alertType } = this._licenseService.getLicenseStatus(new Date(), config.licensePaymentDueDate, config.expirationLicenseDate);
            this.licenseStatus = status;
            this.licenseAlertType = alertType;

            this.licenseTypeLabel = this._licenseService.getLicenseTypeLabel(this.licenseType);
        });

        this.loadPaymentBrick();
    }
    
    formatUTCDate(dateString: string): string {
        const date = new Date(dateString);
        return `${date.getUTCDate()}/${date.getUTCMonth() + 1}/${date.getUTCFullYear()}`;
    }

    private loadPaymentBrick() {
        if (this.containerRef?.nativeElement) {
            const container = this.containerRef.nativeElement;
            container.innerHTML = '';
            this._licenseService.createPaymentBrick(container.id, this.payer, this.externalReference, this.licenseType);
        }
    }
}