import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EditorModule } from '@tinymce/tinymce-angular';
import { tinymceWysiwygInit } from '../../rich-text/tinymce-wysiwyg.config';

/**
 * Prueba de WYSIWYG con TinyMCE (HTML real, tablas y pegado desde Excel).
 * Ruta: /eval/wysiwyg
 */
@Component({
  selector: 'app-wysiwyg-eval-page',
  standalone: true,
  imports: [CommonModule, FormsModule, EditorModule],
  templateUrl: './wysiwyg-eval-page.component.html',
  styleUrls: ['./wysiwyg-eval-page.component.css'],
})
export class WysiwygEvalPageComponent {
  readonly tinymceInit = tinymceWysiwygInit;

  /** Contenido HTML del editor */
  html = '<p>Escribí aquí o <strong>pegá una tabla desde Excel</strong>.</p>';
}
