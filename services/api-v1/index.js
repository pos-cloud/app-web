'use strict'
const moment = require('moment')
moment.locale('es')
const Sentry = require('@sentry/node')
const app = require('./app')
const config = require('./config')
const clientsPOS = new Array([])
const clientsAPPS = new Array([])

// BANDERA PARA VALIDAR SI EL PROCESO DE VERIFICACIÓN DE SOCKET CONECTADO ESTA SIENDO PROCESADO
let verificationProcess = false

// SERVER
const port = config.PORT || 300
const server = app.listen(port, function () {
  console.log(`${moment().format('YYYY-MM-DDTHH:mm:ssZ')} Server ${config.NODE_ENV} Funcionando en puerto ${port}`)
  initSentry()
//test
// MercadopagoController.verifyPayments();
// MercadopagoController.startPaymentVerificationTask();
})

function initSentry () {
  Sentry.init({
    dsn: 'https://271e6e3e305747d6945e77ff3a7bdac3@o469833.ingest.sentry.io/6142644',
    tracesSampleRate: 1.0,
    environment: config.NODE_ENV,
  })
}

// SOCKET
const io = require('socket.io').listen(server, {
    log: false,
    agent: false,
    origins: '*:*',
    transports: ['websocket', 'htmlfile', 'xhr-polling', 'jsonp-polling', 'polling']
});

setInterval(function () {
    if (!verificationProcess) {
        verifyConnectedClients();
    }
}, 3600000);

io.on('connection', function (socket) {

    socket.on('start', function (data) {
        socket.data = data;
        if (socket.data && socket.data.database !== '') {
            if (socket.data.clientType === 'pos') {
                if (!clientsPOS[socket.data.database]) clientsPOS[socket.data.database] = new Array();
                if (!existsSocket(socket)) {
                    console.log(moment().format('YYYY-MM-DDTHH:mm:ssZ') + ' Inicia Socket POS ' + socket.id + '  ' + socket.data.database);
                    clientsPOS[socket.data.database].push(socket);
                }
            } else {
                if (!clientsAPPS[socket.data.database]) clientsAPPS[socket.data.database] = new Array();
                if (!existsSocket(socket)) {
                    console.log(moment().format('YYYY-MM-DDTHH:mm:ssZ') + ' Inicia Socket APP ' + socket.id + '  ' + socket.data.database);
                    clientsAPPS[socket.data.database].push(socket);
                }
            }
        }
    });

    socket.on('finish', function () {
        if (socket && socket.data) deleteSocket(socket);
    });

    socket.on('sync_gallery', function (mnj) {
        if (socket && socket.data) {
            if (socket.data.database && socket.data.database !== '' && clientsPOS[socket.data.database]) {
                for (let client of clientsPOS[socket.data.database]) {
                    client.emit('gallery', mnj);
                }
            }
        }
    });

    socket.on('message', function (mnj) {
        console.log(moment().format('YYYY-MM-DDTHH:mm:ssZ') + ' Mensaje ' + mnj + ' Socket APP ' + socket.id + '  ' + socket.data.database);
        let cant = 0;
        if (socket && socket.data) {
            if (socket.data.clientType !== 'pos') {
                if (socket.data.database && socket.data.database !== '' && clientsPOS[socket.data.database]) {
                    for (let client of clientsPOS[socket.data.database]) {
                        client.emit('message', mnj);
                        cant++;
                    }
                }
            }
        }
        console.log(moment().format('YYYY-MM-DDTHH:mm:ssZ') + ' Receptores de Mensaje Socket APP ' + socket.id + '  ' + socket.data.database + ' ' + cant + ' CLIENTES ');
    });
});

function existsSocket (socket) {

    var exists = false;
    if (socket && socket.data) {
        if (socket.data.clientType === 'pos') {
            for (let client of clientsPOS[socket.data.database]) {
                if (client.id === socket.id) {
                    exists = true;
                }
            }
        } else {
            for (let client of clientsAPPS[socket.data.database]) {
                if (client.id === socket.id) {
                    exists = true;
                }
            }
        }
    }
    return exists;
}

