import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ModelService } from 'app/core/services/model.service';
import { AuthService } from './auth.service';

/**
 * CRUD de turnos contra API v2 (`environment.apiv2`), mismo patrón que {@link HolidayService}.
 */
@Injectable({
  providedIn: 'root',
})
export class AppointmentService extends ModelService {
  constructor(public _http: HttpClient, public _authService: AuthService) {
    super('appointments', _http, _authService);
  }

  /**
   * Turnos que intersectan el rango [isoFrom, isoTo] (solapes con el calendario).
   * Opcionalmente filtra por empresa (ObjectId string).
   * `project` con rutas anidadas tipo `company.name` para que la API devuelva la empresa poblada (mismo criterio que transacciones en POS).
   */
  getInRange(isoFrom: string, isoTo: string, companyId?: string): Observable<any> {
    // Extended JSON `{ $date: "ISO" }` para que, tras JSON.stringify + EJSON.parse en el back,
    // los límites sigan siendo BSON Date y no strings (comparación correcta con campos Date).
    const match: Record<string, unknown> = {
      operationType: { $ne: 'D' },
      startDate: { $lt: { $date: isoTo } },
      endDate: { $gt: { $date: isoFrom } },
    };
    if (companyId) {
      match.company = companyId;
    }

    const project: Record<string, number> = {
      _id: 1,
      operationType: 1,
      startDate: 1,
      endDate: 1,
      allDay: 1,
      status: 1,
      title: 1,
      description: 1,
      patientName: 1,
      recurrenceSeriesId: 1,
      recurrenceRule: 1,
      'company._id': 1,
      'company.name': 1,
      'company.fantasyName': 1,
    };

    return this.getAll({
      project,
      match,
      sort: { startDate: 1 },
      limit: 5000,
      skip: 0,
    });
  }
}
