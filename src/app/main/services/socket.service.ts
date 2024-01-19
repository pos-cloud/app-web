// socket.service.ts
import { Injectable } from "@angular/core";
import { Subject } from 'rxjs';
import { Socket } from "ngx-socket-io";
@Injectable({
  providedIn: "root",
})
export class SocketService {
  private updateTableSubject = new Subject<any>();

  constructor(private socket: Socket) {
    this.socket.fromEvent('update-table').subscribe(response => {
      this.updateTableSubject.next(response);
    });
  }

  initSocket(): void {
    const room = localStorage.getItem("company");

    this.socket.emit("login", {
      room: localStorage.getItem("company")
    });

    this.socket.on("update-table", (response) => {
      console.log("Respuesta de update-table:", response);
    });

  }

  logout(): void {
    this.socket.disconnect();
  }

  updateTable(): void {
    this.socket.emit("update-table", {room : localStorage.getItem("company")});
  }

  reconnect(): void {
    this.socket.emit("reconnect", {room : localStorage.getItem("company")});
  }

  onUpdateTable(): Subject<any> {
    return this.updateTableSubject;
  } 
}
