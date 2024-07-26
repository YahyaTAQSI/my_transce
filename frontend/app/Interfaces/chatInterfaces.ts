export interface chatMessage {
  id: number;
  userID: number;
  channelID: number;
  content: string;
  isBlocked: boolean;
  createdAT: Date;
}

enum roles {
  ADMIN,
  USER,
  OWNER,
}

enum conditions {
  MUTED,
  BLOCKED,
  NORMAL,
}

export interface newRole {
  id: number;
  channelID: number;
  userID: number;
  blocked: boolean;
  role: roles;
  mutedSince: Date;
  condition: conditions;
  updatedAt: Date;
}

enum Ranks {
  Beginner,
  Intermediate,
  Expert,
  Master,
  Grandmaster,
  Apex,
}

enum UserStatus {
  online,
  offline,
  ingame,
}

export interface channelData {
  id: number;
  roles: userInterface[];
  lastMSG: string;
  sendAT: Date;
}

export interface userInterface {
  uid: number;
  status: UserStatus;
  username: String;
  email: String;
  bio: String;
  password: String;
  twoFA: Boolean;
  avatar: String;
  paddle: String;
  banner: String;
  wallet: number;
  xp: number;
  rank: Ranks;
  role: String;
  strategy: String;
  twoFASecret: String;
}
