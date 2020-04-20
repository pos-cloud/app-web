import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { User } from '../user';

import { UserService } from '../user.service';
import { AuthService } from 'app/components/login/auth.service';

@Component({
  selector: 'app-delete-user',
  templateUrl: './delete-user.component.html',
  styleUrls: ['./delete-user.component.css'],
  providers: [NgbAlertConfig]
})

export class DeleteUserComponent implements OnInit {

  @Input() user: User;
  public alertMessage: string = '';
  public focusEvent = new EventEmitter<boolean>();
  public loading: boolean = false;

  constructor(
    public _userService: UserService,
    public _authService: AuthService,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public _router: Router
  ) { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public deleteUser(): void {

    this.loading = true;

    this._userService.deleteUser(this.user._id).subscribe(
      result => {
        this._authService.getIdentity.subscribe(
          identity => {
            if (identity._id === this.user._id) {
              sessionStorage.removeItem("session_token");
              sessionStorage.removeItem("user");
              this._router.navigate(['/']);
            }
            this.activeModal.close('delete_close');
            this.loading = false;
          }
        );
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
