import { Component, OnInit } from "@angular/core";
import { ConfigService } from 'app/core/services/config.service';
import { Config } from "app/app.config";
import { CommonModule } from "@angular/common";

@Component({
    selector: 'app-license',
    templateUrl: './license.component.html',
    styleUrls: ['./license.component.scss'],
    standalone: true,
    imports: [CommonModule]
})
export class LicenseComponent implements OnInit{
    config: Config;
    licensePaymentDueDate: String;
    expirationLicenseDate: String;
    licenseType: Number;

    constructor(
        private _configService: ConfigService
    ) {
        
    }

    ngOnInit(): void {
        this._configService.getConfig.subscribe((config) => {
            this.config = config;
            this.expirationLicenseDate = config.expirationLicenseDate; //preguntar por que no funciona con this ni fuera del subscribe.
            this.licensePaymentDueDate = config.licensePaymentDueDate; //preguntar por que no funciona con this ni fuera del subscribe.
        });
        this.licenseType = 1 
    }
}