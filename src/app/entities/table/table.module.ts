import { NgModule } from '@angular/core';
import { EntitiesModule } from '../entities.module';
import { TableComponent } from './crud/table.component';
import { ListTablesComponent } from './list/list-tables.component';
import { TableRoutingModule } from './table.routing.module';

@NgModule({
  declarations: [TableComponent, ListTablesComponent],
  imports: [EntitiesModule, TableRoutingModule],
})
export class TableModule {}
