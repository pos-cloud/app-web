import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VersionService {
  constructor(private http: HttpClient) {}

  getPatchVersion(): Observable<string> {
    return this.http.get('assets/patch.txt', { responseType: 'text' });
  }
}
