import React, { useEffect, useState } from "react";
import "./Friends.css";
import Friend from "./Friend";
import friendData from "../data/friends.json";
import { FriendData } from "@/app/Interfaces/friendDataInterface";
import { useRecoilValue } from "recoil";
import { loggedUser } from "../Atoms/logged";
import { userToken } from "../Atoms/userToken";
import AddFriendSection from "../chat/Friends/AddFriendSection";
import "../chat/chat.css";
import "../chat/Friends/AddFriend.css";
import { useSocket } from "../SubChildrens";
import {
  channelData,
  newRole,
  userInterface,
} from "../Interfaces/chatInterfaces";

export default function Friends({ whichProfile }: { whichProfile: any }) {
  const { socket } = useSocket();
  const UID = useRecoilValue(loggedUser);

  const userTok = useRecoilValue(userToken);
  const [userFriends, setUserFriends] = useState<any[]>([]);
  console.log("friend array>>>", userFriends);

  useEffect(() => {
    if (!socket) return;
    const handleBlockedFriend = (friend: newRole) => {
      setUserFriends((prev: channelData[]) => {
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
      setUserFriends((prev: channelData[]) => {
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
    if (!socket) return;
    const updateFriends = (friend: any) => {
      getUserData();
    };

    socket.on("update_friend_list", updateFriends);
    return () => {
      socket.off("update_friend_list");
    };
  }, []);

  const getUserData = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/channels/dm/${whichProfile}`,
        {
          headers: {
            Authorization: `Bearer ${userTok}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await res.json();
      console.log("===========>>>>>>", data);

      setUserFriends(data);
    } catch (error: any) {
      console.log("--->>>", error.message);
    }
  };
  useEffect(() => {
    getUserData();
  }, [whichProfile]);

  return (
    <div className="friends_container">
      {userFriends?.length > 0 &&
        userFriends?.map((e: channelData) => (
          <Friend whichProfile={whichProfile} friend={e} key={e.id} />
        ))}
    </div>
  );
}
