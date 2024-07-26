export enum NotificationType {
  gameReq,
  friendReq,
}
export type Notification = {
  id: number;
  type: NotificationType;
  content: string;
  createdAt: Date;
  read: boolean;
  ruserId: number;
  suserId: number;
};
