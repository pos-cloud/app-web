import { Injectable } from '@nestjs/common';
import { MongoClient, Db, Collection } from 'mongodb';

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
      console.log('Conexión con MongoDB establecida:' + databaseName);
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
}
