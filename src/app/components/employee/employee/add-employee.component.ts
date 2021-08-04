import { Component, OnInit, EventEmitter, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { EmployeeService } from '../employee.service';
import { EmployeeTypeService } from '../../employee-type/employee-type.service';
import { Employee } from '../employee';
import { EmployeeType } from 'app/components/employee-type/employee-type.model';
import { distinctUntilChanged, tap, switchMap, debounceTime } from 'rxjs/operators';
import { Subscription, Observable } from 'rxjs';

@Component({
  selector: 'app-add-employee',
  templateUrl: './add-employee.component.html',
  styleUrls: ['./add-employee.component.css'],
  providers: [NgbAlertConfig]
})

export class AddEmployeeComponent implements OnInit {

  @Input() operation: string;
  @Input() readonly: boolean;
  @Input() employeeId: string;

  public employee: Employee;
  public employeeTypes: EmployeeType[];
  public employeeForm: FormGroup;
  public alertMessage: string = '';
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public orientation: string = 'horizontal';
  private subscription: Subscription = new Subscription();

  public searchEmployeeTypes = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => this.loading = true),
      switchMap(async term => {
        let match: {} = (term && term !== '') ? { description: { $regex: term, $options: 'i' } } : {};
        return await this.getAllEmployeeTypes(match).then(
          result => {
            return result;
          }
        )
      }),
      tap(() => this.loading = false)
    )
  public formatterEmployeeTypes = (x: EmployeeType) => { return x.description; };

  public formErrors = {
    'code': '',
    'name': '',
    'type': ''
  };

  public validationMessages = {
    'code': {
      'required': 'Este campo es requerido.',
      'pattern': 'No puede exceder los 5 dígitos.'
    },
    'name': {
      'required': 'Este campo es requerido.'
    },
    'type': {
      'required': 'Este campo es requerido.',
      'validateAutocomplete': 'Debe ingresar un valor válido'
    }
  };

  constructor(
    public _employeeService: EmployeeService,
    public _employeeTypeService: EmployeeTypeService,
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) {
  }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.employee = new Employee();
    this.buildForm();
    this.getLastEmployee();

    if (this.employeeId) {
      this.getEmployee();
    }
  }

  public getEmployee() {

    this.loading = true;

    this._employeeService.getEmployee(this.employeeId).subscribe(
      result => {
        if (!result.employee) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          this.hideMessage();
          this.employee = result.employee;
          this.setValueForm();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public setValueForm() {

    if (!this.employee._id) { this.employee._id = ''; }
    if (!this.employee.code) { this.employee.code = 0; }
    if (!this.employee.name) { this.employee.name = ''; }
    if (!this.employee.type) { this.employee.type = null; }

    this.employeeForm.setValue({
      '_id': this.employee._id,
      'code': this.employee.code,
      'name': this.employee.name,
      'type': this.employee.type
    });
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public validateAutocomplete(c: FormControl) {
    let result = (c.value && Object.keys(c.value)[0] === '0') ? {
      validateAutocomplete: {
        valid: false
      }
    } : null;
    return result;
  }

  public getAllEmployeeTypes(match: {}): Promise<EmployeeType[]> {
    return new Promise<EmployeeType[]>((resolve, reject) => {
      this.subscription.add(this._employeeTypeService.getAll({
        match,
        sort: { description: 1 },
        limit: 10,
      }).subscribe(
        result => {
          this.loading = false;
          (result.status === 200) ? resolve(result.result) : reject(result);
        },
        error => reject(error)
      ));
    });
  }

  public getLastEmployee(): void {

    this.loading = true;

    let query = 'sort="_id":-1&limit=1';

    this._employeeService.getEmployees(query).subscribe(
      result => {
        let code = 1;
        if (result.employees) {
          if (result.employees[0] !== undefined) {
            code = result.employees[0].code + 1;
          }
        }
        this.employeeForm.patchValue({ 'code': code });
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public buildForm(): void {

    this.employeeForm = this._fb.group({
      '_id': [this.employee._id, []],
      'code': [this.employee.code, [Validators.required, Validators.pattern("[0-9]{1,5}")]],
      'name': [this.employee.name, [Validators.required]],
      'type': [this.employee.type, []]
    });

    this.employeeForm.valueChanges.subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
    this.focusEvent.emit(true);
  }

  public onValueChanged(data?: any): void {

    if (!this.employeeForm) { return; }
    const form = this.employeeForm;

    for (const field in this.formErrors) {
      this.formErrors[field] = '';
      const control = form.get(field);

      if (control && control.dirty && !control.valid) {
        const npm = this.validationMessages[field];
        for (const key in control.errors) {
          this.formErrors[field] += npm[key] + ' ';
        }
      }
    }
  }

  public addEmployee(): void {


    this.loading = true;
    this.employee = this.employeeForm.value;

    switch (this.operation) {
      case 'add':
        this.saveEmployee();
        break;
      case 'update':
        this.updateEmployee();
        break;
      case 'delete':
        this.deleteEmployee();
      default:
        break;
    }
  }

  public saveEmployee(): void {

    this.loading = true;

    this._employeeService.saveEmployee(this.employee).subscribe(
      result => {
        if (!result.employee) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.loading = false;
        } else {
          this.employee = result.employee;
          this.showMessage("El empleado se ha añadido con éxito.", 'success', false);
          this.employee = new Employee();
          this.buildForm();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public updateEmployee(): void {

    this.loading = true;

    this._employeeService.updateEmployee(this.employee).subscribe(
      result => {
        if (!result.employee) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.loading = false;
        } else {
          this.employee = result.employee;
          this.showMessage("El empleado se ha actualizado con éxito.", 'success', false);
          this.activeModal.close('save_close');
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public deleteEmployee(): void {

    this.loading = true;

    this._employeeService.deleteEmployee(this.employee._id).subscribe(
      result => {
        this.activeModal.close('delete_close');
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }


  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage(): void {
    this.alertMessage = '';
  }
}
