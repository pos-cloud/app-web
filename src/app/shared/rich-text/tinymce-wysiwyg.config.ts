/**
 * Configuración TinyMCE para campos HTML (observaciones, emails, plantillas, etc.).
 * Self-hosted en `src/assets/tinymce` (copia vía `npm run postinstall`).
 * En app.module: `TINYMCE_SCRIPT_SRC` = `/assets/tinymce/tinymce.min.js`.
 */
export const tinymceWysiwygInit: Record<string, unknown> = {
  license_key: 'gpl',
  base_url: '/assets/tinymce',
  suffix: '.min',
  relative_urls: false,
  height: 320,
  menubar: false,
  branding: false,
  resize: true,
  plugins: 'lists link autolink table image media help wordcount autoresize code',
  toolbar:
    'undo redo | bold italic underline strikethrough | alignleft aligncenter alignright | ' +
    'bullist numlist | link image media | table | removeformat | code',
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

/** Combina la config base con overrides por pantalla (altura, placeholder, etc.). */
export function mergeTinymceInit(overrides: Record<string, unknown>): Record<string, unknown> {
  return { ...tinymceWysiwygInit, ...overrides };
}
