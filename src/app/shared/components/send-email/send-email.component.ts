import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FocusDirective } from '@shared/directives/focus.directive';
import { PipesModule } from '@shared/pipes/pipes.module';
import { EditorModule } from '@tinymce/tinymce-angular';
import { mergeTinymceInit } from '@shared/rich-text/tinymce-wysiwyg.config';
import { EmailService } from '../../../core/services/send-email.service';
import { ToastService } from '../toast/toast.service';

@Component({
  selector: 'app-send-email',
  templateUrl: './send-email.component.html',
  standalone: true,
  imports: [FormsModule, EditorModule, CommonModule, FocusDirective, ReactiveFormsModule, PipesModule, TranslateModule],
})
export class SendEmailComponent implements OnInit {
  sendEmailForm: UntypedFormGroup;
  loading: boolean = false;
  focusEvent = new EventEmitter<boolean>();
  @Input() to: string;
  @Input() subject: string = '';
  @Input() body: string = '';
  @Input() companyId: string = '';
  @Input() transactionId: string = '';
  @Input() items: number;

  readonly tinymceBodyInit = mergeTinymceInit({
    height: 260,
    placeholder: 'Escribe aqui...',
  });
  constructor(
    private _serviceEmail: EmailService,
    private _fb: UntypedFormBuilder,
    private activeModal: NgbActiveModal,
    private _toastService: ToastService
  ) {
    this.sendEmailForm = this._fb.group({
      to: [this.to ?? '', [Validators.required]],
      subject: [this.subject ?? '', [Validators.required]],
      body: [this.body, []],
    });
  }

  ngOnInit() {
    this.sendEmailForm.setValue({
      to: this.to || '',
      subject: this.subject || '',
      body: this.body || '',
    });
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  close() {
    this.activeModal.dismiss('close_click');
  }

  public sendEmail() {
    this.loading = true;

    this._serviceEmail
      .sendEmail({
        ...this.sendEmailForm.value,
        companyId: this.companyId,
        transactionId: this.transactionId,
        items: this.items,
      })
      .subscribe({
        next: (result) => {
          this._toastService.showToast(result);
        },
        error: (err) => {
          this._toastService.showToast(err);
        },
        complete: () => {
          this.loading = false;
          this.close();
        },
      });
  }
}
