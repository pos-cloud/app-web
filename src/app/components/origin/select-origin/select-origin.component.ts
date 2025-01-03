import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';

import {
  NgbActiveModal,
  NgbAlertConfig,
  NgbModal,
} from '@ng-bootstrap/ng-bootstrap';

import { Origin } from 'app/components/origin/origin';
import { AuthService } from 'app/core/services/auth.service';
import { OriginService } from 'app/core/services/origin.service';

@Component({
  selector: 'app-select-origin',
  templateUrl: './select-origin.component.html',
  styleUrls: ['./select-origin.component.css'],
})
export class SelectOriginComponent implements OnInit {
  @Input() branchId: string;
  public origins: Origin[] = new Array();
  public originSelected: Origin;
  public alertMessage: string = '';
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();

  constructor(
    public _fb: UntypedFormBuilder,
    public _originService: OriginService,
    public _authService: AuthService,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public _modalService: NgbModal
  ) {}

  async ngOnInit() {
    this.originSelected = new Origin();
    await this.getOrigins({
      branch: { $oid: this.branchId },
      operationType: { $ne: 'D' },
    }).then((origins) => {
      if (origins && origins.length > 0) {
        this.origins = origins;
        this.originSelected = this.origins[0];
      }
    });
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public getOrigins(match: {} = {}): Promise<Origin[]> {
    return new Promise<Origin[]>((resolve, reject) => {
      this._originService
        .getOrigins(
          {}, // PROJECT
          match, // MATCH
          { number: 1 }, // SORT
          {}, // GROUP
          0, // LIMIT
          0 // SKIP
        )
        .subscribe(
          (result) => {
            if (result.origins) {
              resolve(result.origins);
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

  public selectOrigin(): void {
    this.activeModal.close({ origin: this.originSelected });
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
