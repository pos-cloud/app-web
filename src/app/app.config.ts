import { VATCondition } from './models/vat-condition';
import * as moment from 'moment';
import 'moment/locale/es';
import { IdentificationType } from './models/identification-type';
import { Currency } from './models/currency';

export class Config {

    public _id: string;
    static database: string;
    static apiHost: string = 'localhost';
    static apiURL: string;
    static apiURL_FE_AR: string = 'libs/fe/ar/index.php';
    static apiURL_FE_MX: string = 'libs/fe/mx/01_CFDI_fe.php';
    static apiPort = 300;
    static modules;
    static emailAccount: string;
    static emailPassword: string;
    static companyPicture: string;
    static companyName: string;
    static companyAddress: string;
    static companyFantasyName: string;
    static companyPhone: string;
    static companyVatCondition: VATCondition;
    static companyIdentificationType: IdentificationType;
    static companyIdentificationValue: string;
    static companyStartOfActivity: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
    static companyGrossIncome: string;
    static companyPostalCode: string;
    static footerInvoice: string;
    static expirationLicense: string;
    static country: string;
    static timezone: string;
    static currency: Currency;
    static licenseCost: number;
    static showLicenseNotification: boolean = true;
    public article: {
		code: {
			validators: {
				maxLength: number
			}
		},
		printLabel: {
			value: string
		}
	};
	public company: {
		allowCurrentAccount: {
			default: boolean
		},
		vatCondition: {
			default: VATCondition
		}
	};

    constructor() {
        Config.updateApiURL();
    }

    public static setApiHost(apiHost: string): void {
        this.apiHost = apiHost;
        Config.updateApiURL();
    }

    public static setApiPort(apiPort: number): void {
        this.apiPort = apiPort;
        Config.updateApiURL();
    }

    public static setModules(modules): void {
        Config.modules = modules;
    }

    public static setDatabase(database: string): void {
        Config.database = database;
    }

    public static setExpirationLicense(expirationLicense: string): void {
      Config.expirationLicense = expirationLicense;
    }

    public static setConfigEmail(emailAccount, emailPassword): void {
        Config.emailAccount = emailAccount;
        Config.emailPassword = emailPassword;
    }

    public static setConfigCompany(
        companyPicture, 
        companyName, 
        companyAddress, 
        companyPhone,
        companyVatCondition, 
        companyStartOfActivity, 
        companyGrossIncome, 
        footerInvoice, 
        companyFantasyName,
        country, 
        timezone, 
        currency, 
        companyIdentificationType, 
        companyIdentificationValue, 
        licenseCost,
        companyPostalCode
    ): void {
        Config.companyPicture = companyPicture;
        Config.companyName = companyName;
        Config.companyAddress = companyAddress;
        Config.companyFantasyName = companyFantasyName;
        Config.companyPhone = companyPhone;
        Config.companyVatCondition = companyVatCondition;
        Config.companyStartOfActivity = companyStartOfActivity;
        Config.companyGrossIncome = companyGrossIncome;
        Config.footerInvoice = footerInvoice;
        Config.country = country;
        Config.timezone = timezone;
        Config.companyIdentificationType = companyIdentificationType;
        Config.companyIdentificationValue = companyIdentificationValue;
        Config.licenseCost = licenseCost;
        Config.currency = currency;
        Config.companyPostalCode = companyPostalCode;
    }

    public static setConfigs(showLicenseNotification: boolean): void {
        Config.showLicenseNotification = showLicenseNotification;
    }

    public static updateApiURL() {
        if (Config.apiPort !== 0) {
            Config.apiURL = 'http://' + Config.apiHost + ':' + Config.apiPort + '/api/';
        } else {
            Config.apiURL = 'http://' + Config.apiHost + '/api/';
        }
    }
}
