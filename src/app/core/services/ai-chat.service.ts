import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@types';
import { AuthService } from 'app/core/services/auth.service';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AiChatResult {
  answer: string;
  toolsUsed: string[];
  provider: string;
}

@Injectable({
  providedIn: 'root',
})
export class AiChatService {
  private readonly URL = `${environment.apiv2}/ai/chat`;

  constructor(
    private _http: HttpClient,
    private _authService: AuthService
  ) {}

  sendMessage(message: string, history: ChatMessage[] = []): Observable<AiChatResult> {
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http
      .post<ApiResponse>(this.URL, { message, history }, { headers })
      .pipe(map((response) => response.result as AiChatResult));
  }
}
