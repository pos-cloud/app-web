import { ConfigService } from './services/config.service';
import { VATCondition } from './models/vat-condition';

export class Config {

    public _id: string;
    static apiHost: string = "localhost";
    static apiURL: string;
    static apiURLFE: string = "libs/fe/index.php";
    static apiPort: number = 3000;
    static accessType: string = "Cloud";
    static modules: string[];
    static pathMongo: string;
    static pathBackup: string;
    static backupTime: string;
    static emailAccount: string;
    static emailPassword: string;
    static companyName: string;
    static companyCUIT: string;
    static companyAddress: string;
    static companyPhone: string;
    static companyVatCondition: VATCondition;
    static companyStartOfActivity: string;
    static companyGrossIncome: string;

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

    public static setModules(modules: string[]): void {
        Config.modules = modules;
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

    public static setConfigCompany( companyName, companyCUIT, companyAddress, companyPhone, companyVatCondition, 
                                    companyStartOfActivity, companyGrossIncome): void {
        Config.companyName = companyName;
        Config.companyCUIT = companyCUIT;
        Config.companyAddress = companyAddress;
        Config.companyPhone = companyPhone;
        Config.companyVatCondition = companyVatCondition;
        Config.companyStartOfActivity = companyStartOfActivity;
        Config.companyGrossIncome = companyGrossIncome;
    }

    public static updateApiURL() {
        if(Config.apiPort !== 0) {
            Config.apiURL = "http://" + Config.apiHost + ":" + Config.apiPort + "/api/";
        } else {
            Config.apiURL = "http://" + Config.apiHost + "/api/";
        }
    }
}