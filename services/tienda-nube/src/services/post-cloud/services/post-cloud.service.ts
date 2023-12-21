import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import { HttpService } from '@nestjs/axios';
import { firstValueFrom, map } from 'rxjs';

@Injectable()
export class PostCloudService {
  private postCloudUrI = process.env.POSTCLOUD_URI;
  constructor(private readonly httpService: HttpService) {
    if (!this.postCloudUrI) {
      throw new InternalServerErrorException(
        `url de api de postcloud es requerido`,
      );
    }
  }

  async getCredentialTiendaNube(storeId: number) {
    try {
      const credentiales = await firstValueFrom(
        this.httpService
          .get(`${this.postCloudUrI}/tienda-nube/credentials/${storeId}`)
          .pipe(
            map((resp) => {
              return resp.data;
            }),
          ),
      ).catch(() => {
        throw new Error(`Error al obtener credenciales de tiendaNube `);
      });

      if (!credentiales) {
        throw new BadRequestException(
          `Error al obtener credenciales de tiendaNube `,
        );
      }

      return credentiales;
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  async webhookOrder(data: any) {
    try {
      await firstValueFrom(
        this.httpService
          .post(`${this.postCloudUrI}/tienda-nube/add-transaction`, data)
          .pipe(map((resp) => resp.data)),
      ).catch((err) => {
        throw err;
      });
    } catch (err) {
      throw new InternalServerErrorException(
        `Error en el webhook de PostCloud`,
      );
    }
  }
}
