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
    return this.getAll({
      match,
      sort: { startDate: 1 },
      limit: 5000,
      skip: 0,
    });
  }
}
