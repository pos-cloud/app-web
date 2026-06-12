/** Envelope nuevo (api-core src/response). Status HTTP fuera del body. */
export interface ApiEnvelope<T = unknown> {
  message: string | null;
  result: T | null;
  code: string | null;
}

/** Respuesta normalizada para servicios, toasts y componentes. */
export interface NormalizedApiResponse<T = unknown> {
  status: number;
  body: ApiEnvelope<T>;
  ok: boolean;
}

/** @deprecated Legacy api-core v2 — migrar a ApiEnvelope + HTTP status. */
export interface ApiResponse {
  result: any;
  message: string;
  status: number;
  error: any;
}
