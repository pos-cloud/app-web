import { Component, OnInit, EventEmitter, Input } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, UntypedFormControl } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ImportService } from './import.service';

@Component({
  selector: 'add-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.css']
})

export class ImportComponent implements OnInit {

  public importForm: UntypedFormGroup;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();

  constructor(
    public _excelUpdateService: ImportService,
    public _fb: UntypedFormBuilder,
    public activeModal: NgbActiveModal
  ) { }

  ngOnInit(): void {
    this.buildForm();
  }

  public buildForm(): void {
    this.importForm = this._fb.group({
      'file': [null, [
        Validators.required
      ]]
    });

    this.importForm.valueChanges.subscribe(() => this.onValueChanged());
    this.onValueChanged();
  }

  public onValueChanged(): void {
    // Aquí puedes implementar validaciones adicionales si las necesitas
  }

  public import(): void {
    if (this.importForm.valid) {
      const inputElement: HTMLInputElement = document.getElementById('fileInput') as HTMLInputElement;
      const file: File = inputElement.files[0]; // Obtener el primer archivo seleccionado
  
      this.loading = true; // Muestra el estado de carga mientras se realiza la solicitud
  
      this._excelUpdateService.import(file).subscribe(
        response => {
          // Maneja la respuesta del servidor
          console.log('Respuesta del servidor:', response);
          this.loading = false; // Oculta el estado de carga una vez que se completa la solicitud
        },
        error => {
          // Maneja el error en caso de que ocurra
          console.error('Error al enviar el archivo:', error);
          this.loading = false; // Asegúrate de ocultar el estado de carga en caso de error
        }
      );
    }
  }
}
