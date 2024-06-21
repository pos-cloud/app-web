import { Injectable, BadRequestException } from '@nestjs/common';

import { DatabaseService } from 'src/database/services/database.service';
import { TiendaNubeService } from 'src/services/tienda-nube/services/tienda-nube.service';
import { CategoriesService } from 'src/modules/categories/services/categories.service';
import { VariantProduct } from './variant.service';
import { CreateProductTiendaNubeDTO } from 'src/services/tienda-nube/dto/create-product-tienda-nube.dto';
import { PoolDatabase } from 'src/database/services/database-2.service';
import { ObjectId } from 'mongodb';
import { UpdateProductTiendaNubeDto } from 'src/services/tienda-nube/dto/update-product-tienda-nube.dto';
import { ResponseVariantsDB } from 'src/common/interfaces/ResponseVariantDb.interface';

@Injectable()
export class ProductsService {
  constructor(
    private readonly poolDatabase: PoolDatabase,
    // private readonly databaseService: DatabaseService,
    private readonly tiendaNubeService: TiendaNubeService,
    private readonly categoryService: CategoriesService,
    private readonly productVariantService: VariantProduct,
  ) {}

  async create(database: string, productId: string) {
    try {
      if (!database) {
        throw new BadRequestException(`Database is required `);
      }
      await this.poolDatabase.initConnection(database);
      const { token, userID } =
        await this.poolDatabase.getCredentialsTiendaNube(database);
      const foundCollection = await this.poolDatabase.getCollection(
        'articles',
        database,
      );
      const foundArticle = await this.poolDatabase.getDocumentById(
        'articles',
        productId,
        database,
      );

      if (
        !foundArticle ||
        foundArticle.operationType == 'D' ||
        (foundArticle.type as string).toLocaleLowerCase() != 'final'
      ) {
        throw new BadRequestException(
          ` Article with id ${productId} not found`,
        );
      }

      // const pictureUrls = foundArticle.pictures.map(
      //   (picture) => picture.picture,
      // );

      const dataNewProductTiendaNube = {
        // images: [
        //   {
        //     src: foundArticle.picture,
        //   },
        //   ...pictureUrls.map((src) => ({ src })),
        // ],
        name: {
          es: foundArticle.description,
        },
        description: {
          es: foundArticle.observation || '',
        },
      };

      const resultVariantName =
        await this.productVariantService.getProductVariantsPropertyNames(
          foundArticle._id,
          database,
        );

      dataNewProductTiendaNube['attributes'] = resultVariantName.map((e) => ({
        es: e,
      }));

      if (foundArticle.category) {
        await this.categoryService.findOneCategoryDb(
          foundArticle.category,
          database,
        );

        const foundCategoryTiendaMia = await this.categoryService.create(
          database,
          foundArticle.category,
        );

        if (foundCategoryTiendaMia) {
          dataNewProductTiendaNube['categories'] = [foundCategoryTiendaMia.id];
        }
      }

      const result = await this.tiendaNubeService.createProduct(
        dataNewProductTiendaNube as CreateProductTiendaNubeDTO,
        token,
        userID,
      );

      const stockCollection = await this.poolDatabase.getCollection(
        'article-stocks',
        database,
      );
      const stockFound = await stockCollection.findOne({
        operationType: { $ne: 'D' },
        article: new ObjectId(productId),
      });

      await this.tiendaNubeService.updateProductFirstVariant(
        token,
        userID,
        result.id,
        result.variants[0].id,
        {
          stock: !foundArticle.allowSaleWithoutStock
            ? stockFound && stockFound.realStock >= 0
              ? stockFound.realStock
              : 0
            : null,
          price: foundArticle.salePrice || null,
          sku: foundArticle.barcode || null,
          weight: foundArticle.weight || null,
          width: foundArticle.width || null,
          height: foundArticle.height || null,
          depth: foundArticle.depth || null,
        },
      );
      // Creacion de variantes
      
      const foundCollectionV = await this.poolDatabase.getCollection(
        'variants',
        database,
      );

      const dataVarinat: ResponseVariantsDB[] = await this.poolDatabase.getVariantDataByArticle(
        productId,
        database,
      );
      const variantProducts = await foundCollectionV.find({
        operationType: { $ne: "D" },
        articleParent: new ObjectId(foundArticle._id.toString()),
      }).toArray();
      
      if(variantProducts.length > 0){
      await this.massCreactionOfProductVariants(
        productId,
        token,
        userID,
        result.id,
        resultVariantName as string[],
        database,
      ).then((promise) => {
        return Promise.all(promise);
      }).then(async (result) => {
        result.map(async (productVariante: any, index) => {
          for(let variant of dataVarinat){
            if (productVariante.values[0].es === variant.variants[0].value.description) {
              await foundCollection.updateOne(
                { _id: variant.articleChild },
                {
                  $set: {
                    tiendaNubeId: productVariante.id,
                  },
                },
              );
            }
          }
        });
      })
    }

      await foundCollection.updateOne(
        { _id: foundArticle._id },
        {
          $set: {
            tiendaNubeId: result.id,
          },
        },
      );

      return result;
    } catch (err) {
      throw err;
    }
  }

