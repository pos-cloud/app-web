<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Config

| variable | description |
|----------|----------|
| TOKEN_SECRET    | jwt secret key | 
| GCP_PROJECT_ID    | google cloud project name   |
| GCP_KEY_FILE_PATH   | created service account file name   |
| GCP_BUCKET   | google cloud storage bucket name  |

### add service account file

## Installation

```bash
$ yarn install
```

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```



## License

Nest is [MIT licensed](LICENSE).



name: donweb-Prod
on:
  push:
    branches: [ dev ]
  workflow_dispatch:
jobs:
  build:
    runs-on: prod
    steps:
      - uses: actions/checkout@v3
      - run: docker rm -f api-storage
      - run: docker build -t api-storage -f Dockerfile.dev .
      - run: docker run -v /home:/home --restart unless-stopped --net host --name api-storage -d -it -p 3000:3000 api-storage


       docker cp polirrubrojb/images api-storage-poscloud:/app/dist/images


db.configs.find({}).forEach(function(doc) {
    db.configs.update(
        { _id: doc._id },
        { $set: { picture: doc.companyPicture } }
    );
});


1- Pasar todas las carpetas al directorio /dist
2- Hacer un update de todos los config para que el archivo este en .picture
3- Conseguir todos los token de cada cliente 
4- Ejecutar los post


db.configs.find({}).forEach(function(doc) {
    db.configs.update(
        { _id: doc._id },
        { $set: { companyPicture: "https://storage.googleapis.com/poscloud/desdeelllano/configs/1696380823963-62f5130dbe63c50026ea75ee-images.jpg" } }
    );
});



docker cp 1516 api-storage:/app/dist
docker cp aaron api-storage:/app/dist
docker cp bardo api-storage:/app/dist
docker cp bauma api-storage:/app/dist
docker cp buendescanso api-storage:/app/dist
docker cp chemaxfullcar api-storage:/app/dist
docker cp desdeelllano api-storage:/app/dist
docker cp donaelena api-storage:/app/dist
docker cp elestablo api-storage:/app/dist
docker cp gontero api-storage:/app/dist
docker cp granabasto api-storage:/app/dist
docker cp in api-storage:/app/dist
docker cp jaguernight api-storage:/app/dist
docker cp los4hermanos api-storage:/app/dist
docker cp polirrubrojb api-storage:/app/dist
docker cp quierosersanto api-storage:/app/dist
docker cp rango api-storage:/app/dist
docker cp rocionicola api-storage:/app/dist
docker cp syf api-storage:/app/dist
docker cp syp api-storage:/app/dist
docker cp zass api-storage:/app/dist

use 1516
db.configs.find({}).forEach(function(doc) {
    db.configs.update(
        { _id: doc._id },
        { $set: { picture: doc.companyPicture } }
    );
});
use aaron
db.configs.find({}).forEach(function(doc) {
    db.configs.update(
        { _id: doc._id },
        { $set: { picture: doc.companyPicture } }
    );
});
use bardo
db.configs.find({}).forEach(function(doc) {
    db.configs.update(
        { _id: doc._id },
        { $set: { picture: doc.companyPicture } }
    );
});
use bauma
db.configs.find({}).forEach(function(doc) {
    db.configs.update(
        { _id: doc._id },
        { $set: { picture: doc.companyPicture } }
    );
});
use buendescanso
db.configs.find({}).forEach(function(doc) {
    db.configs.update(
        { _id: doc._id },
        { $set: { picture: doc.companyPicture } }
    );
});
use chemaxfullcar
db.configs.find({}).forEach(function(doc) {
    db.configs.update(
        { _id: doc._id },
        { $set: { picture: doc.companyPicture } }
    );
});
use desdeelllano
db.configs.find({}).forEach(function(doc) {
    db.configs.update(
        { _id: doc._id },
        { $set: { picture: doc.companyPicture } }
    );
});
use donaelena
db.configs.find({}).forEach(function(doc) {
    db.configs.update(
        { _id: doc._id },
        { $set: { picture: doc.companyPicture } }
    );
});
use elestablo
db.configs.find({}).forEach(function(doc) {
    db.configs.update(
        { _id: doc._id },
        { $set: { picture: doc.companyPicture } }
    );
});
use gontero
db.configs.find({}).forEach(function(doc) {
    db.configs.update(
        { _id: doc._id },
        { $set: { picture: doc.companyPicture } }
    );
});
use granabasto
db.configs.find({}).forEach(function(doc) {
    db.configs.update(
        { _id: doc._id },
        { $set: { picture: doc.companyPicture } }
    );
});
use in
db.configs.find({}).forEach(function(doc) {
    db.configs.update(
        { _id: doc._id },
        { $set: { picture: doc.companyPicture } }
    );
});
use jaguernight
db.configs.find({}).forEach(function(doc) {
    db.configs.update(
        { _id: doc._id },
        { $set: { picture: doc.companyPicture } }
    );
});
use los4hermanos
db.configs.find({}).forEach(function(doc) {
    db.configs.update(
        { _id: doc._id },
        { $set: { picture: doc.companyPicture } }
    );
});
use polirrubrojb
db.configs.find({}).forEach(function(doc) {
    db.configs.update(
        { _id: doc._id },
        { $set: { picture: doc.companyPicture } }
    );
});
use quierosersanto
db.configs.find({}).forEach(function(doc) {
    db.configs.update(
        { _id: doc._id },
        { $set: { picture: doc.companyPicture } }
    );
});
use rango
db.configs.find({}).forEach(function(doc) {
    db.configs.update(
        { _id: doc._id },
        { $set: { picture: doc.companyPicture } }
    );
});
use rocionicola
db.configs.find({}).forEach(function(doc) {
    db.configs.update(
        { _id: doc._id },
        { $set: { picture: doc.companyPicture } }
    );
});
use syf
db.configs.find({}).forEach(function(doc) {
    db.configs.update(
        { _id: doc._id },
        { $set: { picture: doc.companyPicture } }
    );
});
use syp
db.configs.find({}).forEach(function(doc) {
    db.configs.update(
        { _id: doc._id },
        { $set: { picture: doc.companyPicture } }
    );
});
use zass
db.configs.find({}).forEach(function(doc) {
    db.configs.update(
        { _id: doc._id },
        { $set: { picture: doc.companyPicture } }
    );
});



1516
aaron
bardo
bauma
buendescanso
chemaxfullcar
desdeelllano
donaelena
elestablo
gontero
granabasto
in
jaguernight
los4hermanos
polirrubrojb
quierosersanto
rango
rocionicola
syf
syp
zass