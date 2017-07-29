import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

import { User } from './../../models/user';
import { UserService } from './../../services/user.service';

import { AddUserComponent } from './../../components/add-user/add-user.component';
import { UpdateUserComponent } from './../../components/update-user/update-user.component';
import { DeleteUserComponent } from './../../components/delete-user/delete-user.component';

@Component({
  selector: 'app-list-users',
  templateUrl: './list-users.component.html',
  styleUrls: ['./list-users.component.css'],
  providers: [NgbAlertConfig]
})

export class ListUsersComponent implements OnInit {

  public users: User[] = new Array();
  public areUsersEmpty: boolean = true;
  public alertMessage: any;
  public userType: string;
  public orderTerm: string[] = ['name'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;

  constructor(
    public _userService: UserService,
    public _router: Router,
    public _modalService: NgbModal,
    public alertConfig: NgbAlertConfig
  ) { 
    alertConfig.type = 'danger';
    alertConfig.dismissible = true;
  }

  ngOnInit(): void {
    
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.getUsers();
  }

  public getBadge(term: string): boolean {

    return true;
  }

  public getUsers(): void {  

    this._userService.getUsers().subscribe(
        result => {
					if(!result.users) {
						this.alertMessage = result.message;
            this.alertConfig.type = 'danger';
					  this.users = null;
            this.areUsersEmpty = true;
					} else {
            this.alertMessage = null;
					  this.users = result.users;
            this.areUsersEmpty = false;
          }
				},
				error => {
					this.alertMessage = error._body;
					if(!this.alertMessage) {
						this.alertMessage = "Error en la petición.";
					}
				}
      );
   }

  public orderBy (term: string, property?: string): void {

    if (this.orderTerm[0] === term) {
      this.orderTerm[0] = "-"+term;  
    } else {
      this.orderTerm[0] = term; 
    }
    this.propertyTerm = property;
  }
  
  public openModal(op: string, user:User): void {

    let modalRef;
    switch(op) {
      case 'add' :
        modalRef = this._modalService.open(AddUserComponent, { size: 'lg' }).result.then((result) => {
          this.getUsers();
        }, (reason) => {
          this.getUsers();
        });
        break;
      case 'update' :
          modalRef = this._modalService.open(UpdateUserComponent, { size: 'lg' })
          modalRef.componentInstance.user = user;
          modalRef.result.then((result) => {
            if(result === 'save_close') {
              this.getUsers();
            }
          }, (reason) => {
            
          });
        break;
      case 'delete' :
          modalRef = this._modalService.open(DeleteUserComponent, { size: 'lg' })
          modalRef.componentInstance.user = user;
          modalRef.result.then((result) => {
            if(result === 'delete_close') {
              this.getUsers();
            }
          }, (reason) => {
            
          });
        break;
      default : ;
    }
  };
}