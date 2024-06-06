import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/services/database.service';
import { TiendaNubeService } from 'src/services/tienda-nube/services/tienda-nube.service';
import { ObjectId } from 'mongodb';
import { PoolDatabase } from 'src/database/services/database-2.service';

@Injectable()
export class VariantProduct {
  constructor(
    // private readonly databaseService: DatabaseService,
    private readonly poolDatabase: PoolDatabase,
    // private readonly tiendaNubeService: TiendaNubeService,
  ) {}

  async getProductVariantsPropertyNames(productId: string, database: string) {
    const foundCollection = await this.poolDatabase.getCollection(
      'variants',
      database,
    );
    const variantProducts = await foundCollection
      .find({
        operationType: { $ne: "D" },
        articleParent: new ObjectId(productId.toString()),
      })
      .toArray();

    const arrrayTypeProduct = variantProducts.map((element) =>
      element.type.toString(),
    );
    const uniqueArray = [...new Set(arrrayTypeProduct)];
    const result = await this.typesName(uniqueArray, database);

    return result;
  }

  async typesName(arrayTypes: string[], database: string) {
    const arrayPromises = arrayTypes.map((typeId) => {
      return new Promise(async (resolve, reject) => {
        try {
          const typeFound = await this.poolDatabase.getDocumentById(
            'variant-types',
            typeId,
            database,
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
