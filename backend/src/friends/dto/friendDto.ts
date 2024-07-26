import { $Enums } from "@prisma/client";

export type FriendDto = {
  user1Id: number;
  user2Id: number;
  status?: $Enums.Status
};
