import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  public userType: string;
  
  constructor(
    public _router: Router
  ) { 
  }

  ngOnInit() {
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
  }
}
