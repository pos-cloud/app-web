const mongoose = require('mongoose')
const config = require('./config')
const moment = require('moment')
moment.locale('es')

mongoose.Promise = global.Promise

const connections = new Array([])

function createConnection (name) {
  const uri = config.MONGO_URL + name

  let conn = getConnection(name)

  if (!conn) {
    console.log(
      moment().format('YYYY-MM-DDTHH:mm:ssZ') +
        ' Creó conexión con base de datos:' +
        name +
        ' URI:' +
        uri,
    )
    conn = mongoose.createConnection(uri, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    })
    const connection = {
      name: name,
      conn: conn,
    }
    connections.push(connection)
  }

  return conn
}

function getConnection (name) {
  let conn = null

  if (connections.length > 0) {
    for (let i = 0; i < connections.length; i++) {
      if (connections[i]["name"] === name) {
        conn = connections[i]["conn"]
      }
    }
  }

  return conn
}

module.exports = createConnection(config.DEFAULT)

module.exports.on = createConnection
