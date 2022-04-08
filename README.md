# ADMIN PARA POSCLOUD

### Tech stack
- [Angular](https://angular.io/)
- [Typescript](https://www.typescriptlang.org/)

## Build the complete project

The cashback service is made up by:
- [Admin Frontend](https://bitbucket.org/pos-cloud/poscloud-system/)
- [Rest Api](https://bitbucket.org/pos-cloud/poscloud-api/)
- [Rest Api V8](https://bitbucket.org/pos-cloud/apiv8/)

### Run locally

- npm install
- npm start

Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive/pipe/service/class/module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Build Cloud

docker build -t admin-poscloud . 
docker run -d -it --name pos admin-poscloud
rm -R /var/www/poscloud/
docker cp pos:/app/dist/ /var/www/poscloud/