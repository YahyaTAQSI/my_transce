interface Achievement {
  name: string;
  description: string;
  uri: string;
  date: string;
  unlocked: boolean;
}
interface AvatarsAndPaddles {
  id: number;
  paddle?: string;
  avatar?: string;
  name: string;
  description: string;
  price: number;
  owned: boolean;
  power?: string;
  choosed: boolean;
}
interface Statistic {
  level: number;
  points: number;
  rank: string;
  win: number;
  lose: number;
  resign: number;
  wlr: number;
}
interface Matches {
  todaysDate: string;
  todaysMatches: Array<{
    hour: string;
    opponent: string;
    result: string;
    mygoals: number;
    opponentgoals: number;
  }>;
}
interface Stats {
  date: string;
  win: number;
  lose: number;
}

export type PlayerInfo = {
  uid: number;
  status: string;
  username: string;
  email: string;
  bio: string;
  password: string;
  TwoFA: boolean;
  choosedProfileImage: string;
  choosedBanner: string;
  achievements: Achievement[];
  avatarsAndPaddles: AvatarsAndPaddles[];
  statistic: Statistic;
  matches: Matches[];
  stats: Stats[];
};
