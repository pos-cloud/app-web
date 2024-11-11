import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'app/components/login/auth.service';
import { User } from 'app/components/user/user';
import { UpdateModalContent } from '../update-modal/update-modal.component';

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
    public _router: Router,
    private swUpdate: SwUpdate,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this._authService.getIdentity.subscribe(
      (identity) => {
        this.user = identity;

        if (this.swUpdate.isEnabled) {
          this.swUpdate.available.subscribe(() => {
            this.openUpdateModal();
          });
        }
      },
      (error) => {
        console.error('Error al obtener la identidad:', error);
      }
    );
  }

  openUpdateModal() {
    const modalRef = this.modalService.open(UpdateModalContent);
    modalRef.componentInstance.onReload.subscribe(() =>
      window.location.reload()
    );
  }
}
