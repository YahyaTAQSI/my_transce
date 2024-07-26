export type ChannelDto = {
  name: string;
  topic: string;
  id: number;
  friendId: number;
};

export type updateChannelDto = {
  channelID: number;
  friendId: number;
  blocked: boolean;
};

export type channelData = {
  id: number;
  roles: any[];
  lastMSG: string;
  sendAT: Date;
};
