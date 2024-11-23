import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';

import {
  NgbActiveModal,
  NgbAlertConfig,
  NgbModal,
} from '@ng-bootstrap/ng-bootstrap';

import { Transport } from 'app/components/transport/transport';
import { AuthService } from 'app/core/services/auth.service';
import { Report } from '../report.model';

@Component({
  selector: 'app-params-report',
  templateUrl: './params-report.component.html',
  styleUrls: ['./params-report.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ParamsReportComponent implements OnInit {
  @Input() report: Report;
  public transportSelected: Transport;
  public alertMessage: string = '';
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public declaredValue: number;
  public package: number;
  public objForm: UntypedFormGroup;

  constructor(
    public _fb: UntypedFormBuilder,
    public _authService: AuthService,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public _modalService: NgbModal
  ) {}

  async ngOnInit() {
    this.buildForm();
  }

  public buildForm(): void {
    let fields: {} = {};

    for (let field of this.report.params) {
      fields[field.name] = [field.name, []];
    }

    this.objForm = this._fb.group(fields);
  }

  public sendParams(): void {
    this.activeModal.close(this.objForm.value);
  }

  public showMessage(
    message: string,
    type: string,
    dismissible: boolean
  ): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage(): void {
    this.alertMessage = '';
  }
}
