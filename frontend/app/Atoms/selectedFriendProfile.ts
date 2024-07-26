import { atom } from "recoil";

export const selectedFriendProfile = atom<number>({
  key: "selectedFriendProfile",
  default: -1,
});
