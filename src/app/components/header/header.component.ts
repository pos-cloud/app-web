import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { LoginComponent } from './../login/login.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  public userType: string;

  constructor(
    public _router: Router,
    public _modalService: NgbModal
  ) { }

  ngOnInit() {
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
  }

  public openModal(): void {

    let modalRef = this._modalService.open(LoginComponent, { size: 'lg' }).result.then((result) => {
      
    }, (reason) => {
      
    });
  };
} 
