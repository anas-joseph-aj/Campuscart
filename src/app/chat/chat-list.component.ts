import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../services/api.service';
import { ChatItem } from './chat.models';

@Component({
  selector: 'app-chat-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: '<div>Chat List Placeholder</div>',
  styles: [],
})
export class ChatListComponent implements OnInit {
  @Output() chatSelected = new EventEmitter<ChatItem>();
  chats: ChatItem[] = [];
  currentUserEmail: string = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    const profile = JSON.parse(localStorage.getItem('profile') || '{}');
    this.currentUserEmail = profile.email || '';
    if (this.currentUserEmail) {
      this.api.getUserChats(this.currentUserEmail).subscribe((data: any) => {
        this.chats = data.map((c: any) => ({
          senderEmail: c.senderEmail || c.sender,
          receiverEmail: c.receiverEmail || c.receiver,
          lastMessage: c.lastMessage || c.message,
          timestamp: c.timestamp
        }));
      });
    }
  }

  selectChat(chat: ChatItem): void {
    this.chatSelected.emit(chat);
  }
}
