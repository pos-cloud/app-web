import { Component } from "@angular/core";
import { ConfigService } from 'app/core/services/config.service';
import { Config } from "app/app.config";

@Component({
    selector: 'app-license',
    templateUrl: './license.component.html',
    standalone: true,
})
export class LicenseComponent {
    config: Config;

    constructor(
        private _configService: ConfigService
    ) {
        this._configService.getConfig.subscribe((config) => {
            this.config = config;
        });

        console.log(this.config)
    };



}