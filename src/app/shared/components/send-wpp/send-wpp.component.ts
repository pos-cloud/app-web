import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FocusDirective } from '@shared/directives/focus.directive';
import { PipesModule } from '@shared/pipes/pipes.module';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-send-wpp',
  templateUrl: './send-wpp.component.html',
  standalone: true,
  imports: [FormsModule, CommonModule, FocusDirective, ReactiveFormsModule, PipesModule, TranslateModule],
})
export class SendWppComponent implements OnInit {
  sendWppForm: UntypedFormGroup;
  loading: boolean = false;
  focusEvent = new EventEmitter<boolean>();
  @Input() phone: string;
  @Input() message: string = '¡Hola! Te comparto el link de tu comprobante:';
  @Input() transactionId: string = '';

  constructor(private _fb: UntypedFormBuilder, private activeModal: NgbActiveModal) {
    this.sendWppForm = this._fb.group({
      phone: ['', [Validators.required]],
      message: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    this.sendWppForm.patchValue({
      phone: this.phone ?? '',
      message: this.message ?? '',
    });
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  close() {
    this.activeModal.dismiss('close_click');
  }

  public sendWpp() {
    this.loading = true;

    const phoneNumber = this.sendWppForm.get('phone').value.replace(/\s+/g, '').replace(/\+/g, '');
    const message = this.sendWppForm.get('message').value;

    const company = localStorage.getItem('company');
    const transactionLink = `${environment.apiv2}/to-print/transaction/${company}/${this.transactionId}/pdf`;
    const fullMessage = `${message} ${this.transactionId ? transactionLink : ''}`;

    const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(fullMessage)}`;

    window.open(whatsappLink, '_blank');

    this.loading = false;
    this.close();
  }
}
