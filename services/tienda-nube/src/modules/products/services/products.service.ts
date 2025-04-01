import { BadRequestException, Injectable } from '@nestjs/common';

import { ObjectId } from 'mongodb';
import { ResponseVariantsDB } from 'src/common/interfaces/ResponseVariantDb.interface';
import { PictureService } from 'src/common/services/picture.service';
import { PoolDatabase } from 'src/database/services/database-2.service';
import { CategoriesService } from 'src/modules/categories/services/categories.service';
import { CreateProductTiendaNubeDTO } from 'src/services/tienda-nube/dto/create-product-tienda-nube.dto';
import { UpdateProductTiendaNubeDto } from 'src/services/tienda-nube/dto/update-product-tienda-nube.dto';
import { TiendaNubeService } from 'src/services/tienda-nube/services/tienda-nube.service';
import { VariantProduct } from './variant.service';

@Injectable()
export class ProductsService {
  constructor(
    private readonly poolDatabase: PoolDatabase,
    // private readonly databaseService: DatabaseService,
    private readonly tiendaNubeService: TiendaNubeService,
    private readonly categoryService: CategoriesService,
    private readonly productVariantService: VariantProduct,
    private readonly pictureService: PictureService,
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

      let images = null;
      if (
        foundArticle.picture.includes('amazonaws') &&
        !foundArticle.containsVariants
      ) {
        images = [
          {
            src: foundArticle.picture,
          },
        ];
      }

      const dataNewProductTiendaNube = {
        images: images,
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
          stock: foundArticle?.allowSaleWithoutStock
            ? null
            : stockFound && stockFound.realStock > 0
              ? stockFound.realStock
              : 0,
          price:
            foundArticle.salePriceTN !== 0
              ? foundArticle.salePriceTN
              : foundArticle.salePrice,
          sku: foundArticle.barcode ?? null,
          weight: foundArticle.weight ?? null,
          width: foundArticle.width ?? null,
          height: foundArticle.height ?? null,
          depth: foundArticle.depth ?? null,
        },
      );
      // Creacion de variantes

      const foundCollectionV = await this.poolDatabase.getCollection(
        'variants',
        database,
      );

      const dataVarinat: ResponseVariantsDB[] =
        await this.poolDatabase.getVariantDataByArticle(productId, database);
      const variantProducts = await foundCollectionV
        .find({
          operationType: { $ne: 'D' },
          articleParent: new ObjectId(foundArticle._id.toString()),
        })
        .toArray();

