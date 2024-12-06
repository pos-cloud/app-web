import { NgModule } from '@angular/core';
import { EntitiesModule } from '../entities.module';
import { RoomComponent } from './crud/room.component';
import { ListRoomsComponent } from './list/list-room.component';
import { RoomRoutingModule } from './room.routing.module';

@NgModule({
  declarations: [RoomComponent, ListRoomsComponent],
  imports: [EntitiesModule, RoomRoutingModule],
})
export class RoomModule {}
