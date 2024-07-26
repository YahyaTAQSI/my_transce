import React from "react";
import "./FriendMSG.css";
import { ChatMSG } from "@/app/Interfaces/friendChat";
import { useRecoilValue } from "recoil";
import { loggedUser } from "@/app/Atoms/logged";
export const FriendMSG = ({ message }: { message: any }) => {
  const loggedU = useRecoilValue(loggedUser);

  const options = { hour: "2-digit", minute: "2-digit" };
  const date = new Date(message?.createdAT).toLocaleString(
    "en-US",
    options as Intl.DateTimeFormatOptions
  );

  return (
    <div
      className={`chat_msg_container ${
        message?.userID !== loggedU && "sender chat_msg_container2"
      }`}
    >
      <p className="chat_message">{message?.content}</p>
      <span
        className={`friend_msg_time ${
          message?.userID !== loggedU && "sender_time"
        }`}
      >
        {date}
      </span>
    </div>
  );
};
