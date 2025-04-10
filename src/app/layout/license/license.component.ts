import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { ConfigService } from 'app/core/services/config.service';
import { Config } from "app/app.config";
import { CommonModule } from "@angular/common";
import { LicenseService } from "app/core/services/license.service";
import { NgbAlertModule } from "@ng-bootstrap/ng-bootstrap";
import { Title } from "@angular/platform-browser";

@Component({
    selector: 'app-license',
    templateUrl: './license.component.html',
    styleUrls: ['./license.component.scss'],
    standalone: true,
    imports: [CommonModule,NgbAlertModule]
})
export class LicenseComponent implements OnInit {
    config: Config;
    licensePaymentDueDate: Date | null = null;
    expirationLicenseDate: Date | null = null;
    licenseType: number = 1;

    licenseStatus: string = '';
    licenseAlertType: 'success' | 'warning' | 'danger' = 'success';
    licenseTypeLabel: string = '';

    payer = {
        firstName: "",
        email: "",
    };

    @ViewChild('mercadoPagoContainer', { static: true }) containerRef?: ElementRef;

    constructor(
        private _configService: ConfigService,
        private _licenseService: LicenseService,
        private titleService: Title,
    ) {}

    ngOnInit(): void {
        this.titleService.setTitle('Licencia');
        this._configService.getConfig.subscribe((config) => {
          this.config = config;
          this.expirationLicenseDate = new Date(config.expirationLicenseDate);
          this.licensePaymentDueDate = new Date(config.licensePaymentDueDate);
      
          this.payer = {
            firstName: config.companyName,
            email: config.emailAccount,
          };
          
          const { status, alertType } = this._licenseService.getLicenseStatus(new Date(),this.licensePaymentDueDate,this.expirationLicenseDate);
          this.licenseStatus = status;
          this.licenseAlertType = alertType;
      
          this.licenseTypeLabel = this._licenseService.getLicenseTypeLabel(this.licenseType);
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
