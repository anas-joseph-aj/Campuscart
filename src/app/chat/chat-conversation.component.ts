import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { ChatItem } from './chat.models';

interface Message {
  senderEmail: string;
  receiverEmail: string;
  content: string;
  timestamp: string;
}

@Component({
  selector: 'app-chat-conversation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: '<div>Chat Conversation Placeholder</div>',
  styles: []
})
export class ChatConversationComponent implements OnChanges {
  @Input() chat!: ChatItem | null;

  messages: Message[] = [];
  newMessage: string = '';

  constructor(private api: ApiService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['chat'] && this.chat) {
      this.loadMessages();
    }
  }

  loadMessages(): void {
    const senderEmail = this.chat!.senderEmail || this.chat!.sender;
    const receiverEmail = this.chat!.receiverEmail || this.chat!.receiver;
    this.api.getConversation(senderEmail, receiverEmail).subscribe((data: any) => {
      this.messages = data as Message[];
    });
  }

  send(): void {
    if (!this.newMessage.trim() || !this.chat) return;
    const payload = {
      senderEmail: this.chat.senderEmail || this.chat.sender,
      receiverEmail: this.chat.receiverEmail || this.chat.receiver,
      content: this.newMessage.trim()
    };
    this.api.sendMessage(payload).subscribe(() => {
      this.newMessage = '';
      this.loadMessages();
    });
  }
}
