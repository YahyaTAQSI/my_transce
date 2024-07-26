export interface CHANNEL_DATA {
  avatar: string;
  channel_id: number;
  channel_name: string;
  members_number: number;
  topic: string;
  lastmsg: string;
  members: {
    id: number;
    type: string;
    name: string;
    avatar: string;
  }[];
  messages: {
    id: number;
    time: number;
    msg: string;
    recipient: boolean;
    avatar: string;
  }[];
}
