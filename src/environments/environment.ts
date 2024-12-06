// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  // api: "http://localhost:300",
  // apiv2: "http://localhost:308",
  // apiPrint: "http://localhost:302",
  // apiStorage: "https://api-storage.poscloud.ar",
  // apiTiendaNube: "http://localhost:305",
  // feAr: "http://localhost:307"
  api: 'https://d-api-v1.poscloud.ar',
  apiv2: 'https://d-api-v2.poscloud.ar',
  apiPrint: 'https://d-api-print.poscloud.ar',
  apiStorage: 'https://d-api-storage.poscloud.ar',
  apiTiendaNube: 'https://d-api-tiendanube.poscloud.ar',
  feAr: 'https://d-fe-ar.poscloud.ar',
};
