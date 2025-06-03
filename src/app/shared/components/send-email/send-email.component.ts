import { AfterViewInit, Component, EventEmitter, Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FocusDirective } from '@shared/directives/focus.directive';
import { PipesModule } from '@shared/pipes/pipes.module';
import { QuillModule } from 'ngx-quill';
import { EmailService } from '../../../core/services/send-email.service';
import { ToastService } from '../toast/toast.service';

@Component({
  selector: 'app-send-email',
  templateUrl: './send-email.component.html',
  standalone: true,
  imports: [FormsModule, QuillModule, CommonModule, FocusDirective, ReactiveFormsModule, PipesModule, TranslateModule],
})
export class SendEmailComponent implements AfterViewInit {
  sendEmailForm: UntypedFormGroup;
  loading: boolean = false;
  focusEvent = new EventEmitter<boolean>();
  @Input() to: string;
  @Input() subject: string = '';
  @Input() body: string = '';
  @Input() companyId: string = '';
  @Input() transactionId: string = '';

  quillConfig = {
    formats: ['bold', 'italic', 'underline', 'strike', 'list', 'link'],
    modules: {
      toolbar: [
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        ['link', 'image', 'video', 'formula'],
        [{ header: 1 }, { header: 2 }],
        [{ list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
        [{ script: 'sub' }, { script: 'super' }],
        [{ indent: '-1' }, { indent: '+1' }],
        [{ direction: 'rtl' }],

        [{ size: ['small', false, 'large', 'huge'] }],
        [{ header: [1, 2, 3, 4, 5, 6, false] }],

        [{ color: [] }, { background: [] }],
        [{ font: [] }],
        [{ align: [] }],

        ['clean'],
      ],
      imageResize: {
        displayStyles: {
          backgroundColor: 'black',
          border: 'none',
          color: 'white',
        },
        modules: ['Resize', 'DisplaySize', 'Toolbar'],
      },
    },
    placeholder: 'Escribe aqui...',
    theme: 'snow',
    readOnly: false,
  };

  constructor(
    private _serviceEmail: EmailService,
    private _fb: UntypedFormBuilder,
    private activeModal: NgbActiveModal,
    private _toastService: ToastService
  ) {
    this.sendEmailForm = this._fb.group({
      to: [this.to ?? '', [Validators.required]],
      subject: [this.subject ?? '', [Validators.required]],
      body: [this.body ?? '', []],
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
        },
      });
  }
}
