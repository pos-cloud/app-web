import { Injectable } from '@nestjs/common';
import { MongoClient, Db, Collection, ObjectId } from 'mongodb';

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
      console.log('Conexión con MongoDB establecida');
    } catch (error) {
      console.error('Error al conectar con MongoDB:', error);
      throw error;
    }
  }

  getCollection(collectionName: string): Collection<any> {
    if (!this.database) {
      throw new Error(
        'La conexión con la base de datos no ha sido establecida',
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
}
