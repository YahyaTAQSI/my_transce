export type ChatMSG = {
  time: number;
  msg: string;
  recipient: boolean;
};
export type FriendChatMSG = {
  date: number;
  messages: ChatMSG[];
};
export type FriendChat = {
  uid: string;
  allmessages: FriendChatMSG[];
};
