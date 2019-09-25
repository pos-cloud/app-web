import { Component, Input, ViewEncapsulation } from '@angular/core';
import { NgbProgressbarConfig } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-progressbar',
  templateUrl: './progressbar.component.html',
  styleUrls: ['./progressbar.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class ProgressbarComponent {

  @Input() loading: boolean = false;
  @Input() striped: boolean = true;
  @Input() animated: boolean = true;
  @Input() type: string = 'info';
  @Input() height: string = '10px';

  constructor(
    public ngbProgressBarConfig: NgbProgressbarConfig
  ) {
    ngbProgressBarConfig.striped = true;
    ngbProgressBarConfig.animated = true;
    ngbProgressBarConfig.type = 'info';
    ngbProgressBarConfig.height = '10px';
  }
}
