import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/services/database.service';
import { TiendaNubeService } from 'src/services/tienda-nube/services/tienda-nube.service';
import { ObjectId } from 'mongodb';

@Injectable()
export class VariantProduct {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly tiendaNubeService: TiendaNubeService,
  ) {}

  async getProductVariantsPropertyNames(productId: string) {
    const foundCollection = this.databaseService.getCollection('variants');
    const variantProducts = await foundCollection
      .find({
        articleParent: new ObjectId(productId),
      })
      .toArray();
   
    console.log('object');
    const arrrayTypeProduct = variantProducts.map((element) =>
      element.type.toString(),
    );
    const uniqueArray = [...new Set(arrrayTypeProduct)];
    const result = await this.typesName(uniqueArray);

    return result;
  }

  async typesName(arrayTypes: string[]) {
    const arrayPromises = arrayTypes.map((typeId) => {
      return new Promise(async (resolve, reject) => {
        try {
          const typeFound = await this.databaseService.getDocumentById(
            'variant-types',
            typeId,
          );
          if (typeFound) {
            resolve(
              (typeFound.name as string).toLocaleLowerCase().replace(/ /g, '_'),
            );
          } else {
            reject(`variant type with id:${typeId} not found`);
          }
        } catch (err) {
          reject(err);
        }
      });
    });

    const result = await Promise.all(arrayPromises);
    return result;
  }
}
