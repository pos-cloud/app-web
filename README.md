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

## Acceso a demo produccion

- url: poscloud.ar
- empresa: demo
- user: admin
- pass: pos

## Acceso a testing

- testing.poscloud.ar

## Contribuir 

- git clone https://github.com/pos-cloud/system.git

Desde notion tomamos el tk y el atributo branch nos dice el nombre de la rama y desde testing se crea

- git branch TK-??
Se desarrolla y se hace commit de todo sobre la rama
Luego hacemos 
- git fetch
- git checkout testing
- git pull
- git checkout TK-??
- git rebase testing
resolvemos conflicto si hay git rebase --continue
- git push --force-with-lease
Esto hace que tu commit quede sobre lo de testing 
Realizar PR a testing

## Canales de comunicación

Discord 
- https://discord.gg/SFyaNdPU

Notion
- https://www.notion.so/679da073670e42e1bde8524a39f50b56?v=aec8fe73ce3344fbaf54fa451342ff12
