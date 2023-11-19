import { json, urlencoded } from 'express';
const morgan = require('morgan')
import Routes from './routes/index';
const cors = require('cors')


export default class App {
  constructor(app: any) {
    this.config(app);
    new Routes(app);
  }

  public config(app:any): void {
    app.use(json());
    // const accessLogStream: WriteStream = fs.createWriteStream(
    //   path.join(__dirname, './logs/access.log'),
    //   { flags: 'a' }
    // );
     app.use(morgan('dev'));
     app.use(urlencoded({ extended: true }));
     app.use(cors());
    //app.use(helmet());
    //app.use(rateLimiter()); //  apply to all requests
    ///app.use(unCoughtErrorHandler);
  }
}