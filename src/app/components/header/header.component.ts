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

  private userType: string;

  constructor(
    private _router: Router,
    private _modalService: NgbModal
  ) { }

  ngOnInit() {
    
    let locationPathURL: string;
    this._router.events.subscribe((data:any) => { 
      locationPathURL = data.url.split('/');
      this.userType = locationPathURL[1];
    });
  }

  private openModal(): void {

    let modalRef = this._modalService.open(LoginComponent, { size: 'lg' }).result.then((result) => {
      
    }, (reason) => {
      
    });
  };
} 
