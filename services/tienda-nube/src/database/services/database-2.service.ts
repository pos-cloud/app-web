import { Injectable } from '@nestjs/common';

import { MongoClient, Db, Collection, ObjectId } from 'mongodb';
import { ResponseVariantsDB } from 'src/common/interfaces/ResponseVariantDb.interface';

@Injectable()
export class PoolDatabase {
  public static connections: any[] = [];

  public async initConnection(name: string) {
    let connection: MongoClient | null;

    if (name) {
      const originDatabase =
        process.env.MONGO_URL || 'mongodb://localhost:27017';

      connection = this.getConnection(name);

      if (!connection) {
        console.log(
          'Conexión con MongoDB establecida  URL: ' +
            originDatabase +
            '/' +
            name,
        );

        const client = await MongoClient.connect(originDatabase);
        const database = client.db(name);

        PoolDatabase.connections.push({ name, connection: client, database });
      }
    }

    return connection;
  }

  async getCollection(
    collectionName: string,
    database: string,
  ): Promise<Collection<any>> {
    const connection = this.getConnection(database);
    if (!connection) {
      throw new Error(
        'La conexión con la base de datos no ha sido establecida' + connection,
      );
    }
    const collection = await this.getSchema(database, collectionName);

    return collection;
  }

  async getDocumentById(
    collectionName: string,
    documentId: string,
    database: string,
  ): Promise<any> {
    try {
      const connection = this.getConnection(database);

      if (!connection) {
        throw new Error(
          'La conexión con la base de datos no ha sido establecida',
        );
      }
      const collection = await this.getSchema(database, collectionName);
      const objectId = new ObjectId(documentId);
      const document = await collection.findOne({ _id: objectId });

      return document;
    } catch (error) {
      console.error('Error al obtener el documento por ID:', error);
      throw error;
    }
  }

  async closeConnection(database: string) {
    const connection = this.getConnection(database);

    try {
      if (connection) {
        await connection.close();
        console.log('Conexión con MongoDB cerrada');
        PoolDatabase.connections.filter((e) => e.name != database);
      }
    } catch (error) {
      console.error('Error closing MongoDB connection:', error);
      throw error;
    }
  }
  async getCredentialsTiendaNube(database: string) {
    const itemCollection = await this.getCollection('configs', database);

    const documents = await itemCollection.find({}).toArray();

    const { token, userID } = documents[0].tiendaNube;
    return {
      token,
      userID,
    };
  }

  async getVariantDataByArticle(productParent: string, database: string) {
    const itemCollection = await this.getCollection('variants', database);

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

  async getArticleByTiendaNube(tiendaNubeId: string, database: string) {
    try {
      const collection = await this.getCollection('articles', database);
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

  public getSchema(database: string, collection: string) {
    return this.getDb(database).collection(collection);
  }

  public getDb(name: string) {
    let database = null;
    if (PoolDatabase.connections.length > 0) {
      for (const itemPool of PoolDatabase.connections) {
        if (itemPool.name === name) {
          database = itemPool.database;
        }
      }
    }

    return database;
  }
  public getConnection(name: string) {
    let connection = null;
    if (PoolDatabase.connections.length > 0) {
      for (const database of PoolDatabase.connections) {
        if (database.name === name) {
          connection = database.connection;
        }
      }
    }

    return connection;
  }
}
