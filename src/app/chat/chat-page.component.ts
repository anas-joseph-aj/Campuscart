import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ChatListComponent } from './chat-list.component';
import { ChatConversationComponent } from './chat-conversation.component';
import { ChatItem } from './chat.models';

@Component({
  selector: 'app-chat-page',
  standalone: true,
  imports: [CommonModule, RouterModule, ChatListComponent, ChatConversationComponent],
  template: '<div>Chat Page Placeholder</div>',
  styles: []
})
export class ChatPageComponent {
  selectedChat: ChatItem | null = null;

  onSelectChat(chat: ChatItem): void {
    this.selectedChat = chat;
  }
}
