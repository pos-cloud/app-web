import { ConfigService } from './services/config.service';

export class Config {

    public _id: string;
    static apiHost: string = "localhost";
    static apiURL: string = "http://localhost:7000/api/";
    static apiPort: number = 7000;

    constructor() { }

    public static setApiHost(apiHost): void {
        this.apiHost = apiHost;
        Config.updateApiURL();
    }
    public static setApiPort(apiPort): void {
        this.apiPort = apiPort;
        Config.updateApiURL();
    }

    public static updateApiURL() {
        if(Config.apiPort !== 0) {
            Config.apiURL = "http://" + Config.apiHost + ":" + Config.apiPort + "/api/";
        } else {
            Config.apiURL = "http://" + Config.apiHost + "/api/";
        }
    }
}