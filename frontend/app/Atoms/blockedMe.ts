import { atom } from "recoil";

export const blockedMe = atom<boolean>({
  key: "blockedMe",
  default: false,
});
