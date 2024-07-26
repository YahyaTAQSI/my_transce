import { atom } from "recoil";
import { chatMessage } from "../Interfaces/chatInterfaces";

export const chatMSG = atom<chatMessage[]>({
  key: "chatMSG",
  default: [],
});
