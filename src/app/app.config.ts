import { ConfigService } from './services/config.service';

export class Config {

    public _id: string;
    static apiHost: string = "localhost";
    static apiURL: string;
    static apiConnectionPassword: string;
    static apiPort: number = 3000;
    static pathMongo: string;
    static pathBackup: string;
    static backupTime: string;
    static emailAccount: string;
    static emailPassword: string;
    static companyName: string;
    static companyCUIT: string;
    static companyAddress: string;
    static companyPhone: string;
    static ticketFoot: string;

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

    public static setApiConnectionPassword(apiConnectionPassword: string): void {
        this.apiConnectionPassword = apiConnectionPassword;
    }

    public static setConfigToBackup(pathBackup, pathMongo, backupTime): void {
        this.pathBackup = pathBackup;
        this.pathMongo = pathMongo;
        this.backupTime = backupTime;
    }

    public static setConfigEmail(emailAccount, emailPassword): void {
        this.emailAccount = emailAccount;
        this.emailPassword = emailPassword;
    }

    public static setConfigCompany(companyName, companyCUIT, companyAddress, companyPhone, ticketFoot): void {
        this.companyName = companyName;
        this.companyCUIT = companyCUIT;
        this.companyAddress = companyAddress;
        this.companyPhone = companyPhone;
        this.ticketFoot = ticketFoot;
    }

    public static updateApiURL() {
        if(Config.apiPort !== 0) {
            Config.apiURL = "http://" + Config.apiHost + ":" + Config.apiPort + "/api/";
        } else {
            Config.apiURL = "http://" + Config.apiHost + "/api/";
        }
    }
}