import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'app/components/login/auth.service';
import { User } from 'app/components/user/user';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class HomeComponent implements OnInit {
  public user: User | null = null;

  constructor(
    private _authService: AuthService,
    public _router: Router
  ) {}

  ngOnInit(): void {
    this._authService.getIdentity.subscribe(
      (identity) => {
        this.user = identity;
      },
      (error) => {
        console.error('Error al obtener la identidad:', error);
      }
    );
  }
}
