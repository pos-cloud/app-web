import { CommonModule } from '@angular/common';
import { AfterViewChecked, Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AiChatService, ChatMessage } from '@core/services/ai-chat.service';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { finalize } from 'rxjs';

interface DisplayMessage extends ChatMessage {
  id: number;
}

@Component({
  selector: 'app-ai-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-chat-widget.component.html',
  styleUrls: ['./ai-chat-widget.component.scss'],
})
export class AiChatWidgetComponent implements AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer: ElementRef<HTMLDivElement>;

  public isOpen = false;
  public loading = false;
  public inputMessage = '';
  public messages: DisplayMessage[] = [];
  public suggestedQuestions = [
    '¿Cuáles fueron las ventas de hoy?',
    '¿Cómo van las ventas del mes?',
    '¿Qué productos se vendieron más?',
    '¿Qué artículos tienen stock bajo?',
  ];

  private messageId = 0;
  private shouldScrollToBottom = false;

  constructor(
    private _aiChatService: AiChatService,
    private _toastService: ToastService
  ) {}

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  public togglePanel(): void {
    this.isOpen = !this.isOpen;
  }

  public closePanel(): void {
    this.isOpen = false;
  }

  public sendMessage(text?: string): void {
    const message = (text ?? this.inputMessage).trim();
    if (!message || this.loading) return;

    this.inputMessage = '';
    this.addMessage('user', message);
    this.loading = true;

    const history: ChatMessage[] = this.messages
      .slice(0, -1)
      .map(({ role, content }) => ({ role, content }));

    this._aiChatService
      .sendMessage(message, history)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (result) => {
          this.addMessage('assistant', result.answer);
        },
        error: (error) => {
          const errorMessage =
            error?.error?.message ||
            error?.error?.error?.message ||
            'No pude procesar tu consulta. Intentá de nuevo.';

          this.addMessage('assistant', errorMessage);
          this._toastService.showToast(null, 'danger', 'Asistente IA', errorMessage);
        },
      });
  }

  public onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  public useSuggestion(question: string): void {
    this.sendMessage(question);
  }

  private addMessage(role: 'user' | 'assistant', content: string): void {
    this.messages.push({ id: ++this.messageId, role, content });
    this.shouldScrollToBottom = true;
  }

  private scrollToBottom(): void {
    const container = this.messagesContainer?.nativeElement;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }
}
