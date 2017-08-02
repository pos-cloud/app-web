import { ConfigService } from './services/config.service';

export class Config {

    public _id: string;
    static apiHost: string = "localhost";
    static printHost: string = "localhost";
    static apiURL: string = "http://localhost:7000/api/";
    static printURL: string = "http://localhost:5000/api-pos-resto";
    static apiPort: number = 3000;
    static printPort: number = 3000;

    constructor() { }

    public static setApiHost(apiHost): void {
        this.apiHost = apiHost;
        Config.updateApiURL();
    }

    public static setPrintHost(printHost): void {
        this.printHost = printHost;
        Config.updatePrintURL();
    }

    public static setApiPort(apiPort): void {
        this.apiPort = apiPort;
        Config.updateApiURL();
    }

    public static setPrintPort(printPort): void {
        this.printPort = printPort;
        Config.updatePrintURL();
    }

    public static updateApiURL() {
        if(Config.apiPort !== 0) {
            Config.apiURL = "http://" + Config.apiHost + ":" + Config.apiPort + "/api/";
        } else {
            Config.apiURL = "http://" + Config.apiHost + "/api/";
        }
    }

    public static updatePrintURL() {
        if (Config.printPort !== 0) {
            Config.printURL = "http://" + Config.printHost + ":" + Config.printPort + "/api-pos-resto/";
        } else {
            Config.printURL = "http://" + Config.printHost + "/api-pos-resto/";
        }
    }
}