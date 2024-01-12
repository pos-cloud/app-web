import { json, urlencoded } from "express";
const morgan = require("morgan");
import Routes from "./routes/index";
const cors = require("cors");

export default class App {
  constructor(app: any) {
    this.config(app);
    new Routes(app);
  }

  public config(app: any): void {
    app.use(json());
    app.use(morgan("dev"));
    app.use(urlencoded({ extended: true }));
    app.use(cors());
  }
}
