import { Component, OnInit, Input, EventEmitter } from '@angular/core';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { User } from './../../models/user';

import { UserService } from './../../services/user.service';

@Component({
  selector: 'app-delete-user',
  templateUrl: './delete-user.component.html',
  styleUrls: ['./delete-user.component.css'],
  providers: [NgbAlertConfig]
})

export class DeleteUserComponent implements OnInit {

  @Input() user: User;
  public alertMessage: any;
  public focusEvent = new EventEmitter<boolean>();

  constructor(
    public _userService: UserService,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) { 
    alertConfig.type = 'danger';
    alertConfig.dismissible = true;
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public deleteUser(): void {

    this._userService.deleteUser(this.user._id).subscribe(
      result => {
        let token = localStorage.getItem("session_token").replace(/"/gi,"");
        
        if(this.user.token === token) {
          localStorage.removeItem("session_token");
        }
        this.activeModal.close('delete_close');
      },
      error => {
        this.alertMessage = error._body;
        if(!this.alertMessage) {
            this.alertMessage = 'Ha ocurrido un error al conectarse con el servidor.';
        }
      }
    );
  }
}
