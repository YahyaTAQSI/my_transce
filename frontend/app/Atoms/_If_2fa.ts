import { atom } from "recoil";
import { recoilPersist } from "recoil-persist";
import Cookies from "js-cookie";

const { persistAtom } = recoilPersist({
  key: "userData",
  storage: {
    getItem: (key: string): string | Promise<string | null> | null => {
      const value = Cookies.get(key);
      return value !== undefined ? value : null;
    },
    setItem: (key: string, value: string) => {
      Cookies.set(key, value, { expires: 7, path: "/" });
    },
  },
});

export const twoFA = atom<boolean>({
  key: "twoFA",
  default: false,
  effects_UNSTABLE: [persistAtom],
});
