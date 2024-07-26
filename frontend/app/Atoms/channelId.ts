import { atom } from "recoil";

export const channelId = atom<number>({
  key: "channelId",
  default: -1,
});
