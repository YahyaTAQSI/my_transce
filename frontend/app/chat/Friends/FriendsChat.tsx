import React, { useEffect, useState } from "react";
import "./FriendsChat.css";
import FriendChat from "./FriendChat";

import { useRecoilState, useRecoilValue } from "recoil";
import { loggedUser } from "@/app/Atoms/logged";

import { userToken } from "@/app/Atoms/userToken";

import { channelId } from "@/app/Atoms/channelId";
import { chatMSG } from "@/app/Atoms/chatMSG";
import { useSocket } from "@/app/SubChildrens";

import {
  channelData,
  chatMessage,
  newRole,
  userInterface,
} from "@/app/Interfaces/chatInterfaces";

export default function FriendsChat() {
  const { socket } = useSocket();

  const UID = useRecoilValue(loggedUser);
  const userTok = useRecoilValue(userToken);
  const [myFriends, setMyFriends] = useState<channelData[]>([]);
  const channelID = useRecoilValue(channelId);
  const [friendChat, setFriendChat] = useRecoilState<chatMessage[]>(chatMSG);

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (message: chatMessage) => {
      if (!message) return;
      if (message?.channelID === channelID)
        setFriendChat((prevMessages: chatMessage[]) => [
          ...prevMessages,
          message,
        ]);

      setMyFriends((prev: channelData[]) =>
        prev.map((f: channelData) =>
          f.id === message?.channelID
            ? { ...f, lastMSG: message.content, sendAT: message.createdAT }
            : f
        )
      );
    };
    socket.on("message", handleReceiveMessage);
    return () => {
      socket.off("message");
    };
  });

  useEffect(() => {
    if (!socket) return;

    const handleBlockedFriend = (friend: newRole) => {
      if (!friend) return;
      setMyFriends((prev: channelData[]) => {
        return prev.map((channel: channelData) => {
          if (channel.id === friend.channelID) {
            const updatedRoles = channel.roles.map((role: userInterface) => {
              if (role.uid === friend.userID) {
                return { ...role, blocked: friend.blocked };
              }
              return role;
            });
            return { ...channel, roles: updatedRoles };
          }
          return channel;
        });
      });
    };
    socket.on("update_blocked_friend", handleBlockedFriend);
    return () => {
      socket.off("update_blocked_friend");
    };
  });

  useEffect(() => {
    if (!socket) return;

    const handleNewFriendStatus = (friend: userInterface) => {
      if (!friend) return;
      setMyFriends((prev: channelData[]) => {
        return prev.map((channel: channelData) => {
          const updatedRoles = channel.roles.map((role: userInterface) => {
            if (role.uid === friend.uid) return friend;
            return role;
          });
          return { ...channel, roles: updatedRoles };
        });
      });
    };

    socket.on("update_friend_status", handleNewFriendStatus);
    return () => {
      socket.off("update_friend_status");
    };
  });

  useEffect(() => {
    myFriends.sort((a: channelData, b: channelData) => {
      return new Date(b.sendAT).getTime() - new Date(a.sendAT).getTime();
    });
  });

  useEffect(() => {
    if (!socket) return;

    const updateFriends = (friend: channelData) => {
      getMyFriends();
    };
    socket.on("update_friend_list", updateFriends);
    return () => {
      socket.off("update_friend_list");
    };
  });

  const getMyFriends = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/channels/dm/${UID}`, {
        headers: {
          Authorization: `Bearer ${userTok}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      await data.sort((a: channelData, b: channelData) => {
        return new Date(b.sendAT).getTime() - new Date(a.sendAT).getTime();
      });
      setMyFriends(data);
    } catch (error) {
      console.log("Error111");
    }
  };
  useEffect(() => {
    getMyFriends();
  }, []);

  return (
    <div className="friends_chat_container">
      {myFriends.length > 0 &&
        myFriends.map((f: channelData) => (
          <FriendChat key={f.id} friendData={f} />
        ))}
    </div>
  );
}
