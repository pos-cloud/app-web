import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-politicas-de-privacidad',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './politicas-de-privacidad.component.html',
  styleUrls: ['./politicas-de-privacidad.component.scss'],
})
export class PoliticasDePrivacidadComponent {
  readonly sections = [
    { id: 'responsable', n: '01', title: 'Responsable del tratamiento' },
    { id: 'finalidad', n: '02', title: 'Finalidad del tratamiento' },
    { id: 'legitimacion', n: '03', title: 'Legitimación' },
    { id: 'conservacion', n: '04', title: 'Conservación de los datos' },
    { id: 'destinatarios', n: '05', title: 'Destinatarios y transferencias' },
    { id: 'derechos', n: '06', title: 'Derechos del interesado' },
    { id: 'seguridad', n: '07', title: 'Seguridad' },
    { id: 'cambios', n: '08', title: 'Cambios en esta política' },
  ];

  scrollTo(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