      if (variantProducts.length > 0) {
        await this.massCreactionOfProductVariants(
          productId,
          token,
          userID,
          result.id,
          resultVariantName as string[],
          database,
        )
          .then((promise) => {
            return Promise.all(promise);
          })
          .then(async (result) => {
            result.map(async (productVariante: any, index) => {
              for (let variant of dataVarinat) {
                if (
                  productVariante.values[0].es ===
                  variant.variants[0].value.description
                ) {
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
          });
      }

      await foundCollection.updateOne(
        { _id: foundArticle._id },
        {
          $set: {
            tiendaNubeId: result.id,
            picture: result?.images[0]?.src ?? foundArticle.picture,
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

    const arrayCreateVariant = [];

    for (let variant of variantData) {
      const response = await this.tiendaNubeService.createVarianteByProduct(
        tokenTiendaNube,
        userIdTiendaNube,
        productTiendaNube,
        variant,
      );
      arrayCreateVariant.push(response);
    }
    return arrayCreateVariant;
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

          variantData['price'] =
            element.articleChildInfo.salePriceTN !== 0
              ? element.articleChildInfo.salePriceTN
              : element.articleChildInfo.salePrice;

          variantData['weight'] = element.articleChildInfo.weight ?? null;
          variantData['width'] = element.articleChildInfo.width ?? null;
          variantData['height'] = element.articleChildInfo.height ?? null;
          variantData['depth'] = element.articleChildInfo.depth ?? null;

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

      let description = {};

      if (foundArticle.observation) {
        description = {
          es: foundArticle.observation,
        };
      }
      const dataUpdateProductTiendaNube = {
        name: {
          es: foundArticle.description,
        },
        description: description,
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

      if (
        foundArticle.picture.includes('poscloud') &&
        !foundArticle.containsVariants
      ) {
        //buscar el producto en tn para borrar la imagen
        let productTn = await this.tiendaNubeService.findOne(
          token,
          userID,
          foundArticle.tiendaNubeId,
        );
        //borramos la imagen
        if (productTn?.images.length > 0) {
          for (const element of productTn.images) {
            await this.tiendaNubeService.deleteImageOfProduct(
              foundArticle.tiendaNubeId,
              element.id,
              token,
              userID,
            );
          }
        }
        //subimos la nueva imagen
        await this.tiendaNubeService.uploadImageOfProduct(
          foundArticle.tiendaNubeId,
          foundArticle.picture,
          token,
          userID,
        );
      }

      const result = await this.tiendaNubeService.updateProduct(
        token,
        userID,
        foundArticle.tiendaNubeId,
        dataUpdateProductTiendaNube as UpdateProductTiendaNubeDto,
      );

      if (result?.images[0]?.src) {
        await foundCollection.updateOne(
          { _id: foundArticle._id },
          {
            $set: {
              picture: result.images[0].src,
            },
          },
        );
      }

      const historiesCollection = await this.poolDatabase.getCollection(
        'histories',
        database,
      );

      const dataVarinat: ResponseVariantsDB[] =
        await this.poolDatabase.getVariantDataByArticle(productId, database);
      const variantProducts = await historiesCollection
        .find({
          'doc.articleParent': new ObjectId(foundArticle._id.toString()),
        })
        .toArray();

      if (foundArticle.containsVariants) {
        for (let variant of dataVarinat) {
          if (variant.articleChildInfo.tiendaNubeId) {
            const stockCollection = await this.poolDatabase.getCollection(
              'article-stocks',
              database,
            );
            const stockFound = await stockCollection.findOne({
              operationType: { $ne: 'D' },
              article: new ObjectId(variant.articleChild),
            });
            await this.tiendaNubeService.updateVarinat(
              token,
              userID,
              foundArticle.tiendaNubeId,
              variant.articleChildInfo.tiendaNubeId,
              {
                stock: variant?.articleChildInfo?.allowSaleWithoutStock
                  ? null
                  : stockFound && stockFound.realStock > 0
                    ? stockFound.realStock
                    : 0,

                price:
                  variant.articleChildInfo.salePriceTN !== 0
                    ? variant.articleChildInfo.salePriceTN
                    : variant.articleChildInfo.salePrice,
                sku: variant.articleChildInfo.barcode ?? null,
                weight: variant.articleChildInfo.weight ?? null,
                width: variant.articleChildInfo.width ?? null,
                height: variant.articleChildInfo.height ?? null,
                depth: variant.articleChildInfo.depth ?? null,
              },
            );
          } else {
            const stockCollection = await this.poolDatabase.getCollection(
              'article-stocks',
              database,
            );
            const stockFound = await stockCollection.findOne({
              operationType: { $ne: 'D' },
              article: variant.articleChild,
            });

            const values = [
              {
                es: variant.variants[0].value.description,
              },
            ];
            const attributes = [
              {
                es: variant.variants[0].type.name,
              },
            ];

            const dataUpdateProductTiendaNube = {
              attributes,
              name: {
                es: foundArticle.description,
              },
              description: description,
            };
            await this.tiendaNubeService.updateProduct(
              token,
              userID,
              foundArticle.tiendaNubeId,
              dataUpdateProductTiendaNube as UpdateProductTiendaNubeDto,
            );

            const response = await this.tiendaNubeService.createVariant(
              token,
              userID,
              foundArticle.tiendaNubeId,
              {
                values,
                stock: variant?.articleChildInfo?.allowSaleWithoutStock
                  ? null
                  : stockFound && stockFound.realStock > 0
                    ? stockFound.realStock
                    : 0,
                price:
                  variant.articleChildInfo.salePriceTN !== 0
                    ? variant.articleChildInfo.salePriceTN
                    : variant.articleChildInfo.salePrice,
              },
            );
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
            stock: foundArticle?.allowSaleWithoutStock
              ? null
              : stockFound && stockFound.realStock > 0
                ? stockFound.realStock
                : 0,

            price:
              foundArticle.salePriceTN !== 0
                ? foundArticle.salePriceTN
                : foundArticle.salePrice,
            sku: foundArticle.barcode ?? null,
            weight: foundArticle.weight ?? null,
            width: foundArticle.width ?? null,
            height: foundArticle.height ?? null,
            depth: foundArticle.depth ?? null,
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

      const foundCollection = await this.poolDatabase.getCollection(
        'articles',
        database,
      );

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
      await this.poolDatabase.getArticleByTiendaNube(tiendaNubeId, database);

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

  async removeVariant(database: string, productTn, variantTn) {
    try {
      if (!database) {
        throw new BadRequestException(`Database is required `);
      }

      await this.poolDatabase.initConnection(database);
      const { token, userID } =
        await this.poolDatabase.getCredentialsTiendaNube(database);
      if (!productTn || !variantTn) {
        throw new BadRequestException(`ID not found`);
      }

      const result = await this.tiendaNubeService.deleteVariant(
        token,
        userID,
        productTn,
        variantTn,
      );

      if (!result) {
        return 'Error al eliminar el producto';
      }
      return result;
    } catch (err) {
      throw err;
    }
  }
}
