export type FriendData = {
  name: string;
  status: string;
  avatar: string;
  lastMSG: string;
  uid: string;
  blocked: boolean;
  bio: string;
  rank: string;
  rankBadge: string;
  achievements: Array<{
    name: string;
    description: string;
    uri: string;
    date: string;
    unlocked: boolean;
  }>;
};
