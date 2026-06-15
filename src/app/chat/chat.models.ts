export interface ChatItem {
  senderEmail: string;
  receiverEmail: string;
  lastMessage: string;
  timestamp: string;
}

export interface Message {
  senderEmail: string;
  receiverEmail: string;
  content: string;
  timestamp: string;
}
