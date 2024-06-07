import { Injectable } from '@nestjs/common';
import { MongoClient, Db, Collection, ObjectId } from 'mongodb';
import { ResponseVariantsDB } from 'src/common/interfaces/ResponseVariantDb.interface';

@Injectable()
export class DatabaseService {
  private client: MongoClient;
  private database: Db | null;
  private collection: Collection<any> | null;

  constructor() {
    this.client = null;
    this.database = null;
    this.collection = null;
  }

  async initConnection(databaseName: string) {
    try {
      const mongoUri = `${
        process.env.MONGO_URL || 'mongodb://localhost:27017'
      }/${databaseName}`;
      if (!this.client) {
        this.client = await MongoClient.connect(mongoUri);
        this.database = this.client.db(databaseName);
      }
      console.log('Conexión con MongoDB establecida' + this.database);
    } catch (error) {
      console.error('Error al conectar con MongoDB:', error);
      throw error;
    }
  }

  getCollection(collectionName: string): Collection<any> {
    if (!this.database) {
      throw new Error(
        'La conexión con la base de datos no ha sido establecida' +
          this.database,
      );
    }
    this.collection = this.database.collection(collectionName);
    return this.collection;
  }

  async getDocumentById(
    collectionName: string,
    documentId: string,
  ): Promise<any> {
    try {
      if (!this.database) {
        throw new Error(
          'La conexión con la base de datos no ha sido establecida',
        );
      }
      const collection = this.database.collection(collectionName);
      const objectId = new ObjectId(documentId);
      const document = await collection.findOne({ _id: objectId });

      return document;
    } catch (error) {
      console.error('Error al obtener el documento por ID:', error);
      throw error;
    }
  }

  async closeConnection() {
    try {
      if (this.client) {
        await this.client.close();
        console.log('Conexión con MongoDB cerrada');
        this.client = null;
        this.database = null;
        this.collection = null;
      }
    } catch (error) {
      console.error('Error closing MongoDB connection:', error);
      throw error;
    }
  }
  async getCredentialsTiendaNube() {
    const itemCollection = this.getCollection('configs');

    // console.log(itemCollection)
    const documents = await itemCollection.find({}).toArray();

    const { token, userID } = documents[0].tiendaNube;
    return {
      token,
      userID,
    };
  }

  async getVariantDataByArticle(productParent: string) {
    const itemCollection = this.getCollection('variants');

    const documents = await itemCollection
      .aggregate([
        {
          $match: {
            operationType: { $ne: "D" },
            articleParent: new ObjectId(productParent),
          },
        },
        {
          $lookup: {
            from: 'variant-types',
            localField: 'type',
            foreignField: '_id',
            as: 'typeInfo',
          },
        },
        {
          $lookup: {
            from: 'variant-values',
            localField: 'value',
            foreignField: '_id',
            as: 'valueInfo',
          },
        },
        {
          $lookup: {
            from: 'articles',
            localField: 'articleChild',
            foreignField: '_id',
            as: 'articleChildInfo',
          },
        },
        {
          $unwind: '$typeInfo',
        },
        {
          $unwind: '$valueInfo',
        },
        {
          $unwind: '$articleChildInfo',
        },
        {
          $group: {
            _id: {
              articleParent: '$articleParent',
              articleChild: '$articleChild',
            },
            variants: {
              $push: {
                type: '$typeInfo',
                value: '$valueInfo',
                creationUser: '$creationUser',
                creationDate: '$creationDate',
                operationType: '$operationType',
                __v: '$__v',
              },
            },
            articleChildInfo: { $first: '$articleChildInfo' },
          },
        },
        {
          $project: {
            _id: 0,
            articleParent: '$_id.articleParent',
            articleChild: '$_id.articleChild',
            variants: 1,
            articleChildInfo: 1,
          },
        },
      ])
      .toArray();

    return documents as unknown as ResponseVariantsDB[];
  }

  async getArticleByTiendaNube(tiendaNubeId: string) {
    try {
      const collection = this.getCollection('articles');
      const document = await collection.findOne({
        tiendaNubeId: parseInt(tiendaNubeId),
      });
      if (document.tiendaNubeId) {
        const update = await collection.updateOne(
          { _id: document._id },
          { $set: { tiendaNubeId: null } },
        );
        return update;
      }
    } catch (error) {
      console.log(error);
    }
  }
}
