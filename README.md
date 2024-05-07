
![Logo Final](https://github.com/pos-cloud/system/assets/13305254/03378ed8-3699-4355-877a-e92c67f3db90)


###  Dependencias
------------
- [Angular](https://angular.io/)  v15.0.0
- [VSCode](https://code.visualstudio.com/)
- NodeJs v19.7.0 (usar [nvm](https://github.com/nvm-sh/nvm))
- [Git](https://git-scm.com/) 
- [Filezilla](https://filezilla-project.org/)
- [MongoDB](https://www.mongodb.com/)

### Run locally
------------
     npm i --force
     npm start


### DEV Access
------------
- url: dev.poscloud.ar
- negocio: demo
- user: admin
- pass: pos

##### Restore database

    mongorestore --db demo --archive=/src/asstes/demo.gz --gzip

### Servicios

##### Ambientes para desarrollo
  - api: https://d-api-v1.poscloud.ar
  - apiv2: https://d-api-v2.poscloud.ar
  - apiPrint: https://d-api-print.poscloud.ar
  - apiStorage: https://d-api-storage.poscloud.ar
  - apiTiendaNube: https://d-api-tiendanube.poscloud.ar

### Infraestructura

#### Doc para servidores
Puerto para este servidor que estas destinados a las API

- 300 - api-v1-poscloud
- 301 - api-fit
- 302 - api-pdf-poscloud
- 303 - api-storage-poscloud
- 304 - front-poscloud
- 308 - api-v2-poscloud

Agregar un nuevo sitio 
- primero verificamos que el puerto no esta ocupado 
	netstat -tuln | grep 301
- segundo creamos el archivo dentro de 
	cd /etc/apache2/sites-available/
- agregamos el sitio 
	sudo a2ensite prod.poscloud
- verificamos que este bien configurado apache 
	sudo apache2ctl configtest
- recargamos la config
	sudo systemctl reload apache2

Caso de tener que volver atrás 
- sudo a2dissite nombre_del_sitio
- sudo systemctl reload apache2

### Estructura
```
src/
|-- app/
|   |-- main/
|   |   |-- services/
|   |   |   |-- auth.service.ts
|   |   |   |-- file.service.ts
|   |   |-- guards/
|   |   |-- interceptors/
|   |   |-- directives/
|   |   |-- pipes/
|   |-- shared/
|   |   |-- components/
|   |   |   |-- datatable/
|   |   |   |-- toast/
|   |   |   |-- tooltip/
|   |   |-- models/
|   |   |-- interface/
|   |   |   |-- service.interface.ts
|   |   |   |-- resultable.interface.ts
|   |-- components/
|   |   |-- models/
|   |   |   |-- article
|   |   |   |   |-- crud/
|   |   |   |   |-- list-articles/
|   |   |   |   |-- actions/
|   |   |   |   |   |-- update-prices/
|   |   |   |   |-- article.service.ts
|   |   |   |   |-- article.ts
|   |   |   |-- models.module.ts
|   |   |   |-- models.service.ts
|   |   |   |-- modes.router.ts
|   |   |-- reports/
|   |   |   |-- report-1
|   |   |   |   |-- report-1.component.ts
|   |   |   |   |-- report-1.component.css
|   |   |   |   |-- report-1.component.html
|   |   |   |-- report.service.ts
|   |   |   |-- report.module.ts
|   |   |   |-- report.router.ts
|   |   |-- transaction/
|   |   |   |-- add-article-by-transaction/
|   |   |   |-- movement-of-cancellation/
|   |   |   |-- add-mov-cash/
|   |   |   |-- cancelation/
|   |   |   |-- list-tables-resto/
|   |   |-- components.routes.ts
|   |   |-- components.module.ts
|   |-- layout/
|   |   |-- claim/
|   |   |-- header/
|   |   |-- footer/
|   |   |-- home/
|   |-- pages/
|   |   |-- login/
|   |   |-- register/
|   |   |-- menu/
|   |   |-- add-transaction/
|   |   |   |-- counter/
|   |   |   |-- resto/
|   |   |   |-- delivery/
|   |-- app.routes.ts
|   |-- app.component.html
|   |-- app.component.ts
|   |-- app.module.ts
|-- assets/
|   |-- i18n/
|   |   |-- en.json
|   |   |-- es.json
|-- environments/
|   |-- environments.dev.ts
|   |-- environments.prod.ts
|   |-- environments.ts
```
### Contribuir 

------------
Project ->  https://github.com/orgs/pos-cloud/projects/1 

- git clone https://github.com/pos-cloud/system.git
- git branch #XXX
Se desarrolla y se hace commit de todo sobre la rama
Luego hacemos 
- git fetch
- git checkout dev
- git pull
- git checkout #XXX
- git rebase dev
resolvemos conflicto si hay git rebase --continue
- git push --force-with-lease
Esto hace que tu commit quede sobre lo de testing 
Realizar PR a testing


#### Conventional Commits

```
 <type>: <short summary>
	  │             │
    │             └─⫸ Summary in present tense. Not capitalized. No period at the end
    │
    └─⫸ Commit Type: build|docs|feat|fix|refactor|test
  
```

##### Type

Must be one of the following:

-   **build**: Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)
-   **docs**: Documentation only changes
-   **feat**: A new feature
-   **fix**: A bug fix
-   **perf**: A code change that improves performance
-   **refactor**: A code change that neither fixes a bug nor adds a feature
-   **test**: Adding missing tests or correcting existing tests
