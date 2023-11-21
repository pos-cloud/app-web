import * as express from 'express';
import App from './app';

const dotenv =  require('dotenv')
dotenv.config();

const app = express();
new App(app);

app.listen(302, () => {
    console.info(`Server running on: 302`);
  })
  .on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.log('server startup error: address already in use');
    } else {
      console.log(err);
    }
  });