  async massCreactionOfProductVariants(
    productId: string,
    tokenTiendaNube: string,
    userIdTiendaNube: string,
    productTiendaNube: string,
    variantName: string[],
    database: string,
  ) {
    const dataVarinat = await this.poolDatabase.getVariantDataByArticle(
      productId,
      database,
    );

    if (dataVarinat.length == 0) return;

    const variantData = await this.clearDataVariant(
      dataVarinat,
      variantName,
      productTiendaNube,
      tokenTiendaNube,
      userIdTiendaNube,
      database,
    );

    const arrayCreateVariant = variantData.map((e) => {
     return new Promise(async (resolve) => {
        const resultResolve =
          await this.tiendaNubeService.createVarianteByProduct(
            tokenTiendaNube,
            userIdTiendaNube,
            productTiendaNube,
            e,
          );
        resolve(resultResolve);
      });
    });
    await Promise.all(arrayCreateVariant)
    return arrayCreateVariant

  }

  async clearDataVariant(
    data: ResponseVariantsDB[],
    attributes: string[],
    productTiendaNube: string,
    tiendaNubeAccessToken: string,
    tiendaNubeUserId: string,
    database: string,
  ) {
    const dataClearPromises = data.map((element) => {
      return new Promise(async (resolve, reject) => {
        try {
          const variantData = {
            values: [],
          };

          //upload image, and add id image variant
          //let image = null;
          // try {
          //   image = await this.tiendaNubeService.uploadImageOfProduct(
          //     productTiendaNube,
          //     element.articleChildInfo?.picture ?? null,
          //     tiendaNubeAccessToken,
          //     tiendaNubeUserId,
          //   );
          // } catch (err) {
          // }
          // if (image) {
          //   variantData['image_id'] = image.id;
          // }
          for (let attribute of attributes) {
            for (let variantValue of element.variants) {
              if (
                attribute ==
                variantValue.type.name.toLocaleLowerCase().replace(/ /g, '_')
              ) {
                variantData['values'].push({
                  es: variantValue.value.description,
                });
              }
            }
          }

          variantData['price'] = element.articleChildInfo.salePrice ?? 0;

          const stockCollection = await this.poolDatabase.getCollection(
            'article-stocks',
            database,
          );

          try {
            const stockFound = await stockCollection.findOne({
              operationType: { $ne: 'D' },
              article: new ObjectId(element.articleChild),
            });

            variantData['stock'] =
              !stockFound || stockFound.realStock < 0
                ? 0
                : stockFound.realStock;
          } catch (error) {
            variantData['stock'] = 0;
          }

          resolve(variantData);
        } catch (error) {
          reject(error);
        }
      });
    });

    const resolvedData = await Promise.all(dataClearPromises);

    return resolvedData;
  }

