import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { UserService } from '../../../core/services/user.service';
import { User } from '../user';

import { AuthService } from 'app/core/services/auth.service';
import { first } from 'rxjs/operators';
import { DeleteUserComponent } from '../delete-user/delete-user.component';
import { AddUserComponent } from '../user/add-user.component';

@Component({
  selector: 'app-list-users',
  templateUrl: './list-users.component.html',
  styleUrls: ['./list-users.component.scss'],
  providers: [NgbAlertConfig],
  encapsulation: ViewEncapsulation.None,
})
export class ListUsersComponent implements OnInit {
  public users: User[] = new Array();
  public areUsersEmpty: boolean = true;
  public alertMessage: string = '';
  public userType: string;
  public orderTerm: string[] = ['name'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  public itemsPerPage = 10;
  public totalItems = 0;
  public identity: User;

  constructor(
    public _userService: UserService,
    public _router: Router,
    public _modalService: NgbModal,
    public alertConfig: NgbAlertConfig,
    public _authService: AuthService
  ) {
    this._authService.getIdentity.pipe(first()).subscribe(async (identity) => {
      this.identity = identity;
    });
  }

  ngOnInit(): void {
    this.refresh();
  }

  public getUsers(query?: string): void {
    this.loading = true;

    this._userService.getUsers(query).subscribe(
      (result) => {
        if (!result.users) {
          if (result.message && result.message !== '')
            this.showMessage(result.message, 'info', true);
          this.loading = false;
          this.users = new Array();
          this.areUsersEmpty = true;
        } else {
          this.hideMessage();
          this.loading = false;
          this.users = result.users;
          this.totalItems = this.users.length;
          this.areUsersEmpty = false;
        }
      },
      (error) => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public orderBy(term: string, property?: string): void {
    if (this.orderTerm[0] === term) {
      this.orderTerm[0] = '-' + term;
    } else {
      this.orderTerm[0] = term;
    }
    this.propertyTerm = property;
  }

  public refresh(): void {
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    if (pathLocation[2] === 'usuarios') {
      this.getUsers(
        `where="$and":[{"employee":{ "$exists": true }},{"employee":{ "$ne": null }}]`
      );
    } else if (pathLocation[2] === 'usuarios-web') {
      this.getUsers(
        `where="$and":[{"company":{ "$exists": true }},{"company":{ "$ne": null }}]`
      );
    }
  }

  public openModal(op: string, user: User): void {
    let modalRef;
    switch (op) {
      case 'view':
        modalRef = this._modalService.open(AddUserComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.userId = user._id;
        modalRef.componentInstance.readonly = true;
        modalRef.componentInstance.operation = 'view';
        break;
      case 'add':
        modalRef = this._modalService.open(AddUserComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.readonly = false;
        modalRef.componentInstance.operation = 'add';
        modalRef.result.then(
          (result) => {
            this.refresh();
          },
          (reason) => {
            this.refresh();
          }
        );
        break;
      case 'update':
        modalRef = this._modalService.open(AddUserComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.userId = user._id;
        modalRef.componentInstance.readonly = false;
        modalRef.componentInstance.operation = 'update';
        modalRef.result.then(
          (result) => {
            this.refresh();
          },
          (reason) => {
            this.refresh();
          }
        );
        break;
      case 'delete':
        modalRef = this._modalService.open(DeleteUserComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.user = user;
        modalRef.result.then(
          (result) => {
            if (result === 'delete_close') {
              this.refresh();
            }
          },
          (reason) => {}
        );
        break;
      default:
    }
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
