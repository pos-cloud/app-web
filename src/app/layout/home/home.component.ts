import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { User } from 'app/components/user/user';
import { AuthService } from 'app/core/services/auth.service';
import { UpgradeVersionComponent } from '../upgrade-version/upgrade-version.component';

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
        console.error('Error al obtener el usuario:', error);
      }
    );
  }

  openUpdateModal() {
    const modalRef = this.modalService.open(UpgradeVersionComponent);
    modalRef.componentInstance.onReload.subscribe(() => window.location.reload());
  }
}
