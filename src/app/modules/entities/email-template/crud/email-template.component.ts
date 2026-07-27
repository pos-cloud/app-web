import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EmailTemplateService } from '@core/services/email-template.service';
import { TranslateModule } from '@ngx-translate/core';
import { mergeTinymceInit } from '@shared/rich-text/tinymce-wysiwyg.config';
import { EditorModule } from '@tinymce/tinymce-angular';
import { ApiResponse, EmailTemplate } from '@types';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { FocusDirective } from 'app/shared/directives/focus.directive';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-email-template',
  templateUrl: './email-template.component.html',
  styleUrls: ['./email-template.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FocusDirective, PipesModule, TranslateModule, EditorModule],
})
export class EmailTemplateComponent implements OnInit, AfterViewInit, OnDestroy {
  public operation: string;
  public emailTemplateForm: UntypedFormGroup;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public emailTemplate: EmailTemplate;
  private destroy$ = new Subject<void>();

  readonly tinymceDesignInit = mergeTinymceInit({
    height: 280,
    width: '100%',
  });

  constructor(
    private _emailTemplateService: EmailTemplateService,
    private _fb: UntypedFormBuilder,
    private _router: Router,
    private _toastService: ToastService
  ) {
    this.emailTemplateForm = this._fb.group({
      _id: ['', []],
      name: ['', [Validators.required]],
      design: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    const pathUrl = this._router.url.split('/');
    this.operation = pathUrl[3];
    const emailTemplateId = pathUrl[4];

    if (this.operation === 'view' || this.operation === 'delete') {
      this.emailTemplateForm.disable();
    }
    if (emailTemplateId) {
      this.getEmailTemplate(emailTemplateId);
    }
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.focusEvent.complete();
  }

  getEmailTemplate(id: string): void {
    this.loading = true;
    this._emailTemplateService
      .getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this.emailTemplate = result.result;
          this.setValueForm();
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  setValueForm(): void {
    this.emailTemplateForm.patchValue({
      _id: this.emailTemplate?._id ?? '',
      name: this.emailTemplate?.name ?? '',
      design: this.emailTemplate?.design ?? '',
    });
  }

  returnTo() {
    return this._router.navigate(['/entities/email-templates']);
  }

  async handleEmailTemplateOperation() {
    this.loading = true;

    this.emailTemplateForm.markAllAsTouched();
    if (this.emailTemplateForm.invalid) {
      this.loading = false;
      return;
    }

    this.emailTemplate = this.emailTemplateForm.getRawValue();

    switch (this.operation) {
      case 'add':
        this.saveEmailTemplate();
        break;
      case 'update':
        this.updateEmailTemplate();
        break;
      case 'delete':
        this.deleteEmailTemplate();
        break;
    }
  }

  saveEmailTemplate(): void {
    this._emailTemplateService
      .save(this.emailTemplate)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this._toastService.showToast(result);
          if (result.status === 200) this.returnTo();
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  updateEmailTemplate(): void {
    this._emailTemplateService
      .update(this.emailTemplate)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this._toastService.showToast(result);
          if (result.status === 200) this.returnTo();
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  deleteEmailTemplate() {
    this._emailTemplateService
      .delete(this.emailTemplate._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this._toastService.showToast(result);
          if (result.status === 200) this.returnTo();
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }
}
