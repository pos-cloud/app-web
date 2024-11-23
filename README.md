
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
## Contribuir

---

- **Kanban board**: [POS Cloud Project](https://github.com/orgs/pos-cloud/projects/1)

#### Conventional Commits

```text
<type>: <short summary>
 │        │
 │        └─⫸ Resumen en tiempo presente, no capitalizado y sin punto final.
 │
 └─⫸ Tipo de commit: build | docs | feat | fix | perf | refactor | test | style
```

#### Type

| Tipo             | Descripción                                                           |
| ---------------- | --------------------------------------------------------------------- |
| 🛠️ **build**:    | Cambios que afectan el sistema de build o dependencias externas.      |
| 📝 **docs**:     | Cambios relacionados exclusivamente con la documentación.             |
| ✨ **feat**:     | Incorporación de una nueva característica.                            |
| 🐛 **fix**:      | Corrección de un bug.                                                 |
| ⚡ **perf**:     | Cambios en el código que mejoran el rendimiento.                      |
| ♻️ **refactor**: | Reorganización del código sin afectar la funcionalidad.               |
| ✅ **test**:     | Adición o corrección de pruebas.                                      |
| 🎨 **style**:    | Cambios exclusivamente de estilo y formato (sin cambios funcionales). |
