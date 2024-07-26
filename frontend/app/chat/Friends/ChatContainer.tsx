import React from "react";
import { FriendMSG } from "./FriendMSG";
import "./ChatContainer.css";

import { useRecoilValue } from "recoil";
import { loggedUser } from "@/app/Atoms/logged";
export const ChatContainer = ({ messages }: { messages: any }) => {
  // const options = { month: "long", day: "numeric", year: "numeric" };
  // const date = new Date(messages?.date).toLocaleString(
  //   "en-US",
  //   options as Intl.DateTimeFormatOptions
  // );
  const loggedU = useRecoilValue(loggedUser);

  return (
    <div className="chat_container">
      {/* <h1 className="chat_todays_date">{date}</h1> */}
      {loggedU !== messages.userID && messages.isBlocked ? (
        ""
      ) : (
        <FriendMSG key={messages.createdAT} message={messages} />
      )}
    </div>
  );
};
