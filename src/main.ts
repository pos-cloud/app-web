import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { getWebInstrumentations, initializeFaro } from '@grafana/faro-web-sdk';
import { TracingInstrumentation } from '@grafana/faro-web-tracing';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.faro?.url) {
  initializeFaro({
    url: environment.faro.url,
    app: {
      name: environment.faro.name,
      version: environment.faro.version,
      environment: environment.faro.environment,
    },
    instrumentations: [
      ...getWebInstrumentations(),
      new TracingInstrumentation(),
    ],
  });
}

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .then(() => console.log(`Bootstrap success`))
  .catch(err => console.error(err));
