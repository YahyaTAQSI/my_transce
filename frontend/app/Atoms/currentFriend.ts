import { atom } from "recoil";
import { FriendData } from "../Interfaces/friendDataInterface";
export const currentFriend = atom<any>({
  key: "currentFriend",
  default: {} as any,
});
