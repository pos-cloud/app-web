import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { User } from './../../models/user';
import { UserService } from './../../services/user.service';

import { AddUserComponent } from './../../components/add-user/add-user.component';
import { UpdateUserComponent } from './../../components/update-user/update-user.component';
import { DeleteUserComponent } from './../../components/delete-user/delete-user.component';

@Component({
  selector: 'app-list-users',
  templateUrl: './list-users.component.html',
  styleUrls: ['./list-users.component.css']
})

export class ListUsersComponent implements OnInit {

  private users: User[] = new Array();
  private areUsersEmpty: boolean = true;
  private alertMessage: any;
  private userType: string;
  private orderTerm: string[] = ['name'];
  private propertyTerm: string;
  private areFiltersVisible: boolean = false;

  constructor(
    private _userService: UserService,
    private _router: Router,
    private _modalService: NgbModal
  ) { }

  ngOnInit(): void {
    
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.getUsers();
  }

  private getBadge(term: string): boolean {

    return true;
  }

  private getUsers(): void {  

    this._userService.getUsers().subscribe(
        result => {
					if(!result.users) {
						this.alertMessage = result.message;
					  this.users = null;
            this.areUsersEmpty = true;
					} else {
            this.alertMessage = null;
					  this.users = result.users;
            this.areUsersEmpty = false;
          }
				},
				error => {
					this.alertMessage = error;
					if(!this.alertMessage) {
						this.alertMessage = "Error en la petición.";
					}
				}
      );
   }

  private orderBy (term: string, property?: string): void {

    if (this.orderTerm[0] === term) {
      this.orderTerm[0] = "-"+term;  
    } else {
      this.orderTerm[0] = term; 
    }
    this.propertyTerm = property;
  }
  
  private openModal(op: string, user:User): void {

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