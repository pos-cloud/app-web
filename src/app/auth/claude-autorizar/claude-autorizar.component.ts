import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApplicationService } from 'app/core/services/application.service';
import { AuthService } from 'app/core/services/auth.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-claude-autorizar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './claude-autorizar.component.html',
})
export class ClaudeAutorizarComponent implements OnInit {
  public ready = false;
  public loading = false;
  public error = '';
  public businessName = '';

  private redirectUri = '';
  private state = '';
  private codeChallenge = '';

  constructor(
    private route: ActivatedRoute,
    private applications: ApplicationService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    this.redirectUri = params.get('redirect_uri') || '';
    this.state = params.get('state') || '';
    this.codeChallenge = params.get('code_challenge') || '';
    this.ready =
      params.get('response_type') === 'code' &&
      params.get('code_challenge_method') === 'S256' &&
      this.allowed(this.redirectUri) &&
      this.codeChallenge.length >= 43 &&
      this.state.length > 0;

    if (!this.ready) {
      this.error = 'Este enlace no viene de Claude.';
    }

    this.auth.getIdentity.pipe(take(1)).subscribe((user) => {
      const company = user?.company;
      if (company && typeof company === 'object' && company.name) {
        this.businessName = company.name;
      }
    });
  }

  public permitir(): void {
    if (!this.ready || this.loading) {
      return;
    }

    this.loading = true;
    this.error = '';
    this.applications
      .authorizeClaude({ codeChallenge: this.codeChallenge, redirectUri: this.redirectUri })
      .subscribe((result) => {
        this.loading = false;
        const code = result?.result?.code as string | undefined;
        if (result?.status === 200 && code) {
          const url = new URL(this.redirectUri);
          url.searchParams.set('code', code);
          url.searchParams.set('state', this.state);
          window.location.assign(url.toString());
          return;
        }

        const body = result instanceof HttpErrorResponse ? result.error : result;
        this.error = body?.message || 'No se pudo conectar Claude.';
      });
  }

  private allowed(uri: string): boolean {
    try {
      const url = new URL(uri);
      const claude =
        url.protocol === 'https:' &&
        (url.host === 'claude.ai' || url.host === 'claude.com') &&
        url.pathname === '/api/mcp/auth_callback';
      const local = url.protocol === 'http:' && (url.hostname === '127.0.0.1' || url.hostname === 'localhost');
      return claude || local;
    } catch {
      return false;
    }
  }
}
