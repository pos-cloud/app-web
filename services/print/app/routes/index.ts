import userRoutes from './routes';

export default class Routes {
  constructor(app: any) {
    app.use('/', userRoutes);
  }
}