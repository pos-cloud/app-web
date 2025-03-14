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
    return new Promise<Branch[]>((resolve, reject) => {
      this._branchService
        .getBranches(
          {}, // PROJECT
          match, // MATCH
          { number: 1 }, // SORT
          {}, // GROUP
          0, // LIMIT
          0 // SKIP
        )
        .subscribe(
          (result) => {
            if (result.branches) {
              resolve(result.branches);
            } else {
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
