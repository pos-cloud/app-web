import { VATCondition } from './models/vat-condition';
import * as moment from 'moment';
import 'moment/locale/es';

export class Config {

    public _id: string;
    static apiHost: string = 'localhost';
    static apiURL: string;
    static apiURLFE: string = 'libs/fe/index.php';
    static apiPort = 3000;
    static accessType = "Cloud";
    static modules;
    static pathMongo: string;
    static pathBackup: string;
    static backupTime: string;
    static emailAccount: string;
    static emailPassword: string;
    static companyPicture: string;
    static companyName: string;
    static companyCUIT: string;
    static companyAddress: string;
    static companyFantasyName: string;
    static companyPhone: string;
    static companyVatCondition: VATCondition;
    static companyStartOfActivity: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
    static companyGrossIncome: string;
    static heightLabel: number;
    static widthLabel: number;
    static footerInvoice: string;
    static expirationLicense: string;

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

    public static setAccessType(accessType: string): void {
        Config.accessType = accessType;
    }

    public static setModules(modules): void {
        Config.modules = modules;
    }

    public static setExpirationLicense(expirationLicense: string): void {
      Config.expirationLicense = expirationLicense;
    }

    public static setConfigToBackup(pathBackup, pathMongo, backupTime): void {
        Config.pathBackup = pathBackup;
        Config.pathMongo = pathMongo;
        Config.backupTime = backupTime;
    }

    public static setConfigEmail(emailAccount, emailPassword): void {
        Config.emailAccount = emailAccount;
        Config.emailPassword = emailPassword;
    }

    public static setConfigCompany( companyPicture, companyName, companyCUIT, companyAddress, companyPhone, companyVatCondition,companyStartOfActivity, companyGrossIncome, footerInvoice, companyFantasyName): void {
        Config.companyPicture = companyPicture;
        Config.companyName = companyName;
        Config.companyCUIT = companyCUIT;
        Config.companyAddress = companyAddress;
        Config.companyFantasyName = companyFantasyName;
        Config.companyPhone = companyPhone;
        Config.companyVatCondition = companyVatCondition;
        Config.companyStartOfActivity = companyStartOfActivity;
        Config.companyGrossIncome = companyGrossIncome;
        Config.footerInvoice = footerInvoice;
    }

    public static setConfigLabel( heightLabel, widthLabel ): void {
        Config.heightLabel = heightLabel;
        Config.widthLabel = widthLabel;
    }

    public static updateApiURL() {
        if (Config.apiPort !== 0) {
            Config.apiURL = 'http://' + Config.apiHost + ':' + Config.apiPort + '/api/';
        } else {
            Config.apiURL = 'http://' + Config.apiHost + '/api/';
        }
    }
}
