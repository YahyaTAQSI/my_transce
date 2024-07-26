"use client";
import React, { useEffect, useState } from "react";
import "./notification.css";
import Image from "next/image";
import TimeAgo from "react-timeago";
import { useRecoilState, useRecoilValue } from "recoil";
import { userNotifications } from "../Atoms/notifications";
import { userToken } from "../Atoms/userToken";
import { loggedUser } from "../Atoms/logged";
import { socket } from "../sockets/socket";

function Notification({ notif }: { notif: any }) {
  const userTok = useRecoilValue(userToken);
  const loggedU = useRecoilValue(loggedUser);

  const [myNotifications, setMyNotifications] =
    useRecoilState(userNotifications);

  useEffect(() => {
    const handleDeletedNotification = (notif: any) => {
      if (notif.ruserId === loggedU)
        setMyNotifications((prevNotifications) =>
          prevNotifications.filter((ntfc) => ntfc.id !== notif?.id)
        );
    };
    socket.on("delete_notification", handleDeletedNotification);
    return () => {
      socket.off("delete_notification");
    };
  }, []);

  const handleJoin = async (uid: number, channelId: number) => {
    await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/channelss/joinpublic?userID=${uid}&channelID=${channelId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${userTok}`,
          "Content-Type": "application/json",
        },
      }
    ).then(() => {
      deleteNotificatio();
    });
  };

  const deleteNotificatio = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/notifications/${notif?.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${userTok}`,
          "Content-Type": "application/json",
        },
      });
    } catch (error: any) {
      console.log("Error deleting notification:", error.message);
    }
  };

  const acceptFriend = async () => {
    const friendDto = {
      user1Id: notif?.ruserId,
      user2Id: notif?.suserId,
      status: "ACCEPTED",
    };

    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/friends`, {
        method: "POST",
        body: JSON.stringify(friendDto),
        headers: {
          Authorization: `Bearer ${userTok}`,
          "Content-Type": "application/json",
        },
      }).then(() => {
        deleteNotificatio();
      });
    } catch (error: any) {
      console.log("Error deleting notification:", error.message);
    }
  };

  const handdleAccept = () => {
    if (notif.type == "channelReq") {
      handleJoin(notif.ruserId, notif.chnnelId);
    } else {
      acceptFriend();
    }
  };

  return (
    <div className="notification_container">
      <Image
        className="notification_avatar"
        src={`${notif?.suser?.avatar}`}
        width={50}
        height={50}
        alt="avatar"
      />
      <div className="notification_section">
        <p>
          <span className="notification_frind_name">
            {notif?.suser?.username}
          </span>
          {notif?.content}
        </p>
        <span className="time_ago">
          <TimeAgo date={notif?.createdAt} />
        </span>
        <div className="notification_accept">
          <button onClick={handdleAccept} className="notification_btns">
            accept
          </button>
          <button onClick={deleteNotificatio} className="notification_btns">
            deny
          </button>
        </div>
      </div>
    </div>
  );
}

export default Notification;
