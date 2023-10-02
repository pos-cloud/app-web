// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  api: "https://dev-apiv1.eu-4.evennode.com", // "http://localhost:300"
  apiv2: "https://dev-apiv2.eu-4.evennode.com", // "http://localhost:308"
  apiPrint: "https://api-print.us-3.evennode.com", // 
  apiStorage: "https://api-storage.us-3.evennode.com/"
};