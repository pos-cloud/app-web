/**
 * Configuración TinyMCE para campos HTML (observaciones, notas, etc.).
 * Self-hosted en `src/assets/tinymce` (copia vía `npm run postinstall` / `scripts/copy-tinymce-assets.cjs`).
 * Importante: en app.module proveer TINYMCE_SCRIPT_SRC = `/assets/tinymce/tinymce.min.js`.
 */
export const tinymceWysiwygInit: Record<string, unknown> = {
  /**
   * TinyMCE 7+ self-hosted: hace falta declarar uso bajo GPLv2+ o una clave comercial.
   * Ver https://www.tiny.cloud/docs/tinymce/latest/license-key/
   */
  license_key: 'gpl',
  base_url: '/assets/tinymce',
  suffix: '.min',
  /** Evita resolver plugins/theme como rutas relativas a la URL del SPA (p. ej. /eval/wysiwyg). */
  relative_urls: false,
  height: 320,
  menubar: false,
  branding: false,
  resize: true,
  /** `paste` va en el core en TinyMCE moderno; no existe plugins/paste en el paquete npm. */
  plugins: 'lists link autolink table help wordcount autoresize code',
  toolbar:
    'undo redo | bold italic underline strikethrough | alignleft aligncenter alignright | ' +
    'bullist numlist | link | table | removeformat | code',
  table_toolbar:
    'tableprops tabledelete | tableinsertrowbefore tableinsertrowafter tabledeleterow | ' +
    'tableinsertcolbefore tableinsertcolafter tabledeletecol',
  table_resize_bars: true,
  table_default_attributes: { border: '1' },
  table_default_styles: { 'border-collapse': 'collapse', width: '100%' },
  paste_merge_formats: true,
  paste_as_text: false,
  autoresize_bottom_margin: 16,
  content_style:
    'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 14px; } ' +
    'table { border-collapse: collapse; } td, th { border: 1px solid #ccc; padding: 4px 8px; }',
};
