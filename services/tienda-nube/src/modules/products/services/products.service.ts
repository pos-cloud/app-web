import { Injectable, BadRequestException } from '@nestjs/common';

import { DatabaseService } from 'src/database/services/database.service';
import { TiendaNubeService } from 'src/services/tienda-nube/services/tienda-nube.service';
import { CategoriesService } from 'src/modules/categories/services/categories.service';
import { VariantProduct } from './variant.service';
import { CreateProductTiendaNubeDTO } from 'src/services/tienda-nube/dto/create-product-tienda-nube.dto';
import { ObjectId } from 'mongodb';
import { UpdateProductTiendaNubeDto } from 'src/services/tienda-nube/dto/update-product-tienda-nube.dto';
import { ResponseVariantsDB } from 'src/common/interfaces/ResponseVariantDb.interface';

@Injectable()
export class ProductsService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly tiendaNubeService: TiendaNubeService,
    private readonly categoryService: CategoriesService,
    private readonly productVariantService: VariantProduct,
  ) {}

  async create(database: string, productId: string) {
    try {
      if (!database) {
        throw new BadRequestException(`Database is required `);
      }
      await this.databaseService.initConnection(database);
      const { token, userID } =
        await this.databaseService.getCredentialsTiendaNube();
      const foundCollection = this.databaseService.getCollection('articles');
      const foundArticle = await this.databaseService.getDocumentById(
        'articles',
        productId,
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
      const pictureUrls = foundArticle.pictures.map(
        (picture) => picture.picture,
      );

      const dataNewProductTiendaNube = {
        images: [
          {
            src: foundArticle.picture,
          },
          ...pictureUrls.map((src) => ({ src })),
        ],
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
        );

      dataNewProductTiendaNube['attributes'] = resultVariantName.map((e) => ({
        es: e,
      }));

      if (foundArticle.category) {
        await this.categoryService.findOneCategoryDb(foundArticle.category);

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

      const stockCollection =
        this.databaseService.getCollection('article-stocks');
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

      await this.massCreactionOfProductVariants(
        productId,
        token,
        userID,
        result.id,
        resultVariantName as string[],
      );

      await foundCollection.updateOne(
        { _id: foundArticle._id },
        {
          $set: {
            tiendaNubeId: result.id,
          },
        },
      );

      await this.databaseService.closeConnection();
      return result;
    } catch (err) {
      // await this.databaseService.initConnection(database);
      throw err;
    }
  }

  async massCreactionOfProductVariants(
    productId: string,
    tokenTiendaNube: string,
    userIdTiendaNube: string,
    productTiendaNube: string,
    variantName: string[],
  ) {
    const dataVarinat =
      await this.databaseService.getVariantDataByArticle(productId);

    if (dataVarinat.length == 0) return;

    const variantData = await this.clearDataVariant(
      dataVarinat,
      variantName,
      productTiendaNube,
      tokenTiendaNube,
      userIdTiendaNube,
    );

    const arrayCreateVariant = variantData.map((e) => {
      new Promise(async (resolve) => {
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

    await Promise.all(arrayCreateVariant);
  }
  async clearDataVariant(
    data: ResponseVariantsDB[],
    attributes: string[],
    productTiendaNube: string,
    tiendaNubeAccessToken: string,
    tiendaNubeUserId: string,
  ) {
    const dataClearPromises = data.map((element) => {
      return new Promise(async (resolve,reject) => {
        try{

     
        const variantData = {
          values: [],
        };

        console.log("upload image credential", productTiendaNube,tiendaNubeAccessToken,tiendaNubeUserId,data,attributes)
        //upload image, and add id image variant
        console.log("upload image 191",element.articleChildInfo?.picture )
        const image = await this.tiendaNubeService.uploadImageOfProduct(
          productTiendaNube,
          element.articleChildInfo?.picture ?? null,
          tiendaNubeAccessToken,
          tiendaNubeUserId,
        );
        console.log('upload image 197',image)
        if (image) {
          variantData['image_id'] = image.id;
        }
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

        console.log("product service upload 214")
        variantData['price'] = element.articleChildInfo.salePrice ?? 0;

        const stockCollection =
          this.databaseService.getCollection('article-stocks');
          
          try {
            const stockFound = await stockCollection.findOne({
              operationType: { $ne: 'D' },
              article: new ObjectId(element.articleChild),
            });
            console.log("product service upload 225",stockFound)

          variantData['stock'] =
            !stockFound || stockFound.realStock < 0 ? 0 : stockFound.realStock;
        } catch (error) {
          console.error(`Error al consultar la base de datos: ${error}`);
          variantData['stock'] = 0;
        }
        console.log("product service upload 233",variantData)

        resolve(variantData);
      }catch(error){
        console.error(`Error en la promesa: ${error}`);
        reject(error);
      }
      });
    });

    const resolvedData = await Promise.all(dataClearPromises);

    // `resolvedData` ahora contiene el resultado de todas las consultas
    return resolvedData;
  }

  async findAll(database: string, page: string) {
    try {
      console.log(page);
      if (!database) {
        throw new BadRequestException(`Database is required `);
      }
      await this.databaseService.initConnection(database);
      const { token, userID } =
        await this.databaseService.getCredentialsTiendaNube();

      const data = await this.tiendaNubeService.findAll(token, userID, page);

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
      await this.databaseService.initConnection(database);
      const { token, userID } =
        await this.databaseService.getCredentialsTiendaNube();

      const foundCollection = this.databaseService.getCollection('articles');

      const foundArticle = await this.databaseService.getDocumentById(
        'articles',
        productId,
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
        await this.categoryService.findOneCategoryDb(foundArticle.category);

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

      // console.log('update product , result 315', result);

      // eliminacion de imagenee
      try {
        this.deleteAllImageVariant(result.variants, result.id, token, userID);
      } catch (err) {}
      console.log('product service 327',result);
      if (foundArticle.picture != result.images[0].src) {
        const dataresult =
          await this.tiendaNubeService.updatePrincipalImageOfProduct(
            foundArticle.picture,
            result.id,
            result.images[0].id,
            token,
            userID,
          );

        await foundCollection.updateOne(
          { _id: foundArticle._id },
          {
            $set: {
              picture: dataresult.src,
            },
          },
        );
      }
      console.log('product service 347');

      const resultVariantName =
        await this.productVariantService.getProductVariantsPropertyNames(
          foundArticle._id,
        );

      const dataVariant =
        await this.databaseService.getVariantDataByArticle(productId);

      if (dataVariant.length == 0) {
        const stockCollection =
          this.databaseService.getCollection('article-stocks');
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
      console.log('product service 385',     foundArticle.tiendaNubeId,dataVariant,resultVariantName,token,userID);

      const variantData = await this.clearDataVariant(
        dataVariant,
        resultVariantName as string[],
        foundArticle.tiendaNubeId,
        token,
        userID,
      );
      console.log('product service 394',variantData);
      await this.tiendaNubeService.massiveVariantUpdate(
        token,
        userID,
        result.id,
        variantData,
      );
      console.log('product service 401');

      await this.databaseService.closeConnection();

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
        // console.log(result)
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
      await this.databaseService.initConnection(database);

      const foundCollection = this.databaseService.getCollection('articles');

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
      await this.databaseService.closeConnection();

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

      await this.databaseService.initConnection(database);
      const { token, userID } =
        await this.databaseService.getCredentialsTiendaNube();

      if (!tiendaNubeId) {
        throw new BadRequestException(`ID not found`);
      }
      await this.databaseService.getArticleByTiendaNube(tiendaNubeId);

      const result = await this.tiendaNubeService.removeProduct(
        tiendaNubeId,
        token,
        userID,
      );

      await this.databaseService.closeConnection();

      if (!result) {
        return false;
      }

      return result;
    } catch (err) {
      throw err;
    }
  }
}
