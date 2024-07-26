import { atom } from "recoil";

export const userAvatar = atom<string>({
  key: "userAvatar",
  default: `${process.env.NEXT_PUBLIC_BACKEND_URL}/default.png`,
});
