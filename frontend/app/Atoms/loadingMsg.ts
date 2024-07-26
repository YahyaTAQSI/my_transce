import { atom } from "recoil";

export const loadingMsg = atom<boolean>({
  key: "loadingMsg",
  default: false,
});