function deleteSocket (socket) {

    let i = 0;
    let socketDelete;

    if (socket && socket.data) {
        if (socket.data.clientType === 'pos') {
            for (let client of clientsPOS[socket.data.database]) {
                if (client.id === socket.id) {
                    socketDelete = i;
                }
                i++;
            }
            clientsPOS[socket.data.database].splice(socketDelete, 1);
            console.log(moment().format('YYYY-MM-DDTHH:mm:ssZ') + ' Desconecta Socket POS ' + socket.id + '  ' + socket.data.database);
        } else {
            for (let client of clientsAPPS[socket.data.database]) {
                if (client.id === socket.id) {
                    socketDelete = i;
                }
                i++;
            }
            clientsAPPS[socket.data.database].splice(socketDelete, 1);
            console.log(moment().format('YYYY-MM-DDTHH:mm:ssZ') + ' Desconecta Socket APP ' + socket.id + '  ' + socket.data.database);
        }
    }
}

function verifyConnectedClients () {

    verificationProcess = true;

    var totalPOS = 0;
    var totalAPPS = 0;
    console.log('_______________________________________________________________________________________________________________________');
    console.log('VERIFICACIÓN DE CLIENTES CONECTADOS VÍA SOCKET');
    console.log(' ');
    for (var database in clientsPOS) {
        console.log(moment().format('YYYY-MM-DDTHH:mm:ssZ') + ' POS ' + database + ' conectados: ' + clientsPOS[database].length);
        console.log(' ');
        totalPOS += clientsPOS[database].length;
        for (var socket of clientsPOS[database]) {
            if (!socket.connected) deleteSocket(socket);
        }
    }

    for (var database in clientsAPPS) {
        console.log(moment().format('YYYY-MM-DDTHH:mm:ssZ') + 'APPs ' + database + ' conectados: ' + clientsAPPS[database].length);
        console.log(' ');
        totalAPPS += clientsAPPS[database].length;
        for (var socket of clientsAPPS[database]) {
            if (!socket.connected) deleteSocket(socket);
        }
    }
    console.log(moment().format('YYYY-MM-DDTHH:mm:ssZ') + ' TOTAL CLIENTES POS conectados: ' + totalPOS);
    console.log(moment().format('YYYY-MM-DDTHH:mm:ssZ') + ' TOTAL CLIENTES APPS conectados: ' + totalAPPS);
    console.log('_______________________________________________________________________________________________________________________');
    console.log(' ');
    verificationProcess = false;
}
/*
// Remember, in a real application, you should ensure your user is authenticated and authorized to view the chart before you return the signed URL.

// Replace these constants with the correct values for your Charts instance
const CHARTS_EMBEDDING_BASE_URL = 'https://charts.mongodb.com/charts-indie-group-jixzm';  // Replace with the base URL to your Charts instance, e.g. https://charts.mongodb.com/charts-foo-abcde (no trailing slash)
const CHARTS_TENANT_ID = 'f72b0c25-788c-4617-8858-185abe16bae1'; // Replace with your Charts Tenant ID from the Embed Chart snippet
const EMBEDDING_SIGNING_KEY = 'f7a8263dc2ef4a4b'; // Replace with the Embedding Signing Key generated by your Charts admin
const EXPIRY_TIME_SECONDS = 1300; // Set to your preferred expiry period
const FILTER_DOCUMENT = { "letter": "A" }; // Set to a MongoDB Query document if you want to filter the chart, e.g. { foo: { $gt: 10 }}
const AUTOREFRESH_TIME_SECONDS = null; // Set to a number >=10 if you want the chart to autorefresh

const express = require('express');
const crypto = require('crypto');

app.get('/api/embeddedchart/:id', (req, res) => {
    const timestamp = Math.floor(Date.now() / 1000);
    let payload = `id=${req.params.id}&tenant=${CHARTS_TENANT_ID}&timestamp=${timestamp}&expires-in=${EXPIRY_TIME_SECONDS}`;
    if (FILTER_DOCUMENT) {
        payload += `&filter=${encodeURIComponent(JSON.stringify(FILTER_DOCUMENT))}`;
    }
    if (AUTOREFRESH_TIME_SECONDS) {
        payload += `&autorefresh=${AUTOREFRESH_TIME_SECONDS}`;
    }
    const hmac = crypto.createHmac('sha256', EMBEDDING_SIGNING_KEY);
    hmac.update(payload);
    const signature = hmac.digest('hex');
    // generate url for iframe
    const url = `${CHARTS_EMBEDDING_BASE_URL}/embed/charts?${payload}&signature=${signature}`;

    res.send({url : url});
});

app.use(express.static('static'));
*/