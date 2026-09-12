import { Injectable } from '@angular/core';

import { environment } from 'environments/environment';

const DEFAULT_AGENT_URL = 'http://127.0.0.1:17777';
const HEALTH_TIMEOUT_MS = 400;
const PRINT_TIMEOUT_MS = 30000;

@Injectable({
  providedIn: 'root',
})
export class PosCloudAgentService {
  private readonly baseUrl = environment.agentUrl || DEFAULT_AGENT_URL;

  async isAvailable(): Promise<boolean> {
    try {
      const health = await this.request('/health', { method: 'GET', timeoutMs: HEALTH_TIMEOUT_MS });
      return !!health?.ok;
    } catch {
      return false;
    }
  }

  async printPdf(blob: Blob): Promise<boolean> {
    try {
      const pdfBase64 = await blobToBase64(blob);
      const printed = await this.request('/v1/print', {
        method: 'POST',
        timeoutMs: PRINT_TIMEOUT_MS,
        body: { pdfBase64, copies: 1, openDrawer: false },
      });

      return !!printed?.ok;
    } catch {
      return false;
    }
  }

  async openDrawer(): Promise<boolean> {
    try {
      const opened = await this.request('/v1/drawer/open', {
        method: 'POST',
        timeoutMs: 5000,
        body: {},
      });

      return !!opened?.ok;
    } catch {
      return false;
    }
  }

  private async request(
    path: string,
    options: { method: string; timeoutMs: number; body?: unknown }
  ): Promise<any> {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), options.timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method: options.method,
        headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      });

      if (!response.ok) {
        return null;
      }

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        return response.json();
      }

      return { ok: true };
    } finally {
      window.clearTimeout(timer);
    }
  }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      const comma = result.indexOf(',');
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}
