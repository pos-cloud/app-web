import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jwt-simple';
import DataJWT from '../interface/jwt.interface';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req?.headers?.authorization) {
     const token = req.headers.authorization.replace(/['"]+/g, '');
      try {
        // const token = jwt.encode(
        //   {
        //     user: '64a6f0d40e715e06d48eb00b',
        //     database: 'distribuidoragiletta',
        //     clientId: '64a6f0d40e715e06d48eb00b',
        //   },
        //   process.env.TOKEN_SECRET || '',
        // );
        const dataJWT: DataJWT = jwt.decode(
          token,
          process.env.TOKEN_SECRET || '',
        );

        const database: string = dataJWT?.database;
        const userId: string = dataJWT?.user;

        req['database'] = database;
        req['userId'] = userId;

        next();
      } catch (error) {
        res.status(500).send({ message: error.toString() });
      }
    } else {
      res.status(500).send({ message: 'No se encontro authorization asdad' });
    }
  }
}
