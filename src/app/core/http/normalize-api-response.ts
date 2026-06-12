import { HttpErrorResponse, HttpResponse } from '@angular/common/http';

import { ApiEnvelope, NormalizedApiResponse } from '@types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object';
}

function isHttpErrorResponse(value: unknown): value is HttpErrorResponse {
  return value instanceof HttpErrorResponse || (isRecord(value) && value['name'] === 'HttpErrorResponse');
}

function isHttpResponse(value: unknown): value is HttpResponse<unknown> {
  return value instanceof HttpResponse;
}

function hasEnvelopeFields(value: Record<string, unknown>): boolean {
  return 'message' in value || 'result' in value || 'code' in value;
}

function toEnvelope(raw: unknown, httpStatus: number): ApiEnvelope {
  if (!isRecord(raw)) {
    return {
      message: httpStatus >= 400 ? 'Algo salió mal.' : null,
      result: null,
      code: null,
    };
  }

  const nestedError = isRecord(raw['error']) ? raw['error'] : null;

  return {
    message:
      (raw['message'] as string | null | undefined) ??
      (nestedError?.['message'] as string | null | undefined) ??
      null,
    result: (raw['result'] as unknown) ?? null,
    code: (raw['code'] as string | null | undefined) ?? null,
  };
}

/**
 * Unifica legacy ({ status, result, message }), HttpResponse, HttpErrorResponse
 * y el envelope nuevo { message, result, code } + status HTTP.
 */
export function normalizeApiResponse(input: unknown): NormalizedApiResponse | null {
  if (input == null) {
    return null;
  }

  if (isHttpResponse(input)) {
    const status = input.status ?? 200;
    return {
      status,
      body: toEnvelope(input.body, status),
      ok: status >= 200 && status < 300,
    };
  }

  if (isHttpErrorResponse(input)) {
    const status = input.status ?? 500;
    return {
      status,
      body: toEnvelope(input.error, status),
      ok: false,
    };
  }

  if (!isRecord(input)) {
    return null;
  }

  // Formato intermedio { status, body } (ModelService futuro)
  if ('status' in input && 'body' in input && typeof input['status'] === 'number') {
    const status = input['status'] as number;
    return {
      status,
      body: toEnvelope(input['body'], status),
      ok: status >= 200 && status < 300,
    };
  }

  // Legacy: status en el body
  if (typeof input['status'] === 'number' && (hasEnvelopeFields(input) || 'error' in input)) {
    const status = input['status'] as number;
    return {
      status,
      body: toEnvelope(input, status),
      ok: status >= 200 && status < 300,
    };
  }

  // Envelope nuevo sin status (asumir éxito)
  if (hasEnvelopeFields(input)) {
    return {
      status: 200,
      body: toEnvelope(input, 200),
      ok: true,
    };
  }

  return null;
}

export function extractApiResult<T = unknown>(input: unknown): T | null {
  return (normalizeApiResponse(input)?.body.result as T | null) ?? null;
}

export function isApiSuccess(input: unknown): boolean {
  return normalizeApiResponse(input)?.ok === true;
}
