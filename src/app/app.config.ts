import { ConfigService } from './services/config.service';

export class Config {

    public _id: string;
    static apiHost: string = "localhost";
    static apiURL: string;
    static apiConnectionPassword: string;
    static apiPort: number = 3000;
    static accessType: string = "Cloud";
    static pathMongo: string;
    static pathBackup: string;
    static backupTime: string;
    static emailAccount: string;
    static emailPassword: string;
    static companyName: string;
    static companyCUIT: string;
    static companyAddress: string;
    static companyPhone: string;

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

    public static setApiConnectionPassword(apiConnectionPassword: string): void {
        Config.apiConnectionPassword = apiConnectionPassword;
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

    public static setConfigCompany(companyName, companyCUIT, companyAddress, companyPhone): void {
        Config.companyName = companyName;
        Config.companyCUIT = companyCUIT;
        Config.companyAddress = companyAddress;
        Config.companyPhone= companyPhone;
    }

    public static updateApiURL() {
        if(Config.apiPort !== 0) {
            Config.apiURL = "http://" + Config.apiHost + ":" + Config.apiPort + "/api/";
        } else {
            Config.apiURL = "http://" + Config.apiHost + "/api/";
        }
    }
}