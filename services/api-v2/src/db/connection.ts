import * as mongoose from 'mongoose'
import 'dotenv/config';

import config from './../utils/config'
import initializeControllers from './../utils/initialize-controllers'

class ConnectionController {
  public static connections: any[] = []

  public createConnection(name: string) {
    let conn

    if (name) {
      const uri: string = config.MONGO_URL + name

      conn = this.getConnection(name)

      if (!conn) {
        console.log(' Creó conexión con base de datos ' + name + ' URL: ' + uri)

        conn = mongoose.createConnection(uri, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          useFindAndModify: false,
        })

        ConnectionController.connections.push({name, conn})

        initializeControllers(null, name)
      }
    }

    return conn
  }

  public getConnection(name: string) {
    let conn = null

    if (ConnectionController.connections.length > 0) {
      for (const c of ConnectionController.connections) {
        if (c.name === name) {
          conn = c.conn
        }
      }
    }

    return conn
  }

  public getSchema(database: string, collection: string) {
    return this.getConnection(database).base.modelSchemas[collection]
  }

  public getModel(database: string, collection: string) {
    return this.getConnection(database).models[collection]
  }
}

export default ConnectionController
