import { atom } from "recoil";

export const userNotifications = atom<any[]>({
  key: "userNotifications",
  default: [],
});
