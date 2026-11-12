import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit } from '@angular/core';
import { FormsModule, UntypedFormBuilder } from '@angular/forms';

import { NgbActiveModal, NgbAlertConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Branch } from '@types';

import { AuthService } from 'app/core/services/auth.service';
import { BranchService } from 'app/core/services/branch.service';
import { PipesModule } from 'app/shared/pipes/pipes.module';

@Component({
  selector: 'app-select-branch',
  templateUrl: './select-branch.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, PipesModule, TranslateModule],
})
export class SelectBranchComponent implements OnInit {
  public branches: Branch[] = new Array();
  public branchSelected: Branch;
  public alertMessage: string = '';
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();

  constructor(
    public _fb: UntypedFormBuilder,
    public _branchService: BranchService,
    public _authService: AuthService,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public _modalService: NgbModal
  ) {}

  async ngOnInit() {
    await this.getBranches({ operationType: { $ne: 'D' } }).then((branches) => {
      if (branches && branches.length > 0) {
        this.branches = branches;
        this.branchSelected = this.branches[0];
      }
    });
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public getBranches(match: {} = {}): Promise<Branch[]> {
    return new Promise<Branch[]>((resolve) => {
      this._branchService
        .getAll({
          project: {
            _id: 1,
            number: 1,
            name: 1,
            operationType: 1,
          },
          match,
          sort: { number: 1 },
        })
        .subscribe(
          (result) => {
            if (result?.status === 200 && Array.isArray(result.result) && result.result.length > 0) {
              resolve(result.result);
            } else {
              if (result?.status !== 200) this.showMessage('No se pudieron cargar las sucursales.', 'danger', false);
              resolve(null);
            }
          },
          (error) => {
            this.showMessage(error._body, 'danger', false);
            resolve(null);
          }
        );
    });
  }

  public selectBranch(): void {
    this.activeModal.close({ branch: this.branchSelected });
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
