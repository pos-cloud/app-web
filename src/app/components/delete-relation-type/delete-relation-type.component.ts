import { Component, OnInit, Input, EventEmitter } from '@angular/core';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { RelationType } from './../../models/relation-type';

import { RelationTypeService } from './../../services/relation-type.service';

@Component({
  selector: 'app-delete-relation-type',
  templateUrl: './delete-relation-type.component.html',
  styleUrls: ['./delete-relation-type.component.css'],
  providers: [NgbAlertConfig]
})

export class DeleteRelationTypeComponent implements OnInit {

  @Input() relationType: RelationType;
  public alertMessage: string = '';
  public focusEvent = new EventEmitter<boolean>();
  public loading: boolean = false;

  constructor(
    public _relationTypeService: RelationTypeService,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public deleteRelationType(): void {

    this.loading = true;

    this._relationTypeService.deleteRelationType(this.relationType._id).subscribe(
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

  public hideMessage():void {
    this.alertMessage = '';
  }
}
