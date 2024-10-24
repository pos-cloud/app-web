
![Logo-Final](https://github.com/user-attachments/assets/2d32a3c6-11e9-4b01-a0af-f1696914bd6d)



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

##### Restore database example

    mongorestore --db demo --archive=/src/asstes/demo.gz --gzip

##### Sandbox
  - api: https://d-api-v1.poscloud.ar
  - apiv2: https://d-api-v2.poscloud.ar
  - apiPrint: https://d-api-print.poscloud.ar 
  - apiStorage: https://d-api-storage.poscloud.ar
  - apiTiendaNube: https://d-api-tiendanube.poscloud.ar

### Flow
<img width="809" alt="image" src="https://github.com/user-attachments/assets/7bc384db-18a1-4bb3-b02a-4d9332e80e91">


### Estructura FRONT
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
|   |   |-- point-of-sales/
|   |   |   |-- counter/
|   |   |   |-- resto/
|   |   |   |-- delivery/
|   |   |   |-- tienda-nube/
|   |   |   |   |-- get-orders/
|   |   |   |   |-- fulfilled/
|   |   |   |   |-- cancel/
|   |   |   |   |-- tienda-nube.component.ts
|   |   |   |   |-- tienda-nube.component.css
|   |   |   |   |-- tienda-nube.component.html
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
	  │         │
    │         └─⫸ Summary in present tense. Not capitalized. No period at the end
    │
    └─⫸ Commit Type: build|docs|feat|fix|perf|refactor|test|style
  
```

##### Type

Must be one of the following:

-   **build**: Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm).
-   **docs**: Documentation only changes.
-   **feat**: A new feature.
-   **fix**: A bug fix.
-   **perf**: A code change that improves performance.
-   **refactor**: A code change that neither fixes a bug nor adds a feature.
-   **test**: Adding missing tests or correcting existing tests.
-   **style**: Changes that exclusively focus on styling and formatting.
