import { NgModule } from '@angular/core';
import { EntitiesModule } from '../entities.module';
import { MakeComponent } from './crud/make.component';
import { ListMakesComponent } from './list/list-makes.component';
import { MakeRoutingModule } from './make-routing.module';

@NgModule({
  declarations: [MakeComponent, ListMakesComponent],
  imports: [EntitiesModule, MakeRoutingModule],
})
export class MakeModule {}
