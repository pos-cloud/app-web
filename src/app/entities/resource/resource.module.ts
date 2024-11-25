import { NgModule } from '@angular/core';

import { EntitiesModule } from '../entities.module';
import { ResourceComponent } from './crud/resource.component';
import { ListResourcesComponent } from './list/list-resource.component';
import { ResourceRoutingModule } from './resource.routing.module';

@NgModule({
  declarations: [ResourceComponent, ListResourcesComponent],
  imports: [ResourceRoutingModule, EntitiesModule],
})
export class ResourceModule {}
