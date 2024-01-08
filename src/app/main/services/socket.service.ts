// socket.service.ts
import { Injectable } from '@angular/core';
import { Config } from 'app/app.config';
import { User } from 'app/components/user/user';
import { Socket } from 'ngx-socket-io';
@Injectable({
  providedIn: 'root',
})
export class SocketService {
  constructor(private socket: Socket) {}

  initSocket( username : string, password: string, database: string): void {
    const identity: User = JSON.parse(sessionStorage.getItem('user'));

      // INICIAMOS SOCKET
      this.socket.emit('login', {
        username,
        password,
        database,
      });

      // ESCUCHAMOS SOCKET - Puedes agregar más eventos aquí según sea necesario
      this.socket.on('message', (message) => {
        console.log('Mensaje recibido desde el servidor:', message);
      });

      // Ejemplo de escucha para el evento 'ventas_response'
      this.socket.on('ventas_response', (response) => {
        console.log('Respuesta de Ventas:', response);
        // Puedes manejar la respuesta aquí
      });
  }

    // Método para manejar el logout
    logout(): void {
        // Envía un evento al servidor para indicar el logout
        this.socket.emit('logout');
    }
}
