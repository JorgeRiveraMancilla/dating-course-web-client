export interface Message {
  id: number;
  senderId: number;
  senderUserName: string;
  recipientId: number;
  recipientUserName: string;
  content: string;
  dateRead?: Date;
  messageSent: Date;
  senderDeleted: boolean;
  recipientDeleted: boolean;
}
