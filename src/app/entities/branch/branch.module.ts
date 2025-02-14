import { NgModule } from '@angular/core';
import { EntitiesModule } from '../entities.module';
import { BranchRoutingModule } from './branch-routing.module';
import { BranchComponent } from './crud/branch.component';
import { ListBranchComponent } from './list/list-branch.component';

@NgModule({
  declarations: [BranchComponent, ListBranchComponent],
  imports: [EntitiesModule, BranchRoutingModule],
})
export class BranchModule {}
