import { NextFunction, Request, Response } from 'express';
import RequestWithUser from 'interfaces/requestWithUser.interface';
import * as jwt from 'jwt-simple';

interface DataJWT {
  user: string;
  database: string;
  clientId: string;
  iat: number;
  exp: number;
}

async function authMiddleware(
  request: RequestWithUser,
  response: Response,
  next: NextFunction,
) {
  if (request?.headers?.authorization) {
    const token = request.headers.authorization.replace(/['"]+/g, '');
    try {
      const dataJWT: DataJWT = jwt.decode(
        token,
        process.env.TOKEN_SECRET || '',
      );
//test
      const database: string = dataJWT?.database;
      const userId: string = dataJWT?.user;

      request.database = database;
      request.userId = userId;

      next();
    } catch (error) {
      response.status(500).send({ message: error.toString() });
    }
  } else {
    response.status(500).send({ message: 'No se encontro authorization' });
  }
}

export default authMiddleware;
