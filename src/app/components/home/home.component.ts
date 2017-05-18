import { Component, OnInit } from '@angular/core';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { LoginComponent } from './../login/login.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private _modalService: NgbModal) { }

  ngOnInit() {
  }

  private openModal(): void {

    let modalRef = this._modalService.open(LoginComponent, { size: 'lg' }).result.then((result) => {
      
    }, (reason) => {
      
    });
  };
}