  async findAll(database: string, page: string) {
    try {
      if (!database) {
        throw new BadRequestException(`Database is required `);
      }
      await this.poolDatabase.initConnection(database);
      const { token, userID } =
        await this.poolDatabase.getCredentialsTiendaNube(database);
      const data = await this.tiendaNubeService.findAll(token, userID, page);

      // await this.databaseService.closeConnection();
      return data;
    } catch (err) {
      return null;
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  async update(database: string, productId: string) {
    try {
      if (!database) {
        throw new BadRequestException(`Database is required `);
      }

      await this.poolDatabase.initConnection(database);
      const { token, userID } =
        await this.poolDatabase.getCredentialsTiendaNube(database);

      const foundCollection = await this.poolDatabase.getCollection(
        'articles',
        database,
      );

      const foundArticle = await this.poolDatabase.getDocumentById(
        'articles',
        productId,
        database,
      );
      if (
        !foundArticle ||
        foundArticle.operationType == 'D' ||
        (foundArticle.type as string).toLocaleLowerCase() != 'final'
      ) {
        throw new BadRequestException(`Article with id ${productId} not found`);
      }

      if (!foundArticle.tiendaNubeId) {
        return this.create(database, productId);
      }

      const dataUpdateProductTiendaNube = {
        name: {
          es: foundArticle.description,
        },
        description: {
          es: foundArticle.observation || '',
        },
      };

      if (foundArticle.category) {
        await this.categoryService.findOneCategoryDb(
          foundArticle.category,
          database,
        );

        const foundCategoryTiendaMia = await this.categoryService.create(
          database,
          foundArticle.category,
        );

        if (foundCategoryTiendaMia) {
          dataUpdateProductTiendaNube['categories'] = [
            foundCategoryTiendaMia.id,
          ];
        }
      }

      const result = await this.tiendaNubeService.updateProduct(
        token,
        userID,
        foundArticle.tiendaNubeId,
        dataUpdateProductTiendaNube as UpdateProductTiendaNubeDto,
      );

      // eliminacion de imagenee
      // try {
      // //  this.deleteAllImageVariant(result.variants, result.id, token, userID);
      // } catch (err) {}
      // if (foundArticle.picture != result.images[0]?.src) {
      //   const dataresult =
      //     await this.tiendaNubeService.updatePrincipalImageOfProduct(
      //       foundArticle.picture,
      //       result.id,
      //       result.images[0].id,
      //       token,
      //       userID,
      //     );

      //   await foundCollection.updateOne(
      //     { _id: foundArticle._id },
      //     {
      //       $set: {
      //         picture: dataresult.src,
      //       },
      //     },
      //   );
      // }
      const foundCollectionV = await this.poolDatabase.getCollection(
        'variants',
        database,
      );

      const dataVarinat: ResponseVariantsDB[] = await this.poolDatabase.getVariantDataByArticle(
        productId,
        database,
      );

      const variantProducts = await foundCollectionV.find({
        operationType: "D",
        articleParent: new ObjectId(foundArticle._id.toString()),
      }).toArray();

      for (let variant of variantProducts) {
        const article = await foundCollection.find({
          _id: new ObjectId(variant.articleChild.toString()),
        }).toArray();

        if (article.length > 0 && article[0].tiendaNubeId !== null) {
          await this.tiendaNubeService.deleteVariant(
            token,
            userID,
            foundArticle.tiendaNubeId,
            article[0].tiendaNubeId
          )
          await foundCollection.updateOne(
            { _id: article[0]._id },
            {
              $set: {
                operationType: 'D',
                tiendaNubeId: null,
              },
            },
          );
        }
      }

      if (foundArticle.containsVariants) {
        for (let variant of dataVarinat) {
          if (variant.articleChildInfo.tiendaNubeId) {
            const stockCollection = await this.poolDatabase.getCollection(
              'article-stocks',
              database,
            );
            const stockFound = await stockCollection.findOne({
              operationType: { $ne: 'D' },
              article: new ObjectId(variant.articleChild ),
            });
            await this.tiendaNubeService.updateVarinat(
              token,
              userID,
              foundArticle.tiendaNubeId,
              variant.articleChildInfo.tiendaNubeId,
              {
                stock: !variant.articleChildInfo.allowSaleWithoutStock
                  ? stockFound && stockFound.realStock >= 0
                    ? stockFound.realStock
                    : 0
                  : null,
                price: variant.articleChildInfo.salePrice ,
                sku: variant.articleChildInfo.barcode || null,
                weight: variant.articleChildInfo.weight || null,
                width:  variant.articleChildInfo.width || null,
                height: variant.articleChildInfo.height || null,
                depth: variant.articleChildInfo.depth || null,
              },
            )
          } else {

            const stockCollection = await this.poolDatabase.getCollection(
              'article-stocks',
              database,
            );
            const stockFound = await stockCollection.findOne({
              operationType: { $ne: 'D' },
              article: variant.articleChild,
            });

            const values = [{
              es: variant.variants[0].value.description
            }]


            const response = await this.tiendaNubeService.createVariant(
              token,
              userID,
              foundArticle.tiendaNubeId,
              {
                values,
                stock: !variant.articleChildInfo.allowSaleWithoutStock
                  ? stockFound && stockFound.realStock >= 0
                    ? stockFound.realStock
                    : 0
                  : null,
                price: variant.articleChildInfo.salePrice
              }
            )
            await foundCollection.updateOne(
              { _id: variant.articleChild },
              {
                $set: {
                  tiendaNubeId: response.id,
                },
              },
            );
          }
         }

      } else {
        const stockCollection = await this.poolDatabase.getCollection(
          'article-stocks',
          database,
        );
        const stockFound = await stockCollection.findOne({
          operationType: { $ne: 'D' },
          article: new ObjectId(productId),
        });

        await this.tiendaNubeService.updateProductFirstVariant(
          token,
          userID,
          result.id,
          result.variants[0].id,
          {
            stock: !foundArticle.allowSaleWithoutStock
              ? stockFound && stockFound.realStock >= 0
                ? stockFound.realStock
                : 0
              : null,
            price: foundArticle.salePrice ? foundArticle.salePrice : null,
            sku: foundArticle.barcode || null,
            weight: foundArticle.weight || null,
            width: foundArticle.width || null,
            height: foundArticle.height || null,
            depth: foundArticle.depth || null,
          },
        );

        return result;
      }

      return result;
    } catch (err) {
      throw err;
    }
  }

  deleteAllImageVariant(
    data: any[],
    productId: string,

    tiendaNubeAccessToken: string,
    tiendaNubeUserId: string,
  ) {
    data = data.filter((e) => e.image_id != null);
    const arrayDeleteOldImage = data.map((variant) => {
      return new Promise(async (resolver, reject) => {
        const result = await this.tiendaNubeService.deleteImageOfProduct(
          productId,
          variant.image_id,
          tiendaNubeAccessToken,
          tiendaNubeUserId,
        );
        if (result) {
          resolver(true);
        }
        reject(false);
      });
    });
    Promise.all(arrayDeleteOldImage);
  }

  async massiveUpdate(database: string, products: string[]) {
    try {
      if (!database) {
        throw new BadRequestException(`Database is required `);
      }
      await this.poolDatabase.initConnection(database);

      const foundCollection =await this.poolDatabase.getCollection('articles',database);

      const data = await foundCollection
        .find({ tiendaNubeId: { $in: products } })
        .toArray();

      const arrayData = data.map((e) => {
        return new Promise(async (resolve, reject) => {
          const result = await this.update(database, e._id);
          if (result) {
            resolve(true);
          }
          reject(false);
        });
      });

      const result = await Promise.all(arrayData);
      // await this.databaseService.closeConnection();

      if (result) {
        return true;
      }
      return false;
    } catch (err) {
      throw err;
    }
  }

  async remove(database: string, tiendaNubeId: string) {
    try {
      if (!database) {
        throw new BadRequestException(`Database is required `);
      }

      await this.poolDatabase.initConnection(database);
      const { token, userID } =
        await this.poolDatabase.getCredentialsTiendaNube(database);

      if (!tiendaNubeId) {
        throw new BadRequestException(`ID not found`);
      }
      await this.poolDatabase.getArticleByTiendaNube(tiendaNubeId,database);

      const result = await this.tiendaNubeService.removeProduct(
        tiendaNubeId,
        token,
        userID,
      );

      // await this.databaseService.closeConnection();

      if (!result) {
        return false;
      }

      return result;
    } catch (err) {
      throw err;
    }
  }
}
