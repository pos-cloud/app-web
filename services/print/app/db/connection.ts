import { MongoClient, Db, Collection } from 'mongodb';

//hello
class MongoDBManager {
  private client: MongoClient | null = null;
  private database: Db | null = null;
  private collection: Collection<any> | null = null;
  async initConnection(databaseName: string) {
    try {
      const mongoUri = `mongodb://localhost:27017/${databaseName}`;
      if (!this.client) {
        this.client = new MongoClient(mongoUri);
        await this.client.connect();
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

  async ensureConnection(databaseName: string) {
    if (!this.client) {
      await this.initConnection(databaseName);
    }
  }
}

export default MongoDBManager;