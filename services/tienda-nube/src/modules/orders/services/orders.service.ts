import { Injectable } from '@nestjs/common';
import { PostCloudService } from 'src/services/post-cloud/services/post-cloud.service';
import { TiendaNubeService } from 'src/services/tienda-nube/services/tienda-nube.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly tiendaNubeService: TiendaNubeService,
    private readonly postCloudService: PostCloudService,
  ) {}
  async wehbook(data: any) {
    const { store_id, event, id } = data;
    const credentials =
      await this.postCloudService.getCredentialTiendaNube(store_id);

    const { tokenTiendaNube, userID } = credentials;

    const order = await this.tiendaNubeService.getOrderId(
      id,
      tokenTiendaNube,
      userID,
    );
    const dataResponse = {
      storeId: store_id,
      event,
      order: order,
    };
    await this.postCloudService.webhookOrder(dataResponse);
    return dataResponse;
  }
}
