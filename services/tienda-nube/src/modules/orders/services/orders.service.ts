import { BadRequestException, Injectable } from '@nestjs/common';
import { PosCloudService } from 'src/services/pos-cloud/services/pos-cloud.service';
import { TiendaNubeService } from 'src/services/tienda-nube/services/tienda-nube.service';
import { CancelOrderDto } from '../dtos/cancel-order.dto';
import { FulFillOrderDto } from '../dtos/fulfill-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    private readonly tiendaNubeService: TiendaNubeService,
    private readonly posCloudService: PosCloudService,
  ) {}
  async wehbook(data: any) {
    const { store_id, event, id } = data;
  console.log( store_id, event, id)
    const credentials =
      await this.posCloudService.getCredentialTiendaNube(store_id);
    const { tokenTiendaNube, storeId } = credentials;
 
    const order = await this.tiendaNubeService.getOrderId(
      id,
      tokenTiendaNube,
      storeId,
    );
    console.log(order)
    const dataResponse = {
      storeId: store_id,
      event,
      order: order,
    };
    await this.posCloudService.webhookOrder(dataResponse);
    return dataResponse;
  }

  async openOrder(orderId: string, storeId: number) {
    try {
      console.log(storeId);
      if (!storeId) {
        throw new BadRequestException(`storeId es requerido`);
      }
      const credentials =
        await this.posCloudService.getCredentialTiendaNube(storeId);
      const { tokenTiendaNube, userID } = credentials;
      return await this.tiendaNubeService.openOrder(
        orderId,
        tokenTiendaNube,
        userID,
      );
    } catch (err) {
      throw err;
    }
  }
  async closeOrder(orderId: string, storeId: number) {
    try {
      if (!storeId) {
        throw new BadRequestException(`storeId es requerido`);
      }
      const credentials =
        await this.posCloudService.getCredentialTiendaNube(storeId);
      const { tokenTiendaNube, userID } = credentials;

      return await this.tiendaNubeService.closeOrder(
        orderId,
        tokenTiendaNube,
        userID,
      );
    } catch (err) {
      throw err;
    }
  }
  async cancelOrder(orderId: string, dataBody: CancelOrderDto) {
    try {
      const { storeId } = dataBody;
      const credentials =
        await this.posCloudService.getCredentialTiendaNube(storeId);
      const { tokenTiendaNube, userID } = credentials;

      return await this.tiendaNubeService.cancelOrder(
        dataBody,
        orderId,
        tokenTiendaNube,
        userID,
      );
    } catch (err) {
      throw err;
    }
  }
  async packOrder(orderId: string, storeId: number) {
    try {
      if (!storeId) {
        throw new BadRequestException(`storeId es requerido`);
      }
      const credentials =
        await this.posCloudService.getCredentialTiendaNube(storeId);
      const { tokenTiendaNube, userID } = credentials;

      return await this.tiendaNubeService.packOrder(
        orderId,
        tokenTiendaNube,
        userID,
      );
    } catch (err) {
      throw err;
    }
  }
  async fulfillOrder(orderId: string, dataBody: FulFillOrderDto) {
    try {
      const { storeId } = dataBody;

      const credentials =
        await this.posCloudService.getCredentialTiendaNube(storeId);
      const { tokenTiendaNube, userID } = credentials;

      return await this.tiendaNubeService.fulFillOrder(
        dataBody,
        orderId,
        tokenTiendaNube,
        userID,
      );
    } catch (err) {
      throw err;
    }
  }
}
